/************************************ Demande de refresh **********************************************************************/
 function SMSG_Refresh ( )
  { $('#idTableSMSG').DataTable().ajax.reload(null, false);
  }
/********************************************* Afichage du modal d'edition synoptique *****************************************/
 function SMSG_Disable (smsg_id)
  { $("#idButtonSpinner_"+smsg_id).show();
    selection = $('#idTableSMSG').DataTable().row("#"+smsg_id).data();
    Thread_enable ( selection.thread_tech_id, false, function(Response) { SMSG_Refresh(); }, function(Response) { SMSG_Refresh(); } );
  }
/********************************************* Afichage du modal d'edition synoptique *****************************************/
 function SMSG_Enable (smsg_id)
  { $("#idButtonSpinner_"+modbus_id).show();
    selection = $('#idTableSMSG').DataTable().row("#"+smsg_id).data();
    Thread_enable ( selection.thread_tech_id, true, function(Response) { SMSG_Refresh(); }, function(Response) { SMSG_Refresh(); } );
  }
/************************************ Envoi les infos de modifications synoptique *********************************************/
 function SMSG_Set ( selection )
  { var json_request =
     { agent_uuid:             $('#idTargetAgent').val(),
       thread_tech_id:         $('#idSMSGTechID').val(),
       description:            $('#idSMSGDescription').val(),
       ovh_service_name:       $('#idSMSGOVHServiceName').val(),
       ovh_application_key:    $('#idSMSGOVHApplicationKey').val(),
       ovh_application_secret: $('#idSMSGOVHApplicationSecret').val(),
       ovh_consumer_key:       $('#idSMSGOVHConsumerKey').val(),
     };

    Send_to_API ( "POST", "/smsg/set", json_request, function(Response)
     { Show_toast_ok ( "Modification sauvegardée.");
       SMSG_Refresh();
     }, function(Response) { SMSG_Refresh(); } );
  }
/************************************ Demande l'envoi d'un SMS de test ********************************************************/
 function SMSG_Test_GSM ( smsg_id )
  { selection = $('#idTableSMSG').DataTable().row("#"+smsg_id).data();
    var json_request =
     { thread_tech_id: selection.thread_tech_id,
       tag: "test_gsm"
     };
    Send_to_API ( 'POST', "/thread/send", json_request, null );
  }
/************************************ Demande l'envoi d'un SMS de test ********************************************************/
 function SMSG_Test_OVH ( smsg_id )
  { selection = $('#idTableSMSG').DataTable().row("#"+smsg_id).data();
    var json_request =
     { thread_tech_id: selection.thread_tech_id,
       tag : "test_ovh"
     };
    Send_to_API ( 'POST', "/thread/send", json_request, null );
  }
/********************************************* Afichage du modal d'edition synoptique *****************************************/
 function SMSG_Edit ( smsg_id )
  { selection = $('#idTableSMSG').DataTable().row("#"+smsg_id).data();
    Select_from_api ( "idTargetAgent", "/agent/list", null, "agents", "agent_uuid", function (Response)
                        { return ( Response.agent_hostname ); }, selection.agent_uuid );
    $('#idSMSGTitre').text("Editer la connexion GSM " + selection.thread_tech_id);
    $('#idSMSGTechID').prop ("disabled", true).val( selection.thread_tech_id );
    $('#idSMSGDescription').val( selection.description );
    $('#idSMSGOVHServiceName').val( selection.ovh_service_name );
    $('#idSMSGOVHApplicationKey').val( selection.ovh_application_key );
    $('#idSMSGOVHApplicationSecret').val( selection.ovh_application_secret );
    $('#idSMSGOVHConsumerKey').val( selection.ovh_consumer_key );
    $('#idSMSGValider').off("click").on( "click", function () { SMSG_Set(selection); } );
    $('#idSMSGEdit').modal("show");
  }
/********************************************* Afichage du modal d'edition synoptique *****************************************/
 function SMSG_Add ( )
  { $('#idSMSGTitre').text("Ajouter un équipement GSM");
    Select_from_api ( "idTargetAgent", "/agent/list", null, "agents", "agent_uuid", function (Response)
                        { return ( Response.agent_hostname ); }, null );
    $('#idSMSGTechID').prop ("disabled", false).val("").off("input").on("input", function () { Controle_tech_id( "idSMSG", null ); } );
    $('#idSMSGDescription').val("");
    $('#idSMSGOVHServiceName').val("");
    $('#idSMSGOVHApplicationKey').val("");
    $('#idSMSGOVHApplicationSecret').val("");
    $('#idSMSGOVHConsumerKey').val("");
    $('#idSMSGValider').off("click").on( "click", function () { SMSG_Set(null); } );
    $('#idSMSGEdit').modal("show");
  }
