
/******************************************************************************************************************************/
/* Appelé au chargement de la page                                                                                            */
/******************************************************************************************************************************/
 function Load_page_message ()
  { $('#idTableMessages').DataTable(
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
           {      if (item.typologie==0) { classe="text-white"; } /* etat */
             else if (item.typologie==1) { classe="text-warning" } /* alerte */
             else if (item.typologie==2) { classe="text-warning"; } /* defaut */
             else if (item.typologie==3) { classe="text-danger"; } /* alarme */
             else if (item.typologie==4) { classe="text-success"; } /* veille */
             else if (item.typologie==5) { classe="text-white"; }   /* attente */
             else if (item.typologie==6) { classe="text-danger"; } /* danger */
             else if (item.typologie==7) { classe="text-warning"; } /* derangement */
             else { classe="text-info"; }
             $(row).addClass( classe );
           },
          columns:
           [ { "data": null, "title":"-", "className": "align-middle text-center bg-dark d-none d-sm-table-cell ",
               "render": function (item)
                 {      if (item.typologie==0) { cligno = false; img = "info.svg"; } /* etat */
                   else if (item.typologie==1) { cligno = true;  img = "bouclier_orange.svg"; } /* alerte */
                   else if (item.typologie==2) { cligno = true;  img = "pignon_orange.svg"; } /* defaut */
                   else if (item.typologie==3) { cligno = true;  img = "pignon_red.svg"; } /* alarme */
                   else if (item.typologie==4) { cligno = false; img = "bouclier_green.svg"; } /* veille */
                   else if (item.typologie==5) { cligno = false; img = "info.svg"; } /* attente */
                   else if (item.typologie==6) { cligno = true;  img = "croix_red.svg"; } /* danger */
                   else if (item.typologie==7) { cligno = true;  img = "croix_orange.svg"; } /* derangement */
                   else { cligno = false; img = "info.svg"; }
                   var classe = 'wtd-vignette';
                   if (cligno && item.date_fixe == null) classe = classe + ' wtd-cligno';
                   return("<img class='"+classe+"' src='https://static.abls-habitat.fr/img/"+img+"'>");
                 }
             },
             { "data": "date_create", "title":"Apparition", "className": "align-middle text-center d-none d-sm-table-cell bg-dark" },
             { "data": null, "title":"Page", "className": "align-middle text-center d-none d-md-table-cell bg-dark",
               "render": function (item)
                 { return( Lien ( "/"+item.syn_page, "Voir la page", item.syn_page ) ); }
             },
             { "data": "dls_shortname", "title":"Objet", "className": "align-middle text-center bg-dark" },
             { "data": null, "title":"Message", "className": "align-middle text-center bg-dark",
               "render": function (item)
                 { return( htmlEncode(item.libelle) ); }
             },
             { "data": null, "title":"Acquit", "className": "align-middle text-center d-none d-lg-table-cell bg-dark",
               "render": function (item)
                 { if (item.typologie==0) return("-"); /* etat */
                   if (item.typologie==4) return("-"); /* veille */
                   if (item.typologie==5) return("-"); /* attente */
                   if (item.nom_ack!=null) return(item.nom_ack);
                   return( Bouton ( "primary", "Acquitter le message", "Msg_acquitter", item.histo_msg_id, "Acquitter" ) );
                 }
             },
           ],
          order: [ [1, "desc"] ],
          responsive: false,
     });
    Load_websocket();
  }
/******************************************************************************************************************************/
/* Load_page: Appelé au chargement de la page                                                                                 */
/******************************************************************************************************************************/
 function Load_page ()
  { Load_page_message(); }
/*----------------------------------------------------------------------------------------------------------------------------*/
