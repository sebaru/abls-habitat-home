 var Synoptique = null;                                              /* Toutes les données du synoptique en cours d'affichage */
 var MQTT_Client = null;

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
/* Mqtt_subsribe: Appelé pour souscrire à un topic                                                                            */
/******************************************************************************************************************************/
 function Mqtt_subscribe ( topic )
  { var domain_uuid = localStorage.getItem("domain_uuid");
    var full_topic = domain_uuid + "/browsers/" + topic;
    MQTT_Client.subscribe( full_topic, (err) =>
     { if (err) { console.log ( "MQTT Subscribe to " + full_topic + " error: " + err ); }
       else console.log ( "MQTT Subscribed to " + full_topic );
     });
  }
/******************************************************************************************************************************/
/* Load_mqtt: Appelé pour ouvrir la connexion mqtt                                                                            */
/******************************************************************************************************************************/
 function Load_mqtt ( syn_id )
  { console.log ("------------------------------ Chargement MQTT" );
    var domain_uuid = localStorage.getItem("domain_uuid");
    var methode;
    if (localStorage.getItem ( "mqtt_over_ssl" ) == 1) methode = "wss"; else methode = "ws";
    var url = methode + "://" + localStorage.getItem("mqtt_hostname") + ":" + localStorage.getItem("mqtt_port");
    console.log( "connecting " + domain_uuid + '-browser'+ " to " + url );
    MQTT_Client = mqtt.connect( url, { protocolId: 'MQTT', clean: true, keepalive: 30,
                                connectTimeout: 4000, reconnectPeriod: 10000,
                                username: domain_uuid + "-browser",
                                password: sessionStorage.getItem ("browser_password"),
                              });
    MQTT_Client.on('connect', function ()
     { console.log('MQTT Connected');
       $('#idAlertConnexionLost').hide();
       Mqtt_subscribe ( "DLS_VISUEL/#" );
       Mqtt_subscribe ( "DLS_HISTO/#" );
       Mqtt_subscribe ( "SYN_STATUS/#" );
     });

    MQTT_Client.on('disconnect', function ()
     { console.log('MQTT Disconnected');
       $('#idAlertConnexionLost').show();
     });

    MQTT_Client.on('error', function (error)
     { if(Closing==false) $('#idAlertConnexionLost').show();
       console.log('MQTT Error: ' + error);
     });

    MQTT_Client.on ('message', function (topic, message)
     { $('#idAlertConnexionLost').hide();
       var topics = topic.split("/");
       if (topics[0] != domain_uuid) return;
       if (topics[1] != "browsers") return;
       var tag = topics[2];
       var Response = JSON.parse(message);                                                  /* Pointe sur <synoptique a=1 ..> */
            if (Synoptique && tag == "DLS_VISUEL") { Changer_etat_visuel ( Response ); }
       else if (tag == "SYN_STATUS") { Set_syn_vars ( topics[3], Response ); }
       else if (tag == "DLS_HISTO")
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
       else console.log("topic: " + tag + " not known");
     });
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
