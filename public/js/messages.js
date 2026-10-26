 var MESSAGE_typologies = [ "État", "Alerte", "Défaut", "Alarme", "Veille", "Attente", "Danger", "Dérangement" ];
 var MESSAGE_typologie = "";

 function MESSAGE_filter_search ()
  { return ( MESSAGE_typologie !== "" ? "^"+MESSAGE_typologie+"$" : "" );
  }

 function MESSAGE_filter_changed ()
  { MESSAGE_typologie = $('#idMessagesFilterTypologie').val();
    var params = new URLSearchParams(window.location.search);
    if (MESSAGE_typologie !== "") params.set ( "typologie", MESSAGE_typologie );
    else params.delete ( "typologie" );
    var url = window.location.pathname + (params.toString() ? "?"+params.toString() : "") + window.location.hash;
    history.replaceState ( { path: url }, '', url );
    $('#idTableMessages').DataTable().column(0).search ( MESSAGE_filter_search(), true, false ).draw();
  }

 function MESSAGE_filter_populate ()
  { var messages = this.api().rows({ search: 'none' }).data();
    var counts = MESSAGE_typologies.map ( function () { return(0); } );
    messages.each ( function (item) { counts[item.typologie]++; } );
    var html = "<option value=''>Toutes ("+messages.length+")</option>";
    MESSAGE_typologies.forEach ( function (label, typologie)
     { if (counts[typologie] || String(typologie) === MESSAGE_typologie)
        html += "<option value='"+typologie+"'>"+htmlEncode(label)+" ("+counts[typologie]+")</option>";
     });
    $('#idMessagesFilterTypologie').html(html).val(MESSAGE_typologie);
  }

/******************************************************************************************************************************/
/* Appelé au chargement de la page                                                                                            */
/******************************************************************************************************************************/
function Load_page_message ()
  { var typologie = new URLSearchParams(window.location.search).get("typologie") || "";
    MESSAGE_typologie = /^[0-7]$/.test(typologie) ? typologie : "";
    $('#idMessagesFilterTypologie').off('change').on('change', MESSAGE_filter_changed);
    Synoptique = null;
    Load_mqtt( null );
    $('#idTableMessages').DataTable(
     { pageLength : 50,
       fixedHeader: true, paging: false, ordering: true, searching: true,
       searchCols: [ { search: MESSAGE_filter_search(), regex: true, smart: false }, null, null, null, null, null ],
       drawCallback: MESSAGE_filter_populate,
             ajax: { url : $ABLS_API+"/histo/alive", type : "GET", dataSrc: "histo_msgs", contentType: "application/json",
               error: function ( xhr, status, error ) { Show_shell_error(xhr.statusText); }
             },
       initComplete: function () { Mqtt_subscribe ( "DLS_HISTO/#" ); },
       rowId: "histo_msg_id",
       createdRow: function( row, item, dataIndex )
           { if (item.typologie==0 || item.typologie==4 || item.typologie==5 || item.nom_ack!=null) return;
             $(row).css( "cursor", "pointer" ).on( "click", function (event)
              { if ($(event.target).closest("a, button").length) return; /* Liens et bouton Acquit gérés à part */
                Msg_acquitter ( item.histo_msg_id );
              });
           },
          columns:
           [ { "data": null, "title":"-", "className": "align-middle text-center d-none d-sm-table-cell bg-dark",
               "render": function (item, type)
                 { if (type === "filter") return( String(item.typologie) );
                   var classe = 'wtd-vignette';
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
                 { return( Lien ( "/historique?search="+encodeURIComponent('"'+item.dls_shortname+'"'), "Voir l'historique", item.dls_shortname ) ); }
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
                   return("<button class='btn btn-outline-light btn-sm' onclick='Msg_acquitter("+item.histo_msg_id+"); return false;'>Acquit</button>");
                 }
             },
           ],
          order: [ [1, "desc"] ],
     });
  }
/******************************************************************************************************************************/
/* Load_page: Appelé au chargement de la page                                                                                 */
/******************************************************************************************************************************/
 function Load_page ()
  { Load_page_message();
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