/**************************************** Supprime une connexion meteo ********************************************************/
 function SMSG_Del_Valider ( selection )
  { var json_request = { agent_uuid : selection.agent_uuid, thread_tech_id: selection.thread_tech_id };
    Send_to_API ( 'DELETE', "/thread/delete", json_request, function(Response)
     { Show_toast_ok ( "Equipement GSM supprimé");
       SMSG_Refresh();
     }, function(Response) { SMSG_Refresh(); } );
  }
/**************************************** Supprime une connexion meteo ********************************************************/
 function SMSG_Del ( smsg_id )
  { table = $('#idTableSMSG').DataTable();
    selection = table.ajax.json().config.filter( function(item) { return item.id==id } )[0];
    Show_modal_del ( "Supprimer la connexion "+selection.thread_tech_id,
                     "Etes-vous sûr de vouloir supprimer cette connexion ?",
                     selection.thread_tech_id + " - "+selection.description,
                     function () { SMSG_Del_Valider( selection ) } ) ;
  }
/********************************************* Appelé au chargement de la page ************************************************/
 function Load_page ()
  { $('#idTableMSGS').DataTable(
     { pageLength : 50,
       fixedHeader: true, paging: false, ordering: true, searching: true,
       ajax: { url : $ABLS_API+"/histo/alive", type : "GET", dataSrc: "histo_msgs", contentType: "application/json",
               error: function ( xhr, status, error ) { Show_toast_ko(xhr.statusText); },
               beforeSend: function (request)
                            { request.setRequestHeader('Authorization', 'Bearer ' + Token);
                              request.setRequestHeader('X-ABLS-DOMAIN', localStorage.getItem('domain_uuid') );
                            }
             },
       rowId: "histo_msgs_id",
       createdRow: function( row, item, dataIndex )
           {      if (item.typologie==0) { classe="text-white"; } /* etat */
             else if (item.typologie==1) { classe="text-warning" } /* alerte */
             else if (item.typologie==2) { classe="text-warning"; } /* defaut */
             else if (item.typologie==3) { classe="text-danger"; } /* alarme */
             else if (item.typologie==4) { classe="text-success"; } /* veille */
             else if (item.typologie==5) { classe="text-white"; }   /* attente */
             else if (item.typologie==6) { classe="text-danger"; } /* danger */
             else if (item.typologie==7) { classe="text-warning"; } /* derangement */
             else classe="text-info";
             $(row).addClass( classe );
           },
          columns:
           [ { "data": null, "title":"-", "className": "align-middle text-center bg-dark",
               "render": function (item)
                 {      if (item.typologie==0) { cligno = false; img = "info.svg"; } /* etat */
                   else if (item.typologie==1) { cligno = true;  img = "bouclier_orange.svg"; } /* alerte */
                   else if (item.typologie==2) { cligno = true;  img = "pignon_orange.svg"; } /* defaut */
                   else if (item.typologie==3) { cligno = true;  img = "pignon_red.svg"; } /* alarme */
                   else if (item.typologie==4) { cligno = false; img = "bouclier_green.svg"; } /* veille */
                   else if (item.typologie==5) { cligno = false; img = "info.svg"; } /* attente */
                   else if (item.typologie==6) { cligno = true;  img = "croix_rouge_red.svg"; } /* danger */
                   else if (item.typologie==7) { cligno = true;  img = "croix_rouge_orange.svg"; } /* derangement */
                   else { cligno = false; img = "info.svg"; }
                   if (cligno==true) classe="wtd-cligno"; else classe="";
                   return("<img class='wtd-vignette "+classe+"' src='https://static.abls-habitat.fr/img/"+img+"'>");
                 }
             },
             { "data": "date_create", "title":"Apparition", "className": "align-middle text-center bg-dark d-none d-sm-table-cell" },
             { "data": "dls_shortname", "title":"Objet", "className": "align-middle text-center bg-dark " },
             { "data": null, "title":"Message", "className": "align-middle text-center bg-dark",
               "render": function (item)
                 { return( htmlEncode(item.libelle) ); }
             },
             { "data": null, "title":"Acquit", "className": "align-middle text-center bg-dark d-none d-sm-table-cell",
               "render": function (item)
                 { if (item.typologie==0) return("-");                                                      /* Si INFO, pas de ACK */
                   if (item.nom_ack!=null) return(item.nom_ack);
                   return( Bouton ( "primary", "Acquitter le message", "Msg_acquitter", item.msg_id, "Acquitter" ) );
                 }
             },
           ],
          /*order: [ [0, "desc"] ],*/
          responsive: false,
     });

  }
