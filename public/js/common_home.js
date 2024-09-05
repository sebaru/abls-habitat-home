 var Synoptique = null;                                              /* Toutes les données du synoptique en cours d'affichage */

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
/* Load_mqtt: Appelé pour ouvrir la connexion mqtt                                                                            */
/******************************************************************************************************************************/
 function Load_mqtt ( syn_id )
  { var domain_uuid = localStorage.getItem("domain_uuid");
    var methode;
    if (localStorage.getItem ( "mqtt_over_ssl" ) == 1) methode = "wss"; else methode = "ws";
    var url = methode + "://" + localStorage.getItem("mqtt_hostname") + ":" + localStorage.getItem("mqtt_port");
    console.log( "connecting " + 'browser-'+domain_uuid + " to " + url );
    const client = mqtt.connect( url, { protocolId: 'MQTT', clean: true,
                                        connectTimeout: 4000, reconnectPeriod: 10000,
                                        username: "browser-"+domain_uuid,
                                        password: sessionStorage.getItem ("browser_password"),
                                      });
    client.on('connect', function ()
     { console.log('Connected');
       $('#idAlertConnexionLost').hide();
       client.subscribe( domain_uuid + "/DLS_VISUEL", (err) =>
        { if (err) { console.log ( "MQTT Subscribe error: " + err ); }
          else console.log ( "MQTT Subscribed to " + "DLS_VISUEL" );
        });
       client.subscribe( domain_uuid + "/DLS_HISTO", (err) =>
        { if (err) { console.log ( "MQTT Subscribe error: " + err ); }
          else console.log ( "MQTT Subscribed to " + "DLS_HISTO" );
        });
     });

    client.on('error', function (error)
     { if(Closing==false) $('#idAlertConnexionLost').show();
       console.log('MQTT Error: ' + error);
     });

    client.on ('message', function (topic, message)
     { var topics = topic.split("/");
       if (topics[0] != domain_uuid) return;
       var Response = JSON.parse(message);                                                  /* Pointe sur <synoptique a=1 ..> */
            if (Synoptique && topics[1] == "DLS_CADRAN") { Changer_etat_cadran ( Response ); }
       else if (Synoptique && topics[1] == "DLS_VISUEL") { Changer_etat_visuel ( Response ); }
       else if (topics[1] == "DLS_HISTO")
             { if (DataTable.isDataTable( '#idTableMessages') == false) return;
               if ( Response.alive == true )
                { console.log("MQTT MSG NEW");
                  console.debug(Response);
                  if (!Synoptique || (Synoptique && Synoptique.page == Response.syn_page ) )
                   { $('#idTableMessages').DataTable().row.add ( Response ).draw(); }
                }
               else
                { console.log("MQTT REMOVE MSG");
                  console.debug(Response);
                  /*$('#idTableMessages').DataTable().row("#"+Response.histo_msg_id).remove().draw();*/
                  $('#idTableMessages').DataTable().rows( function ( index, data, node )
                   { if ( data.tech_id == Response.tech_id && data.acronyme == Response.acronyme ) return(true);
                     else return(false);
                   }).remove().draw("page");
                }
               /*else $('#idTableMSGS').DataTable().ajax.reload( null, false );*/
             }
       else console.log("topic: " + topics[1] + " not known");
     });
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
