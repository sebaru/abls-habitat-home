/******************************************************************************************************************************/
/* Creer_cadran: Ajoute un cadran sur la page du synoptique                                                                   */
/******************************************************************************************************************************/
 function Creer_cadran ( cadran )
  { var card = $('<div></div>').addClass("row bg-transparent m-1")
               .append( $('<div></div>').addClass("col text-center")
                        .append( $('<span></span>').addClass("text-white").text( cadran.libelle ) )
                      )
               .append( $('<div></div>').addClass('w-100') );

    if (cadran.mode=="simple")
     { /**/
     }
    else if (cadran.mode=="progress")
     { var barres = $('<div></div>').addClass("col");
       barres.append( $('<div></div>').addClass("progress")
                      .append( $('<div></div>').addClass("progress-bar")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                    );
       card.append(barres).append( $('<div></div>').addClass('w-100') );
     }
    else if (cadran.mode=="progress-rovor")
     { var barres = $('<div></div>').addClass("col");
       barres.append( $('<div></div>').addClass("progress")
                      .append( $('<div></div>').addClass("progress-bar bg-danger")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre1")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                      .append( $('<div></div>').addClass("progress-bar bg-warning")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre2")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                      .append( $('<div></div>').addClass("progress-bar bg-success")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre3")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                      .append( $('<div></div>').addClass("progress-bar bg-warning")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre4")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                      .append( $('<div></div>').addClass("progress-bar bg-danger")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre5")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                    );
       card.append(barres).append( $('<div></div>').addClass('w-100') );
     }
    else if (cadran.mode=="progress-vor")
     { var barres = $('<div></div>').addClass("col");
       barres.append( $('<div></div>').addClass("progress")
                      .append( $('<div></div>').addClass("progress-bar bg-success")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre1")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                      .append( $('<div></div>').addClass("progress-bar bg-warning")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre2")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                      .append( $('<div></div>').addClass("progress-bar bg-danger")
                               .attr("id", "wtd-cadran-"+cadran.tech_id+"-"+cadran.acronyme+"-barre3")
                               .attr("role", "progressbar" )
                               .attr("aria-valuemin", cadran.minimum )
                               .attr("aria-valuemax", cadran.maximum )
                             )
                    );
       card.append(barres).append( $('<div></div>').addClass('w-100') );
     }

    card.append( $('<div></div>').addClass("col text-center")
                 .append( $('<h4></h4>').addClass("text-white").text( "Loading" )
                          .attr("id", "wtd-cadran-texte-"+cadran.tech_id+"-"+cadran.acronyme)
                        )
               );

    return(card);
  }
/******************************************************************************************************************************/
/* Changer_etat_cadran: Appeler par la websocket pour changer un visuel d'un cadran                                           */
/******************************************************************************************************************************/
 function Changer_etat_cadran ( visuel, etat )
  { visuel.valeur = etat.valeur;
    console.log("Changer_etat_cadran valeur="+etat.valeur+ " unite " + visuel.unite + " decimal " + visuel.decimal
                +" min="+minimum+" max="+maximum
                +" ntb="+visuel.seuil_ntb+" nb="+visuel.seuil_nb+" nh="+visuel.seuil_nh+" nth="+visuel.seuil_nth);

    if (visuel.mode=="texte")
     {
     }
    else if (visuel.mode.startsWith("progress"))
     { var minimum = parseFloat(visuel.minimum);
       var maximum = parseFloat(visuel.maximum);
       if (visuel.valeur<minimum) visuel.valeur=minimum;
       if (visuel.valeur>maximum) visuel.valeur=maximum;
       var position = 100*(visuel.valeur-minimum)/(maximum-minimum);
       var idvisuelbarre = "wtd-visuel-barre-"+visuel.tech_id+"-"+visuel.acronyme;

       $('#'+idvisuelbarre).css("width", position+"%").attr("aria-valuenow", position);

       $('#'+idvisuelbarre).removeClass("bg-danger bg-success bg-warning");
       if (visuel.mode == "progress-rov" )
       {      if ( visuel.valeur<=visuel.seuil_ntb ) { $('#'+idvisuelbarre).addClass("bg-danger"); }
         else if ( visuel.valeur<=visuel.seuil_nb )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
         else { $('#'+idvisuelbarre).addClass("bg-success"); }
       }
      else if (visuel.mode == "progress-rovor" )
       {      if ( visuel.valeur<=visuel.seuil_ntb ) { $('#'+idvisuelbarre).addClass("bg-danger"); }
         else if ( visuel.valeur<=visuel.seuil_nb )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
         else if ( visuel.valeur<=visuel.seuil_nh )  { $('#'+idvisuelbarre).addClass("bg-success"); }
         else if ( visuel.valeur<=visuel.seuil_nth )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
         else { $('#'+idvisuelbarre).addClass("bg-danger"); }
       }
     }

    var idvisueltexte = "wtd-visuel-texte-"+visuel.tech_id+"-"+visuel.acronyme;
    texte = visuel.valeur.toFixed(visuel.decimal);                                             /* Affiche la valeur non capée */
    $('#'+idvisueltexte).text( texte + " " + visuel.unite );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
