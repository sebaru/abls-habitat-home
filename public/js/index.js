
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
    Send_to_API ( 'GET', "/domain/image", null, function (Response)
     { if (Response.image == null) Response.image = "https://static.abls-habitat.fr/img/syn_maison.png";
       Changer_img_src ( "idNavImgTopSyn", Response.image, false );
     }, null);

    Charger_un_synoptique ( syn_page );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
