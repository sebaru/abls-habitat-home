 var Synoptique = null;                                              /* Toutes les données du synoptique en cours d'affichage */

/********************************************* Affichage des vignettes ********************************************************/
 function Acquitter_synoptique( )
  { var json_request = { syn_page: Synoptique.page };
    Send_to_API ( 'POST', "/syn/ack", json_request, function ()
     { Show_toast_ok ( "Synoptique acquitté" );
     }, null);
  }
/******************************************************************************************************************************/
 function Set_syn_vars ( syn_id, syn_vars )
  { var vignette = $('#idVignette_'+syn_id);

    if (!syn_vars) return;
    if (syn_vars.bit_comm == false)
     { $('#idImgSyn_'+syn_id).addClass("wtd-img-grayscale");
       Changer_img_src ( "idVignetteComm_"+syn_id, "https://static.abls-habitat.fr/img/syn_communication.png", true );
     }
    else
     { $('#idImgSyn_'+syn_id).removeClass("wtd-img-grayscale");
       $('#idVignetteComm_'+syn_id).removeClass("wtd-cligno").fadeTo(0);
     }

    if (syn_vars.bit_danger == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/croix_red.svg", true );
     }
    else if (syn_vars.bit_alerte == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/bouclier_red.svg", true );
     }
    else if (syn_vars.bit_alarme == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/pignon_red.svg", true );
     }
    else if (syn_vars.bit_defaut == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/pignon_yellow.svg", true );
     }
    else if (syn_vars.bit_derangement == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/croix_orange.svg", true );
     }
    else if (syn_vars.bit_alerte_fixe == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/bouclier_red.svg", false );
     }
    else if (syn_vars.bit_alarme_fixe == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/pignon_red.svg",false );
     }
    else if (syn_vars.bit_defaut_fixe == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/pignon_yellow.svg",false );
     }
    else if (syn_vars.bit_danger_fixe == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/croix_red.svg",false );
     }
    else if (syn_vars.bit_derangement_fixe == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/croix_orange.svg", false );
     }
    else if (syn_vars.bit_veille_totale == true)
     { vignette.removeClass("wtd-cligno").fadeTo(0);
     }
    else if (syn_vars.bit_veille_partielle == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/bouclier_yellow.svg", false );
     }
    else if (syn_vars.bit_veille_partielle == false)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/bouclier_white.svg",false );
     }
    else
     { vignette.removeClass("wtd-cligno").fadeTo(0);
     }
  }
