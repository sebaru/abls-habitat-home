 function HISTO_Rechercher ( )
  { Send_to_API ( 'GET', "/histo/search", "search="+$("#idHistoSearchQuery").val(), function (Response)
     { $('#idTableHISTOS').DataTable(
        { pageLength : 200, destroy: true,
          fixedHeader: true, paging: false, ordering: true, searching: false,
          data: Response.histo_msgs,
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
             { "data": "date_create", "title":"Apparition", "className": "align-middle text-center d-none d-sm-table-cell bg-dark" },
             { "data": "syn_page", "title":"Page", "className": "align-middle text-center d-none d-sm-table-cell bg-dark" },
             { "data": "dls_shortname", "title":"Objet", "className": "align-middle text-center bg-dark" },
             { "data": null, "title":"Message", "className": "align-middle text-center bg-dark",
               "render": function (item)
                 { return( htmlEncode(item.libelle) ); }
             },
             { "data": null, "title":"Acquit", "className": "align-middle text-center d-none d-sm-table-cell bg-dark",
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

     }, null );
  }

/********************************************* Appelé au chargement de la page ************************************************/
 function Load_page ()
  { $('#idHistoSearch').off("click").on( "click", () => { HISTO_Rechercher(); });
    $('#idHistoSearchQuery').off("enter").on( "enter", () => { HISTO_Rechercher(); });
  }
