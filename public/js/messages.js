
 var is_init = false;
 var WTDMSGWebSocket;

/******************************************************************************************************************************/
/* Load_websocket: Appelé pour ouvrir la websocket                                                                            */
/******************************************************************************************************************************/
 function Load_message_websocket ()
  { if (WTDMSGWebSocket && WTDMSGWebSocket.readyState == "OPEN") return;
    WTDMSGWebSocket = new WebSocket($ABLS_API.replace("http","ws")+"/websocket"+
                                    "?token="+Token+"&domain_uuid="+localStorage.getItem("domain_uuid") );
    WTDMSGWebSocket.onopen = function (event)
     { $('#idAlertConnexionLost').hide();
       console.log("MSGWebsocket ouverte");
     }
    WTDMSGWebSocket.onerror = function (event)
     { Scroll_to_top();
       $('#idAlertConnexionLost').show();
       console.log("MSGWebsocket Error au websocket !");
       console.debug(event);
     }
    WTDMSGWebSocket.onclose = function (event)
     { Scroll_to_top();
       $('#idAlertConnexionLost').show();
       console.log("MSGWebsocket Close au websocket !");
       console.debug(event);
     }
    WTDMSGWebSocket.onmessage = function (event)
     { var Response = JSON.parse(event.data);                                               /* Pointe sur <synoptique a=1 ..> */
       if (!is_init) return;
       if (Response.tag == "DLS_HISTO")
        { if ( Response.alive == true )
           { console.log("Websocket NEW: " + is_init);
             console.debug(Response);
             $('#idTableMessages').DataTable().row.add ( Response ).draw();
           }
           else
           { console.log("Websocket OLD: " + is_init);
             console.debug(Response);
             $('#idTableMessages').DataTable().row("#"+Response.histo_msg_id).remove().draw();
           }
          /*else $('#idTableMSGS').DataTable().ajax.reload( null, false );*/
        }
       else console.log("Websocket Tag: " + Response.tag + " not known");
     }
  }

/******************************************************************************************************************************/
/* Appelé au chargement de la page                                                                                            */
/******************************************************************************************************************************/
 function Load_page_message ()
  { if (is_init == true) return;
    is_init = true;
    $('#idTableMessages').DataTable(
     { pageLength : 50,
       fixedHeader: true, paging: false, ordering: true, searching: true,
       ajax: { url : $ABLS_API+"/histo/alive", type : "GET", dataSrc: "histo_msgs", contentType: "application/json",
               error: function ( xhr, status, error ) { Show_toast_ko(xhr.statusText); },
               beforeSend: function (request)
                            { request.setRequestHeader('Authorization', 'Bearer ' + Token);
                              request.setRequestHeader('X-ABLS-DOMAIN', localStorage.getItem('domain_uuid') );
                            }
             },
       rowId: "histo_msg_id",
       createdRow: function( row, item, dataIndex )
           {      if (item.typologie==0) { cligno = false; classe="text-white"; } /* etat */
             else if (item.typologie==1) { cligno = true;  classe="text-warning" } /* alerte */
             else if (item.typologie==2) { cligno = true;  classe="text-warning"; } /* defaut */
             else if (item.typologie==3) { cligno = true;  classe="text-danger"; } /* alarme */
             else if (item.typologie==4) { cligno = false; classe="text-success"; } /* veille */
             else if (item.typologie==5) { cligno = false; classe="text-white"; }   /* attente */
             else if (item.typologie==6) { cligno = true;  classe="text-danger"; } /* danger */
             else if (item.typologie==7) { cligno = true;  classe="text-warning"; } /* derangement */
             else { cligno=false; classe="text-info"; }
             if (cligno && item.date_fixe == null) $(row).addClass( "wtd-cligno" );
             $(row).addClass( classe );
           },
          columns:
           [ { "data": null, "title":"-", "className": "align-middle text-center bg-dark d-none d-sm-table-cell ",
               "render": function (item)
                 {      if (item.typologie==0) { img = "info.svg"; } /* etat */
                   else if (item.typologie==1) { img = "bouclier_orange.svg"; } /* alerte */
                   else if (item.typologie==2) { img = "pignon_orange.svg"; } /* defaut */
                   else if (item.typologie==3) { img = "pignon_red.svg"; } /* alarme */
                   else if (item.typologie==4) { img = "bouclier_green.svg"; } /* veille */
                   else if (item.typologie==5) { img = "info.svg"; } /* attente */
                   else if (item.typologie==6) { img = "croix_red.svg"; } /* danger */
                   else if (item.typologie==7) { img = "croix_orange.svg"; } /* derangement */
                   else { img = "info.svg"; }
                   return("<img class='wtd-vignette' src='https://static.abls-habitat.fr/img/"+img+"'>");
                 }
             },
             { "data": "date_create", "title":"Apparition", "className": "align-middle text-center d-none d-sm-table-cell bg-dark" },
             { "data": "syn_page", "title":"Page", "className": "align-middle text-center d-none d-md-table-cell bg-dark" },
             { "data": "dls_shortname", "title":"Objet", "className": "align-middle text-center bg-dark" },
             { "data": null, "title":"Message", "className": "align-middle text-center bg-dark",
               "render": function (item)
                 { return( htmlEncode(item.libelle) ); }
             },
             { "data": null, "title":"Acquit", "className": "align-middle text-center d-none d-lg-table-cell bg-dark",
               "render": function (item)
                 { if (item.typologie==0) return("-");                                                      /* Si INFO, pas de ACK */
                   if (item.nom_ack!=null) return(item.nom_ack);
                   return( Bouton ( "primary", "Acquitter le message", "Msg_acquitter", item.histo_msg_id, "Acquitter" ) );
                 }
             },
           ],
          order: [ [1, "desc"] ],
          responsive: false,
     });
    Load_message_websocket();
  }
/******************************************************************************************************************************/
/* Load_page: Appelé au chargement de la page                                                                                 */
/******************************************************************************************************************************/
 function Load_page ()
  { Load_page_message(); }
/*----------------------------------------------------------------------------------------------------------------------------*/
