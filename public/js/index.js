
 var WTDWebSocket;
 var Closing = false;

/******************************************************************************************************************************/
/* Load_page: Appelé au chargement de la page                                                                                 */
/******************************************************************************************************************************/
 function Load_page ()
  { vars = window.location.pathname.split('/');
    var syn_page = null;
    if (vars[1] !== null) syn_page = vars[1];
    console.log ("Syn: loading " + vars[1] );

    document.addEventListener('pageshow', function () { Charger_un_synoptique ( Synoptique.syn_page ); }, false);
    Load_mqtt();                                                                                       /* Charge la websocket */
    Charger_un_synoptique ( syn_page );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
