/* router.js — Routeur SPA pour ABLS Habitat Home
 * Gère la navigation côté client sans rechargement de page.
 * Écoute l'événement 'keycloak-ready' émis par common.js après l'authentification. */

var Router = (function () {

  /* Table des routes : ordre identique à app/Config/Routes.php (premier match gagne).
   * view  : nom du fichier dans /views/ (sans extension .html)
   * script: nom du fichier dans /js/   (sans extension .js), null si pas de script de page */
  var ROUTES = [
    { pattern: /^\/domains$/,     view: 'domains',    script: 'domains'    },
    { pattern: /^\/messages$/,    view: 'messages',   script: 'messages'   },
    { pattern: /^\/historique$/,  view: 'historique', script: 'historique' },
    { pattern: /^\/.*$/,          view: 'home',       script: 'home'       },  /* catch-all */
  ];

  /* Élément <script> de la page courante — retiré à chaque navigation */
  var currentPageScript = null;

  function matchRoute(path) {
    var pathname = path.split('?')[0].split('#')[0];
    var cleanPath = (pathname.length > 1) ? pathname.replace(/\/$/, '') : pathname;
    for (var i = 0; i < ROUTES.length; i++) {
      if (ROUTES[i].pattern.test(cleanPath)) return ROUTES[i];
    }
    return null;
  }

  /* Détruit les instances DataTable existantes avant de changer de vue */
  function destroyDataTables() {
    if (typeof $ !== 'undefined' && $.fn && $.fn.DataTable) {
      try { $.fn.dataTable.tables({ api: true }).destroy(); } catch (e) {}
    }
  }

  function navigate(path) {
    var route = matchRoute(path);
    if (!route) { console.warn('Router: aucune route pour', path); return; }

    destroyDataTables();

    fetch('/views/' + route.view + '.html')
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.text();
      })
      .then(function (html) {
        document.getElementById('app').innerHTML = html;

        /* Retire le script de la page précédente */
        if (currentPageScript) {
          currentPageScript.parentNode && currentPageScript.parentNode.removeChild(currentPageScript);
          currentPageScript = null;
        }

        if (!route.script) return;

        /* Crée un nouveau <script> à chaque navigation pour que Load_page() soit toujours ré-exécuté */
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '/js/' + route.script + '.js';
        script.onload = function () {
          if (typeof Load_page === 'function') Load_page();
        };
        script.onerror = function () {
          console.warn('Router: script introuvable —', route.script + '.js');
        };
        document.body.appendChild(script);
        currentPageScript = script;
      })
      .catch(function (err) {
        console.error('Router: impossible de charger la vue', route.view, err);
      });
  }

  /* Navigue vers un chemin interne et met à jour l'historique du navigateur */
  function push(path) {
    history.pushState({ path: path }, '', path);
    navigate(path);
  }

  function init() {
    /* Intercepte les clics sur les liens internes */
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return;
      /* Laisser passer : liens externes, ancres, mailto, target="_blank" */
      if (href.indexOf('http') === 0 || href.indexOf('//') === 0 ||
          href.charAt(0) === '#' || href.indexOf('mailto:') === 0 ||
          link.target === '_blank') return;
      e.preventDefault();
      push(href);
    });

    /* Gère les boutons précédent/suivant du navigateur */
    window.addEventListener('popstate', function (e) {
      navigate(e.state ? e.state.path : window.location.pathname + window.location.search + window.location.hash);
    });

    /* Première navigation : déclenché par common.js après la connexion Keycloak */
    window.addEventListener('keycloak-ready', function () {
      var currentPath = window.location.pathname + window.location.search + window.location.hash;
      history.replaceState({ path: currentPath }, '', currentPath);
      navigate(currentPath);
    });
  }

  return { init: init, push: push, navigate: navigate };

})();

document.addEventListener('DOMContentLoaded', function () { Router.init(); });
