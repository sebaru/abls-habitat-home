
 var WTDWebSocket;

/* function Ping ()
  { setTimeout ( function()                                                                         /* Un ping tous les jours */
/*     { Send_to_API ( "GET", "/ping", null, function ()
        { if (WTDWebSocket && WTDWebSocket.readyState != "OPEN")
           { console.log("Ping : websocket status = " + WTDWebSocket.readyState );
             Charger_synoptique (Synoptique.page);
             Load_websocket();
           }
          Ping();
        }, null );
     }, 60000 );
  }*/
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
       var json_request = JSON.stringify( { "tag": "abonner", "syn_id": syn_id } );
       this.send ( json_request );
     }
    WTDWebSocket.onerror = function (event)
     { console.log("Error au websocket !" );
       console.debug(event);
     }
    WTDWebSocket.onclose = function (event)
     { $('#idAlertConnexionLost').show();
       console.log("Close au websocket !" );
       console.debug(event);
     }

    WTDWebSocket.onmessage = function (event)
     { var Response = JSON.parse(event.data);                                               /* Pointe sur <synoptique a=1 ..> */
       if (!Synoptique) return;

            if (Response.tag == "DLS_CADRAN") { Changer_etat_cadran ( Response ); }
       else if (Response.tag == "DLS_VISUEL") { Changer_etat_visuel ( Response ); }
       else if (Response.tag == "pulse")      { }
       else console.log("tag: " + Response.tag + " not known");
     }
  }
/******************************************************************************************************************************/
/* Load_page: Appelé au chargement de la page                                                                                 */
/******************************************************************************************************************************/
 function Load_page ()
  { vars = window.location.pathname.split('/');
    var syn_page = null;
    if (vars[1] !== null) syn_page = vars[1];
    console.log ("Syn: loading " + vars[1] );

    Send_to_API ( 'GET', "/domain/image", null, function (Response)
     { if (Response.image == null) Response.image = "https://static.abls-habitat.fr/img/syn_maison.png";
       Changer_img_src ( "idNavImgTopSyn", Response.image, false );
     }, null);

    Charger_un_synoptique ( syn_page );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
