
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
    if ( /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) )
     { navigator.geolocation.watchPosition(
         (position) => { Send_to_API ( 'POST', "/user/set_gps", position.coords,
                                       function () { console.log("GPS success"); },
                                       function () { console.log("GPS error"); }
                                     );
                       },
         (error)    => { console.error("Erreur de géolocalisation :", error.message); },
          { enableHighAccuracy: false, // Précision maximale (plus de consommation de batterie)
            timeout: 10000, // Temps max avant échec (en ms)
            maximumAge: 600000, //cache de 5 minutes
          });
     }
    Charger_un_synoptique ( syn_page );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
