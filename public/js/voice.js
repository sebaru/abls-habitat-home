 (function ()
  { 'use strict';

    var maxDuration = 30000;
    var requestTimeout = 120000;
    var state = 'idle';
    var stream = null;
    var recorder = null;
    var chunks = [];
    var startedAt = 0;
    var stoppedAt = 0;
    var timer = null;
    var limitTimer = null;
    var generation = 0;
    var domain = null;
    var activePointer = null;
    var activeKey = null;
    var button, icon, cancelButton, elapsed, status;

    function setState ( next, message )
     { state = next;
       var labels = { idle: 'Maintenir pour enregistrer une commande vocale',
                      requesting: 'Autorisation du microphone en attente',
                      recording: 'Relâcher pour envoyer la commande vocale', sending: 'Envoi de la commande vocale',
                      unavailable: 'Commande vocale indisponible' };
       button.setAttribute('aria-label', labels[next]);
       button.title = labels[next];
       button.disabled = (next === 'requesting' || next === 'sending');
       button.setAttribute('aria-disabled', next === 'unavailable' ? 'true' : 'false');
       button.classList.toggle('voice-recording', next === 'recording');
       icon.className = next === 'recording' ? 'fas fa-stop' :
                        next === 'requesting' || next === 'sending' ? 'fas fa-spinner fa-spin' : 'fas fa-microphone';
       cancelButton.hidden = (next !== 'requesting' && next !== 'recording');
       elapsed.hidden = (next !== 'recording');
       if (message) status.textContent = message;
     }

    function releaseStream ()
     { if (stream) { stream.getTracks().forEach(function (track) { track.stop(); }); stream = null; }
       clearInterval(timer);
       clearTimeout(limitTimer);
       timer = null;
       limitTimer = null;
     }

    function cancel ()
     { if (state !== 'requesting' && state !== 'recording') return;
       generation++;
       activePointer = null;
       activeKey = null;
       if (recorder && recorder.state !== 'inactive') recorder.stop();
       recorder = null;
       chunks = [];
       releaseStream();
       setState('idle', 'Enregistrement annulé.');
      if (document.activeElement === cancelButton) button.focus();
     }

    function finishHold ()
     { if (state === 'requesting') cancel();
       else if (state === 'recording') stop();
     }

    function errorMessage ( error )
     { if (error.name === 'NotAllowedError' || error.name === 'SecurityError')
        return 'Accès au microphone refusé. Autorisez-le dans les paramètres du navigateur.';
       if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError')
        return 'Aucun microphone disponible.';
       if (error.name === 'NotReadableError') return 'Le microphone est indisponible ou déjà utilisé.';
       return 'Impossible d’enregistrer la commande vocale.';
     }

    async function send ( blob, recordedDomain )
     { var controller = new AbortController();
       var aborted = new Promise(function (resolve, reject)
        { controller.signal.addEventListener('abort', function ()
          { var error = new Error('Délai dépassé.'); error.name = 'AbortError'; reject(error); }, { once: true });
        });
       var timeout = setTimeout(function () { controller.abort(); }, requestTimeout);
       try
        { if (!recordedDomain || localStorage.getItem('domain_uuid') !== recordedDomain)
           throw new Error('Le domaine a changé. La commande vocale n’a pas été envoyée.');
          if (!Keycloak_client || !Keycloak_client.authenticated)
           throw new Error('Votre session a expiré. Reconnectez-vous.');
          try { await Promise.race([Keycloak_client.updateToken(30), aborted]); }
          catch (error)
           { if (error.name === 'AbortError') throw error;
             throw new Error('Votre session a expiré. Reconnectez-vous.');
           }
          if (localStorage.getItem('domain_uuid') !== recordedDomain)
           throw new Error('Le domaine a changé. La commande vocale n’a pas été envoyée.');
          var response = await fetch($ABLS_API + '/voice/assistant',
           { method: 'POST', headers: { 'Content-Type': blob.type, 'Authorization': 'Bearer ' + Keycloak_client.token,
                                        'X-ABLS-DOMAIN': recordedDomain },
             body: blob, signal: controller.signal });
          var result = null;
          try { result = await response.json(); }
          catch (error) { if (error.name === 'AbortError') throw error; }
          if (!response.ok)
           { if (response.status === 401 || response.status === 403)
              throw new Error('Session expirée ou accès à la commande vocale refusé.');
             throw new Error(result && typeof result.api_error === 'string' ? result.api_error :
                             'La commande vocale a échoué (HTTP ' + response.status + ').');
           }
          var message = result && typeof result.message === 'string' ? result.message : 'Commande vocale envoyée.';
          setState('idle', message);
          Show_toast_ok(message);
        }
       catch (error)
        { var message = error.name === 'AbortError' ? 'Délai dépassé. La commande a peut-être été reçue par l’API.' :
                        error instanceof TypeError ? 'Erreur réseau. La commande a peut-être été reçue par l’API.' : error.message;
          setState('idle', message);
          Show_shell_error(message);
        }
       finally { clearTimeout(timeout); }
     }

    function stop ()
     { if (state !== 'recording' || !recorder || recorder.state === 'inactive') return;
       stoppedAt = performance.now();
       setState('sending', 'Préparation de la commande vocale.');
       recorder.stop();
       releaseStream();
     }

    async function start ()
     { var types = ['audio/webm;codecs=opus', 'audio/mp4'];
       var mimeType = types.find(function (type) { return MediaRecorder.isTypeSupported(type); });
       if (!mimeType)
        { setState('unavailable', 'Ce navigateur ne prend pas en charge les formats audio disponibles.');
          Show_shell_error(status.textContent); return;
        }
       domain = localStorage.getItem('domain_uuid');
       if (!domain) { Show_shell_error('Sélectionnez un domaine avant d’utiliser la commande vocale.'); return; }
       var current = ++generation;
       setState('requesting', 'Autorisation du microphone en attente.');
       try
        { var acquired = await navigator.mediaDevices.getUserMedia(
           { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
          if (current !== generation)
           { acquired.getTracks().forEach(function (track) { track.stop(); }); return; }
          stream = acquired;
          chunks = [];
          recorder = new MediaRecorder(stream, { mimeType: mimeType });
          var activeRecorder = recorder;
          activeRecorder.ondataavailable = function (event)
           { if (current === generation && event.data.size) chunks.push(event.data); };
          activeRecorder.onerror = function ()
           { if (current !== generation) return;
             generation++;
             chunks = [];
             releaseStream();
             recorder = null;
             setState('idle', 'Erreur lors de l’enregistrement.');
             Show_shell_error('Erreur lors de l’enregistrement.');
           };
          activeRecorder.onstop = function ()
           { if (current !== generation) return;
             if (state !== 'sending')
              { chunks = [];
                recorder = null;
                releaseStream();
                setState('idle', 'Enregistrement interrompu.');
                Show_shell_error('Enregistrement interrompu.'); return;
              }
             var duration = stoppedAt - startedAt;
             var blob = new Blob(chunks, { type: activeRecorder.mimeType || mimeType });
             chunks = [];
             recorder = null;
             releaseStream();
             if (duration < 500 || !blob.size)
              { setState('idle', 'Enregistrement trop court ou vide.');
                Show_shell_error('Enregistrement trop court ou vide.'); return;
              }
             send(blob, domain);
           };
          stream.getAudioTracks().forEach(function (track)
           { track.addEventListener('ended', function ()
              { if (current !== generation || state !== 'recording') return;
                cancel();
                setState('idle', 'Le microphone a été déconnecté.');
                Show_shell_error('Le microphone a été déconnecté.');
              });
           });
          activeRecorder.start();
          startedAt = performance.now();
          elapsed.textContent = '0:00';
          setState('recording', 'Enregistrement en cours.');
          timer = setInterval(function ()
           { var seconds = Math.floor((performance.now() - startedAt) / 1000);
             elapsed.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
           }, 250);
          limitTimer = setTimeout(function ()
           { if (state === 'recording') { stop(); status.textContent = 'Limite de 30 secondes atteinte. Envoi en cours.'; } }, maxDuration);
        }
       catch (error)
        { if (current !== generation) return;
          releaseStream();
          recorder = null;
          var message = errorMessage(error);
          setState('idle', message);
          Show_shell_error(message);
        }
     }

    document.addEventListener('DOMContentLoaded', function ()
     { button = document.getElementById('idVoiceButton');
       icon = document.getElementById('idVoiceIcon');
       cancelButton = document.getElementById('idVoiceCancel');
       elapsed = document.getElementById('idVoiceElapsed');
       status = document.getElementById('idVoiceStatus');
       if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ||
           !window.MediaRecorder || !MediaRecorder.isTypeSupported || !window.AbortController)
        { setState('unavailable', 'La commande vocale nécessite un navigateur compatible et une connexion sécurisée.'); }
       else setState('idle', '');
       button.addEventListener('pointerdown', function (event)
        { if (state !== 'idle' || activePointer !== null || event.button !== 0) return;
          activePointer = event.pointerId;
          if (typeof button.setPointerCapture === 'function') button.setPointerCapture(event.pointerId);
          start();
        });
       document.addEventListener('pointerup', function (event)
        { if (activePointer !== event.pointerId) return;
          activePointer = null;
          finishHold();
        });
       document.addEventListener('pointercancel', function (event)
        { if (activePointer !== event.pointerId) return;
          activePointer = null;
          finishHold();
        });
       button.addEventListener('keydown', function (event)
        { if ((event.key !== ' ' && event.key !== 'Enter') || event.repeat ||
              state !== 'idle' || activeKey !== null || activePointer !== null) return;
          event.preventDefault();
          activeKey = event.key;
          start();
        });
       document.addEventListener('keyup', function (event)
        { if (activeKey !== event.key) return;
          activeKey = null;
          finishHold();
        });
       cancelButton.addEventListener('click', cancel);
       document.addEventListener('keydown', function (event)
        { if (event.key === 'Escape' && (state === 'requesting' || state === 'recording')) cancel(); });
      document.addEventListener('visibilitychange', function () { if (document.hidden) cancel(); });
       window.addEventListener('pagehide', cancel);
     });
  })();