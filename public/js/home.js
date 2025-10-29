/********************************************* Affichage des vignettes ********************************************************/
 function Acquitter_synoptique( )
  { var json_request = { syn_page: Synoptique.page };
    Send_to_API ( 'POST', "/syn/ack", json_request, function ()
     { Show_toast_ok ( "Synoptique acquitté" );
     }, null);
  }
/********************************************* Appelé au chargement de la page ************************************************/
 function Charger_un_synoptique ( syn_page )
  { var idSectionPasserelles = $('#idSectionPasserelles');
    var idSectionLightSyn    = $('#idSectionLightSyn');
    var idSectionHeavySyn    = $('#idSectionHeavySyn');
    var idSectionTableaux    = $('#idSectionTableaux');
    var idSectionTableauxFS  = $('#idSectionTableauxFS');
    var idSectionMessages    = $('#idSectionMessages');

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
                                .append($('<img>').attr("src", localStorage.getItem("static_data_url")+"/img/"+syn.image)
                                                  .attr("alt", syn.libelle)
                                                  .attr("data-bs-toggle", "tooltip")
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
                   Set_syn_vars ( null, syn );
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
                    { var card = Creer_light_visuel ( visuel );
                      idSectionLightSyn.append ( card );
                      Changer_etat_visuel ( visuel );
                    }
              );
        }
/*---------------------------------------------------- Affichage lourd -------------------------------------------------------*/
       idSectionHeavySyn.empty().css("position","relative");
       $("#idSectionHeavySynTitle").empty();
       if (Synoptique.mode_affichage == true && (Synoptique.nbr_visuels > 0 || Synoptique.nbr_cadrans > 0) )
        { Trame = Trame_new ("idSectionHeavySyn");
          Trame.on( "dblclick", function ()
           { if (!document.fullscreenElement) document.getElementById("idSectionHeavySyn").requestFullscreen();
                                         else document.exitFullscreen();

           });
          $("#idSectionHeavySynTitle").append ( $("<div>").addClass("col-auto")
                                                 .append ( $("<h2>").addClass("text-white")
                                                           .text ( Synoptique.page + " - " + Synoptique.libelle + "(#" + Synoptique.syn_id + ")" )
                                                         )
                                              )
                                      .append ( $("<div>").addClass("col-auto ms-auto btn-group align-items-center")
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
                      else if (visuel.controle=="complexe")
                       {      if (visuel.forme=="bouton")  { Trame.new_button  ( visuel ); }
                         else if (visuel.forme=="encadre") { Trame.new_encadre ( visuel ); }
                         else if (visuel.forme=="comment") { Trame.new_comment ( visuel ); }
                         else if (visuel.forme=="cadran" && visuel.mode=="horaire") { Trame.new_cadran_horaire ( visuel ); }
                         else if (visuel.forme=="cadran" && visuel.mode=="texte")   { Trame.new_cadran_texte   ( visuel ); }
                         else { console.log (" Forme " + visuel.forme + " and mode " + visuel.mode + " inconnu. Dropping.");
                                visuel.Set_state = new function ( etat ) { console.log("Icon error"); };
                              }
                       }
                      else if (visuel.controle=="by_mode")       { Trame.new_by_mode ( visuel );       }
                      else if (visuel.controle=="by_color")      { Trame.new_by_color( visuel );       }
                      else if (visuel.controle=="by_mode_color") { Trame.new_by_mode_color ( visuel ); }
                      else if (visuel.controle=="by_js")         { Trame.new_by_js ( visuel ); }
                      else if (visuel.controle=="static")
                       { Trame.new_static( visuel, visuel.forme+"."+visuel.extension ); }

                      if (visuel.svggroupe !== undefined)
                       { visuel.svggroupe.on ( "click", function (event) { Clic_sur_visuel ( event, visuel ) }, false );
                         visuel.svggroupe.add("<title>"+htmlEncode(visuel.libelle)+"</title>");
                       }
                    }
                 );
          $.each ( Synoptique.cadrans, function (i, cadran)
                    { Trame.new_cadran ( cadran );
                      cadran.svggroupe.add("<title>"+htmlEncode(cadran.libelle)+"</title>");
                      /*if (cadran.svggroupe !== undefined)
                       { cadran.svggroupe.on ( "click", function (event) { Clic_sur_motif ( cadran, event ) }, false);
                       }*/
                    }
                 );
        }
/*---------------------------------------------------- Affichage des messages ------------------------------------------------*/
       if (DataTable.isDataTable('#idTableMessages')) { $('#idTableMessages').DataTable().ajax.reload(null, false); }
       else $("#idTableMessages").empty().DataTable(
        { pageLength : 50,
          fixedHeader: true, paging: false, ordering: true, searching: true,
          ajax: { url : $ABLS_API+"/histo/alive", type : "GET", dataSrc: "histo_msgs", contentType: "application/json",
                  data: function (d) { d.syn_page=Synoptique.page },
                  error: function ( xhr, status, error ) { Show_toast_ko(xhr.statusText); },
                  beforeSend: function (request)
                               { request.setRequestHeader('Authorization', 'Bearer ' + Token);
                                 request.setRequestHeader('X-ABLS-DOMAIN', localStorage.getItem('domain_uuid') );
                               }
                },
          rowId: "histo_msg_id",
          createdRow: function( row, item, dataIndex )
              { $(row).css("cursor", "pointer");
                $(row).off("click").on("click", function() { Msg_acquitter ( row.id ); } );
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
                      if (item.nom_ack!=null) return("<p class="+MSG_TYPOLOGIE[item.typologie].classe+"> "+htmlEncode(item.nom_ack)+"</p>");
                      return(""); /* by default */
                    }
                },
              ],
             order: [ [1, "desc"] ],
             responsive: false,
        });
/*---------------------------------------------------- Affichage des tableaux ------------------------------------------------*/
       idSectionTableaux.empty();
       if (Synoptique.nbr_tableaux>0)
        { $.each ( Synoptique.tableaux, function (i, tableau)
           { maps = Synoptique.tableaux_map.filter ( function (item) { return(item.tableau_id==tableau.tableau_id) } );
             if (tableau.mode == 0)
              { Charger_tableau_by_courbe ( "idSectionTableaux", tableau, maps );
                $('#idTableau-'+tableau.tableau_id).off("click").on("click", function ()
                 { $('#idTableau-'+tableau.tableau_id+"-div").toggleClass("w-100"); } );
                $('#idTableau-'+tableau.tableau_id).off("dblclick").on( "dblclick", function ()
                 { if (!document.fullscreenElement) document.getElementById("idTableau-"+tableau.tableau_id+"-div").requestFullscreen();
                   else document.exitFullscreen();
                 });
              }
             if (tableau.mode == 1)
              { Charger_tableau_by_table ( "idSectionTableaux", tableau, maps, "HOUR" );
                $('#idTableau-'+tableau.tableau_id).off("click").on("click", function ()
                 { $('#idTableau-'+tableau.tableau_id+"-div").toggleClass("w-100"); } );
              }
           });
        }
     }, null );
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
