
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
           {
           },
          columns:
           [ { "data": null, "title":"-", "className": "align-middle text-center d-none d-sm-table-cell bg-dark",
               "render": function (item)
                 { var classe = 'wtd-vignette';
                   if ( MSG_TYPOLOGIE[item.typologie].cligno && item.date_fixe == null) classe = classe + ' wtd-cligno';
                   return("<img class='"+classe+"' src='https://static.abls-habitat.fr/img/"+MSG_TYPOLOGIE[item.typologie].img+"'>");
                 }
             },
             { "data": null, "title":"Apparition", "className": "align-middle text-center d-none d-sm-table-cell bg-dark",
               "render": function (item)
                 { return( "<p class="+MSG_TYPOLOGIE[item.typologie].classe+"> "+htmlEncode(item.date_create)+"</p>" ); }
             },
             { "data": null, "title":"Page", "className": "align-middle text-center d-none d-md-table-cell bg-dark",
               "render": function (item)
                 { return( Lien ( "/"+item.syn_page, "Voir la page", item.syn_page ) ); }
             },
             { "data": null, "title":"Objet", "className": "align-middle text-center bg-dark",
               "render": function (item)
                 { return( "<p class="+MSG_TYPOLOGIE[item.typologie].classe+"> "+htmlEncode(item.dls_shortname)+"</p>" ); }
             },
             { "data": null, "title":"Message", "className": "align-middle text-center bg-dark",
               "render": function (item)
                 { return( "<p class="+MSG_TYPOLOGIE[item.typologie].classe+"> "+htmlEncode(item.libelle)+"</p>" ); }
             },
             { "data": null, "title":"Acquit", "className": "align-middle text-center text-white d-none d-lg-table-cell bg-dark",
               "render": function (item)
                 { if (item.typologie==0) return("-"); /* etat */
                   if (item.typologie==4) return("-"); /* veille */
                   if (item.typologie==5) return("-"); /* attente */
                   if (item.nom_ack!=null) return( "<p class="+MSG_TYPOLOGIE[item.typologie].classe+"> "+htmlEncode(item.nom_ack)+"</p>");
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
  { Send_to_API ( 'GET', "/domain/image", null, function (Response)
     { if (Response.image == null) Response.image = "https://static.abls-habitat.fr/img/syn_maison.png";
       Changer_img_src ( "idNavImgTopSyn", Response.image, false );
       $("#idNavImgTopSyn").on("click", function () { Redirect("/"); } );
     }, null);
    Load_page_message();
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
