const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../public/js/common.js'), 'utf8');

function setup ()
 { const initials = { textContent: '' };
   const tooltipTarget = { tooltip: null };
   const menu = {
     attributes: {}, listeners: {},
     setAttribute (name, value) { this.attributes[name] = value; },
     getAttribute (name) { return this.attributes[name]; },
     addEventListener (name, callback) { (this.listeners[name] ||= []).push(callback); }
   };
   class Tooltip
    { constructor (element, options) { element.tooltip = this; this.options = options; this.hides = 0; }
      static getInstance (element) { return element.tooltip || null; }
      setContent (content) { this.content = content['.tooltip-inner']; }
      hide () { this.hides++; }
    }
   const context = {
     document: {
       addEventListener () {},
       getElementById: id => id === 'idUsername' ? initials : id === 'navbarUSER' ? menu : tooltipTarget
     },
     window: { addEventListener () {} },
     bootstrap: { Tooltip }
   };
   vm.runInNewContext(source, context);
   return { initials, menu, tooltipTarget, render (claims) { context.TokenParsed = claims; context.Set_user_menu(); } };
 }

test('shows initials and the full name for accented and compound names', () =>
 { const app = setup();
   app.render({ given_name: '  E\u0301lodie-Marie ', family_name: ' du Pont  ' });
   assert.equal(app.initials.textContent, 'ÉD');
   assert.equal(app.menu.getAttribute('aria-label'), 'E\u0301lodie-Marie du Pont');
   assert.equal(app.tooltipTarget.tooltip.content, 'E\u0301lodie-Marie du Pont');
 });

test('handles missing name claims and falls back to the available identity', () =>
 { const app = setup();
   const cases = [
     [{ given_name: 'Jean', name: 'Jean Dupont' }, 'J', 'Jean Dupont'],
     [{ family_name: 'Dupont' }, 'D', 'Dupont'],
     [{ name: '  Jean  Dupont  ' }, 'JD', 'Jean  Dupont'],
     [{ preferred_username: 'jean.d' }, 'J', 'jean.d'],
     [{ email: 'jean@example.test' }, 'J', 'jean@example.test'],
     [{ given_name: null, family_name: '', name: undefined }, '?', 'Utilisateur inconnu']
   ];
   for (const [claims, initials, name] of cases)
    { app.render(claims);
      assert.equal(app.initials.textContent, initials);
      assert.equal(app.menu.getAttribute('aria-label'), name);
      assert.equal(app.tooltipTarget.tooltip.content, name);
    }
 });

test('refreshes the existing tooltip and hides it when the dropdown opens', () =>
 { const app = setup();
   app.render({ given_name: 'Anne', family_name: 'Martin' });
   const tooltip = app.tooltipTarget.tooltip;
   app.render({ given_name: 'Luc', family_name: 'Durand' });
   assert.equal(app.tooltipTarget.tooltip, tooltip);
   assert.equal(app.menu.tooltip, undefined);
   assert.equal(tooltip.options.title(), 'Luc Durand');
   assert.equal(tooltip.content, 'Luc Durand');
   assert.equal(app.menu.listeners['show.bs.dropdown'].length, 1);
   app.menu.listeners['show.bs.dropdown'][0]();
   assert.equal(tooltip.hides, 1);
 });