/******************************************************************************************************************************/
 function Charger_messages ( syn_id )
  { if (Messages_loaded==true)
     { $('#idTableMessages').DataTable().ajax.url("/api/histo/alive?syn_id="+syn_id).load();
     }
    else $('#idTableMessages').DataTable(
        { pageLength : 25,
          fixedHeader: true, searching: false, paging:false,
          ajax: { url: "/api/histo/alive?syn_id="+syn_id, type : "GET", dataSrc: "enregs",
                  error: function ( xhr, status, error ) { /*Show_Error(xhr.statusText);*/ }
                },
          rowId: "msg_id",
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
                   else if (item.typologie==6) { cligno = true;  img = "croix_red.svg"; } /* danger */
                   else if (item.typologie==7) { cligno = true;  img = "croix_orange.svg"; } /* derangement */
                   else img = "info.svg";
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
     Messages_loaded = true;
  }
/********************************************* Appelé au chargement de la page ************************************************/
 function Charger_un_synoptique ( syn_page )
  { var idSectionPasserelles = $('#idSectionPasserelles');
    var idSectionLightSyn    = $('#idSectionLightSyn');
    var idSectionHeavySyn    = $('#idSectionHeavySyn');
    var idSectionTableaux = $('#idSectionTableaux');
    console.log("------------------------------ Chargement synoptique "+syn_page);
    Send_to_API ( "GET", "/syn/show", (syn_page ? "syn_page=" + syn_page : null), function(Response)
     { console.log(Response);
       Synoptique = Response;
       window.history.replaceState( null, "", Response.page );                                  /* Affiche la page dans l'URL */
/*------------------------------------------------------------ Barre de navigation -------------------------------------------*/
       $('#idNavSynoptique')
        .empty()
        .prepend( "<a class='nav-link rounded d-none d-sm-inline' href='#'> <span>"+Synoptique.libelle+"</span></a>" );
       $.each ( Response.parent_syns, function (i, syn)
                 { var bread = $('<a>').addClass('nav-item')
                                .append($('<img>').attr("src", "https://static.abls-habitat.fr/img/"+syn.image)
                                                  .attr("alt", syn.libelle)
                                                  .attr("data-toggle", "tooltip")
                                                  .attr("data-placement", "bottom")
                                                  .attr("title", syn.libelle)
                                                  .off("click").on("click", () => { Charger_un_synoptique( syn.page ); } )
                                                  .addClass("wtd-menu") );
                   $('#idNavSynoptique').prepend ( bread );
                   $('#idNavSynoptique').prepend ( "<span class='navbar-text text-secondary'>></span>" );
                 }
              );


/*--------------------------------------------------- Passerelles ------------------------------------------------------------*/
       idSectionPasserelles.empty();
       $.each ( Synoptique.child_syns, function (i, syn)
                 { idSectionPasserelles.append ( Creer_passerelle ( syn ) );
                   if (Synoptique.syn_vars)
                    { Set_syn_vars ( syn.syn_id, Synoptique.syn_vars.filter ( function(ssitem) { return ssitem.syn_id==syn.syn_id } )[0] ); }
                 }
              );
       /*Set_syn_vars ( Synoptique.id, Synoptique.syn_vars.filter ( function(ssitem) { return ssitem.id==Response.id } )[0] );*/
       $.each ( Synoptique.horloges, function (i, horloge)
                 { idSectionPasserelles.append ( Creer_horloge ( horloge ) ); }
              );

/*---------------------------------------------------- Affichage léger -------------------------------------------------------*/
       idSectionLightSyn.empty();
       if (Synoptique.mode_affichage == false)
        { $.each ( Synoptique.visuels, function (i, visuel)
                    { var card = Creer_visuel ( visuel );
                      idSectionLightSyn.append ( card );
                      Changer_etat_visuel ( visuel );
                    }
              );
          $.each ( Synoptique.cadrans, function (i, cadran)
                    { idSectionPasserelles.append( Creer_cadran ( cadran ) );
                    }
                 );
        }
/*---------------------------------------------------- Affichage lourd -------------------------------------------------------*/
       idSectionHeavySyn.empty().css("position","relative");
       $("#idSectionHeavySynTitle").empty();
       if (Synoptique.mode_affichage == true && Synoptique.nbr_visuels > 0 && Synoptique.nbr_cadrans > 0 )
        { Trame = Trame_new ("idSectionHeavySyn");

          $("#idSectionHeavySynTitle").append ( $("<div>").addClass("col-auto")
                                                 .append ( $("<h2>").addClass("text-white")
                                                           .text ( Synoptique.page + " - " + Synoptique.libelle + "(#" + Synoptique.syn_id + ")" )
                                                         )
                                              )
                                      .append ( $("<div>").addClass("ml-auto btn-group align-items-center")
                                                 .append ( $("<button>").addClass("btn btn-primary")
                                                             .text ( "Acquitter" )
                                                             .on("click", () => { Acquitter_synoptique() } )
                                                         )
                                              );
          $.each ( Synoptique.visuels, function (i, visuel)
                    { if (visuel.forme == null)
                       { console.log ( "new null at " + visuel.posx + " " + visuel.posy );
                         Trame.new_from_image ( visuel, visuel.icone+".gif" );
                       }
                      else if (visuel.ihm_affichage=="complexe" && visuel.forme=="bouton")
                       { Trame.new_button ( visuel ); }
                      else if (visuel.ihm_affichage=="complexe" && visuel.forme=="encadre")
                       { Trame.new_encadre ( visuel ); }
                      else if (visuel.ihm_affichage=="complexe" && visuel.forme=="comment")
                       { Trame.new_comment ( visuel ); }
                      else if (visuel.ihm_affichage=="by_mode")       { Trame.new_by_mode ( visuel );       }
                      else if (visuel.ihm_affichage=="by_color")      { Trame.new_by_color( visuel );       }
                      else if (visuel.ihm_affichage=="by_mode_color") { Trame.new_by_mode_color ( visuel ); }
                      else if (visuel.ihm_affichage=="static")
                       { Trame.new_static( visuel, visuel.forme+"."+visuel.extension ); }

                      if (visuel.svggroupe !== undefined)
                       { visuel.svggroupe.on ( "click", function (event) { Clic_sur_visuel ( visuel ) }, false);
                       }
                    }
                 );
          $.each ( Synoptique.cadrans, function (i, cadran)
                    { Trame.new_cadran ( cadran );
                      /*if (cadran.svggroupe !== undefined)
                       { cadran.svggroupe.on ( "click", function (event) { Clic_sur_motif ( cadran, event ) }, false);
                       }*/
                    }
                 );
        }
       Load_websocket(Synoptique.syn_id);                                                              /* Charge la websocket */

/*---------------------------------------------------- Affichage des tableaux ------------------------------------------------*/
       idSectionTableaux.empty();
       if (Synoptique.nbr_tableaux>0)
        { $.each ( Synoptique.tableaux, function (i, tableau)
           { var id = "idTableau-"+tableau.tableau_id;
             idSectionTableaux.append( $("<div></div>").append("<canvas id='"+id+"'></canvas>").addClass("col wtd-courbe m-1") );
             maps = Synoptique.tableaux_map.filter ( function (item) { return(item.tableau_id==tableau.tableau_id) } );
             Charger_plusieurs_courbes ( id, maps, "HOUR" );
             $('#'+id).off("click").on("click", function () { Charger_page_tableau(tableau.tableau_id); } );
           });
        }

       /*Charger_messages ( syn_id );*/
       Slide_down_when_loaded ( "toplevel" );
     }, null );
 }

/********************************************* Appelé au chargement de la page ************************************************/
 function Creer_passerelle ( Response )
  { var card = $('<div></div>').addClass("row bg-transparent mb-3")
               .append( $('<div></div>').addClass("col text-center mb-1")
                        .append( $('<div></div>').addClass("d-inline-block wtd-img-container")
                                 .append($('<img>').attr("src", (Response.image=="custom" ? Response.image
                                                                                          : "https://static.abls-habitat.fr/img/"+Response.image) )
                                                   .off("click").on("click", () => { Charger_un_synoptique( Response.page ); } )
                                                   .attr("id", "idImgSyn_"+Response.syn_id)
                                                   .addClass("wtd-synoptique") )
                                 .append($('<img>').attr("id", "idVignetteComm_"+Response.syn_id)
                                                   /*.attr("src","https://static.abls-habitat.fr/img/pignon_green.svg")*/
                                                   .addClass("wtd-vignette wtd-img-superpose-bas-droite").slideUp()
                                        )
                                 .append($('<img>').attr("id", "idVignette_"+Response.syn_id)
                                                   /*.attr("src","")*/
                                                   .addClass("wtd-vignette wtd-img-superpose-haut-droite").slideUp()
                                        )
                               )
                      )
               .append( $('<div></div>').addClass('w-100') )
               .append( $('<div></div>').addClass("col text-center")
                        .append( $('<span></span>').addClass("text-white").text(" "+Response.libelle) )
                      );

    return(card);
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
