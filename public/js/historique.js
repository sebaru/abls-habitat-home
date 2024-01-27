 function HISTO_Rechercher ( )
  { Send_to_API ( 'GET', "/histo/search", "search="+$("#idHistoSearchQuery").val(), function (Response)
     { $('#idTableHISTOS').DataTable(
        { pageLength : 200, destroy: true,
          fixedHeader: true, paging: false, ordering: true, searching: false,
          data: Response.histo_msgs,
          rowId: "histo_msgs_id",
          createdRow: function( row, item, dataIndex )
           {
           },
          columns:
           [ { "data": null, "title":"-", "className": "align-middle text-center bg-dark d-none d-sm-table-cell ",
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
             { "data": null, "title":"Acquit", "className": "align-middle text-center d-none d-lg-table-cell bg-dark",
               "render": function (item)
                 { if (item.nom_ack!=null) return( "<p class="+MSG_TYPOLOGIE[item.typologie].classe+"> "+htmlEncode(item.nom_ack)+"</p>");
                   return("-");
                 }
             },
           ],
          /*order: [ [0, "desc"] ],*/
          responsive: false,
        });

     }, null );
  }

/********************************************* Appelé au chargement de la page ************************************************/
 function Load_page ()
  { Send_to_API ( 'GET', "/domain/image", null, function (Response)
     { if (Response.image == null) Response.image = "https://static.abls-habitat.fr/img/syn_maison.png";
       Changer_img_src ( "idNavImgTopSyn", Response.image, false );
       $("#idNavImgTopSyn").on("click", function () { Redirect("/"); } );
     }, null);
    $('#idHistoSearch').off("click").on( "click", () => { HISTO_Rechercher(); });
    $('#idHistoSearchQuery').off("enter").on( "enter", () => { HISTO_Rechercher(); });
  }
