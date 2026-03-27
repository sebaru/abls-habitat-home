
 var WTDWebSocket;
 var Closing = false;

/******************************************************************************************************************************/
/* Load_page: Appelé au chargement de la page                                                                                 */
/******************************************************************************************************************************/
/******************************************************************************************************************************/
/* Inviter_open: Ouvre le modal d'invitation                                                                                  */
/******************************************************************************************************************************/
 function Inviter_open ()
  { $("#idUserInviteEmail").val("");
    $("#idUserInviteAccessLevel").replaceWith( Select_Access_level( "idUserInviteAccessLevel", null ) );
    $("#idUserInviteValider").off("click").on("click", function ()
     { var json_request = { friend_email: $("#idUserInviteEmail").val(),
                            friend_level: parseInt($("#idUserInviteAccessLevel").val())
                          };
       Send_to_API ( "POST", "/user/invite", json_request, function()
        { $("#idModalInviter").modal("hide");
          Show_toast_ok ( json_request.friend_email + " a été invité." );
        }, null );
     });
    $("#idModalInviter").modal("show");
  }
/******************************************************************************************************************************/
/* Load_page: Appelé au chargement de la page                                                                                 */
/******************************************************************************************************************************/
 function Load_page ()
  { vars = window.location.pathname.split('/');
    var syn_page = null;
    if (vars[1] !== null) syn_page = vars[1];
    console.log ("Syn: loading " + vars[1] );

    document.addEventListener('pageshow', function (event)
     { if (!event.persisted) return;
       if (Keycloak_client === null) { window.location.reload(); return; }
       Keycloak_client.updateToken(-1)
        .then(function(refreshed)
         { if (refreshed) { Token = Keycloak_client.token; console.log('Token forcé après retour bfcache'); }
           Charger_un_synoptique(Synoptique ? Synoptique.syn_page : null);
         })
        .catch(function() { window.location.reload(); });
     }, false);
    document.addEventListener('visibilitychange', function ()
     { if (document.hidden) return;
       if (Keycloak_client === null) return;
       Keycloak_client.updateToken(-1)
        .then(function(refreshed)
         { if (refreshed) { Token = Keycloak_client.token; console.log('Token forcé après retour au premier plan'); }
         })
        .catch(function() { window.location.reload(); });
     }, false);
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    Load_mqtt( syn_page );                                                                             /* Charge la websocket */
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
