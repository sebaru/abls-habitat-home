 var Synoptique = null;                                              /* Toutes les données du synoptique en cours d'affichage */
 var WTDWebSocket = null;

 var MSG_TYPOLOGIE = [ { cligno: false, classe: "text-white",   img: "info.svg" }, /* etat */
                       { cligno: true,  classe: "text-warning", img: "bouclier_orange.svg" }, /* alerte */
                       { cligno: true,  classe: "text-warning", img: "pignon_orange.svg" }, /* defaut */
                       { cligno: true,  classe: "text-danger",  img: "pignon_red.svg" }, /* alarme */
                       { cligno: false, classe: "text-success", img: "bouclier_green.svg" }, /* veille */
                       { cligno: false, classe: "text-white",   img: "panneau_danger.svg" }, /* attente */
                       { cligno: true,  classe: "text-danger",  img: "croix_red.svg" }, /* danger */
                       { cligno: true,  classe: "text-warning", img: "croix_orange.svg" }, /* derangement */
                     ];

/********************************************* Affichage des vignettes ********************************************************/
 function Msg_acquitter ( histo_msg_id )
  { selection = $('#idTableMessages').DataTable().row("#"+histo_msg_id).data();
    var json_request =
       { histo_msg_id : selection.histo_msg_id,
         tech_id      : selection.tech_id,
         acronyme     : selection.acronyme,
       };
    Send_to_API ( 'POST', "/histo/acquit", json_request, function ()
     { $('#idTableMessages').DataTable().ajax.reload( null, false );
     }, null);
  }
/******************************************************************************************************************************/
/* Load_websocket: Appelé pour ouvrir la websocket                                                                            */
/******************************************************************************************************************************/
 function Load_websocket ( syn_id )
  { if (WTDWebSocket && WTDWebSocket.readyState == 1) WTDWebSocket.close(); /* 1 = Open */
    WTDWebSocket = new WebSocket($ABLS_API.replace("http","ws")+"/websocket"+
                                 "?token="+Token+
                                 "&domain_uuid="+localStorage.getItem("domain_uuid"),
                                 "live-http"
                                );

    WTDWebSocket.onopen = function (event)
     { console.log("Websocket loaded " );
       $('#idAlertConnexionLost').hide();
       if (syn_id)
        { var json_request = JSON.stringify( { "tag": "abonner", "syn_id": syn_id } );
          this.send ( json_request );
        }
       WTDWebSocket.ping = setInterval ( function()                                     /* Un ping tous les 30 secondes */
        { console.log("ws log " + WTDWebSocket.readyState );
          if (WTDWebSocket.readyState == 1)
           { var json_ping = JSON.stringify( { "tag": "ping" } );
             WTDWebSocket.send( json_ping );
             console.log ( "websocket: sending ping" );
           } else console.log ( "websocket: not sending ping (closed?)" );
        }, 20000 );
     }
    WTDWebSocket.onerror = function (event)
     { console.log("Error au websocket restarting in 10s !" );
       console.debug(event);
       if(Closing==false)
        { $('#idAlertConnexionLost').show();
          setTimeout ( function()                                                                 /* restart dans 10 secondes */
           { Load_websocket ( syn_id );
             console.log ( "websocket: restarting" );
           }, 10000 );
        }
     }

    WTDWebSocket.onclose = function (event)
     { console.log("Close au websocket: code=" + event.code + ", reason=" + event.reason );
       clearInterval ( WTDWebSocket.ping );
       console.debug(event);
     }

    WTDWebSocket.onmessage = function (event)
     { var Response = JSON.parse(event.data);                                               /* Pointe sur <synoptique a=1 ..> */
            if (Synoptique && Response.tag == "DLS_CADRAN") { Changer_etat_cadran ( Response ); }
       else if (Synoptique && Response.tag == "DLS_VISUEL") { Changer_etat_visuel ( Response ); }
       else if (Response.tag == "DLS_HISTO")
             { if (DataTable.isDataTable( '#idTableMessages') == false) return;
               if ( Response.alive == true )
                { console.log("Websocket MSG NEW");
                  console.debug(Response);
                  if (!Synoptique || (Synoptique && Synoptique.page == Response.syn_page ) )
                   { $('#idTableMessages').DataTable().row.add ( Response ).draw(); }
                }
               else
                { console.log("Websocket REMOVE MSG");
                  console.debug(Response);
                  /*$('#idTableMessages').DataTable().row("#"+Response.histo_msg_id).remove().draw();*/
                  $('#idTableMessages').DataTable().rows( function ( index, data, node )
                   { if ( data.tech_id == Response.tech_id && data.acronyme == Response.acronyme ) return(true);
                     else return(false);
                   }).remove().draw("page");
                }
               /*else $('#idTableMSGS').DataTable().ajax.reload( null, false );*/
             }
       else console.log("tag: " + Response.tag + " not known");
     }
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
