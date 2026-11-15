const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../public/js/voice.js'), 'utf8');

function setup (options = {})
 { const elements = {};
   for (const id of ['idVoiceButton', 'idVoiceIcon', 'idVoiceCancel', 'idVoiceElapsed', 'idVoiceStatus'])
    { elements[id] = { attrs: {}, listeners: {}, classList: { toggle () {} },
                       setAttribute (name, value) { this.attrs[name] = value; },
                       addEventListener (name, callback) { this.listeners[name] = callback; } }; }
   const documentListeners = {};
   const windowListeners = {};
   const requests = [];
   const errors = [];
   const messages = [];
  const timeouts = [];
   let clock = 0;
   let domain = 'domain-1';
   let stopped = 0;
   let activeRecorder;
   const track = { stop () { stopped++; }, addEventListener (name, callback) { this[name] = callback; } };
   const stream = { getTracks () { return [track]; }, getAudioTracks () { return [track]; } };
   class Recorder
    { static isTypeSupported (type) { return (options.types || ['audio/webm;codecs=opus']).includes(type); }
      constructor (input, config) { this.mimeType = config.mimeType; this.state = 'inactive'; activeRecorder = this; }
      start () { this.state = 'recording'; }
      stop ()
       { this.state = 'inactive';
         queueMicrotask(() => { this.ondataavailable({ data: new Blob(['audio']) }); this.onstop(); });
       }
    }
   const document = { hidden: false, getElementById: id => elements[id],
                      addEventListener (name, callback) { documentListeners[name] = callback; } };
   const window = { isSecureContext: options.secure !== false, MediaRecorder: Recorder, AbortController,
                    addEventListener (name, callback) { windowListeners[name] = callback; } };
   const context = { window, document, navigator: { mediaDevices: { getUserMedia: options.getUserMedia || (() => Promise.resolve(stream)) } },
                     MediaRecorder: Recorder, AbortController, Blob, performance: { now: () => clock },
                     setInterval: () => 1, clearInterval () {},
                     setTimeout: callback => { timeouts.push(callback); return timeouts.length; }, clearTimeout () {},
                     localStorage: { getItem: () => domain }, $ABLS_API: 'https://api.example',
                     Keycloak_client: { authenticated: true, token: 'new-token', updateToken: options.updateToken || (async () => true) },
                     fetch: async (url, request) => { requests.push({ url, request }); return { ok: true, json: async () => ({}) }; },
                     Show_shell_error: message => errors.push(message), Show_toast_ok: message => messages.push(message) };
   vm.runInNewContext(source, context);
   documentListeners.DOMContentLoaded();
  return { elements, document, documentListeners, windowListeners, requests, errors, messages, track, stream, timeouts,
            stopped: () => stopped, recorder: () => activeRecorder,
            setClock: value => { clock = value; }, setDomain: value => { domain = value; } };
 }

const flush = () => new Promise(resolve => setImmediate(resolve));

test('records and sends WebM with the current token and domain', async () =>
 { const app = setup();
   app.elements.idVoiceButton.listeners.click();
   await flush();
   app.setClock(1000);
   app.elements.idVoiceButton.listeners.click();
   await flush();
   assert.equal(app.stopped(), 1);
   assert.equal(app.requests.length, 1);
   assert.equal(app.requests[0].url, 'https://api.example/voice');
   assert.equal(app.requests[0].request.headers['Content-Type'], 'audio/webm;codecs=opus');
   assert.equal(app.requests[0].request.headers.Authorization, 'Bearer new-token');
   assert.equal(app.requests[0].request.headers['X-ABLS-DOMAIN'], 'domain-1');
   assert.equal(await app.requests[0].request.body.text(), 'audio');
   assert.equal(app.messages.length, 1);
 });

test('falls back to MP4 and rejects recordings that are too short', async () =>
 { const app = setup({ types: ['audio/mp4'] });
   app.elements.idVoiceButton.listeners.click();
   await flush();
   assert.equal(app.recorder().mimeType, 'audio/mp4');
   app.setClock(200);
   app.elements.idVoiceButton.listeners.click();
   await flush();
   assert.equal(app.requests.length, 0);
   assert.match(app.errors[0], /trop court/);
 });

test('uploads MP4 when WebM is unavailable', async () =>
 { const app = setup({ types: ['audio/mp4'] });
   app.elements.idVoiceButton.listeners.click();
   await flush();
   app.setClock(1000);
   app.elements.idVoiceButton.listeners.click();
   await flush();
   assert.equal(app.requests[0].request.headers['Content-Type'], 'audio/mp4');
 });

test('times out a pending token refresh without sending later', async () =>
 { let refresh;
   const app = setup({ updateToken: () => new Promise(resolve => { refresh = resolve; }) });
   app.elements.idVoiceButton.listeners.click();
   await flush();
   app.setClock(1000);
   app.elements.idVoiceButton.listeners.click();
   await flush();
   app.timeouts[1]();
   await flush();
   refresh(true);
   await flush();
   assert.equal(app.requests.length, 0);
   assert.match(app.errors[0], /Délai dépassé/);
 });

test('cancelled permission request releases a late microphone stream', async () =>
 { let resolveStream;
   const app = setup({ getUserMedia: () => new Promise(resolve => { resolveStream = resolve; }) });
   app.elements.idVoiceButton.listeners.click();
   app.elements.idVoiceCancel.listeners.click();
   resolveStream(app.stream);
   await flush();
   assert.equal(app.stopped(), 1);
   assert.equal(app.requests.length, 0);
   assert.equal(app.recorder(), undefined);
 });

test('backgrounding cancels recording without uploading', async () =>
 { const app = setup();
   app.elements.idVoiceButton.listeners.click();
   await flush();
   app.document.hidden = true;
   app.documentListeners.visibilitychange();
   await flush();
   assert.equal(app.stopped(), 1);
   assert.equal(app.requests.length, 0);
 });

test('does not send a command after changing domain', async () =>
 { const app = setup();
   app.elements.idVoiceButton.listeners.click();
   await flush();
   app.setDomain('domain-2');
   app.setClock(1000);
   app.elements.idVoiceButton.listeners.click();
   await flush();
   assert.equal(app.requests.length, 0);
   assert.match(app.errors[0], /domaine a changé/);
 });

test('reports incompatible formats without opening the microphone', () =>
 { let opened = false;
   const app = setup({ types: [], getUserMedia: () => { opened = true; } });
   app.elements.idVoiceButton.listeners.click();
   assert.equal(opened, false);
   assert.match(app.errors[0], /formats audio/);
 });

test('does not send a recording stopped unexpectedly', async () =>
 { const app = setup();
   app.elements.idVoiceButton.listeners.click();
   await flush();
   app.setClock(1000);
   app.recorder().stop();
   await flush();
   assert.equal(app.requests.length, 0);
   assert.equal(app.stopped(), 1);
   assert.match(app.errors[0], /interrompu/);
 });