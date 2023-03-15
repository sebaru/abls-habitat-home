 var Synoptique = null;                                              /* Toutes les données du synoptique en cours d'affichage */
 var WTDWebSocket = null;

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
  { if (WTDWebSocket && WTDWebSocket.readyState == "OPEN") WTDWebSocket.close();
    WTDWebSocket = new WebSocket($ABLS_API.replace("http","ws")+"/websocket"+
                                 "?token="+Token+
                                 "&domain_uuid="+localStorage.getItem("domain_uuid")
                                );

    WTDWebSocket.onopen = function (event)
     { console.log("Websocket loaded " );
       if (syn_id)
        { var json_request = JSON.stringify( { "tag": "abonner", "syn_id": syn_id } );
          this.send ( json_request );
        }
       setInterval ( function()                                                               /* Un ping tous les jours */
        { var json_ping = JSON.stringify( { "tag": "ping" } );
          WTDWebSocket.send( json_ping );
          console.log ( "websocket: sending ping" );
        }, 30000 );
     }
    WTDWebSocket.onerror = function (event)
     { console.log("Error au websocket !" );
       console.debug(event);
     }
    WTDWebSocket.onclose = function (event)
     { console.log("Close au websocket, restarting in 10s !" );
       console.debug(event);
       if(Closing==false)
        { $('#idAlertConnexionLost').show();
          setInterval ( function()                                                                  /* Un ping tous les jours */
           { Load_websocket ( syn_id );
             console.log ( "websocket: restarting" );
           }, 10000 );
        }
     }

    WTDWebSocket.onmessage = function (event)
     { var Response = JSON.parse(event.data);                                               /* Pointe sur <synoptique a=1 ..> */
       if (!Synoptique) return;

            if (Response.tag == "DLS_CADRAN") { Changer_etat_cadran ( Response ); }
       else if (Response.tag == "DLS_VISUEL") { Changer_etat_visuel ( Response ); }
       else if (Response.tag == "DLS_HISTO")
             { if (DataTable.isDataTable( 'idTableMessages') == false) return;
               if ( Response.alive == true )
                { console.log("Websocket MSG NEW");
                  console.debug(Response);
                  $('#idTableMessages').DataTable().row.add ( Response ).draw();
                }
               else
                { console.log("Websocket REMOVE MSG");
                  console.debug(Response);
                  $('#idTableMessages').DataTable().row("#"+Response.histo_msg_id).remove().draw();
                }
               /*else $('#idTableMSGS').DataTable().ajax.reload( null, false );*/
             }
       else if (Response.tag == "pulse") { console.log("pulse received"); }
       else console.log("tag: " + Response.tag + " not known");
     }
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
