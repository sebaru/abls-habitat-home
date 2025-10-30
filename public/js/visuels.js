/********************************************* Appeler quand l'utilisateur selectionne un motif *******************************/
 function Clic_sur_visuel ( event, visuel )
  { event.preventDefault();
    if (visuel.clic_inhib == true)                                                                 /* Le clic est-il inhibé ? */
     { console.log(" Clic sur visuel clic_inhib: " + visuel.libelle );
       visuel.clic_inhib = false;                                                        /* Le prochain clic n'est pas inhibé */
       return;
     }
    if (visuel.disable) { console.log(" Clic sur visuel disabled: " + visuel.libelle ); return; }

    console.log(" Clic sur visuel " + visuel.libelle + " mode="+visuel.mode );
    var target = { tech_id : visuel.tech_id, acronyme: visuel.acronyme };
    Send_to_API ( 'POST', "/syn/clic", target, function () { }, null);
  }
/********************************************* Appeler long quand l'utilisateur selectionne un motif **************************/
 function Long_Clic_sur_visuel ( event, visuel )
  { event.preventDefault();
    if (visuel.disable) { console.log(" Clic sur visuel disabled: " + visuel.libelle ); return; }
    console.log(" Clic long sur visuel " + visuel.libelle + " mode="+visuel.mode + " disable = "+visuel.disable );
    var target = { tech_id : visuel.tech_id, acronyme: visuel.acronyme, long: true };
    Send_to_API ( 'POST', "/syn/clic", target, function () { }, null);
  }
/******************************************************************************************************************************/
/* Création d'un visuel sur la page de travail                                                                                */
/******************************************************************************************************************************/
 function Creer_light_visuel ( Response )
  { var id = "wtd-visu-"+Response.tech_id+"-"+Response.acronyme;
    var contenu;

/*-------------------------------------------------- Visuel mode cadre -------------------------------------------------------*/
         if (Response.controle=="static")
     { contenu = $('<img>').addClass("wtd-visuel p-2")
                           .attr ( "id", id+"-img" )
                           .attr("src", localStorage.getItem("static_data_url")+"/img/"+Response.forme+"."+Response.extension);
     }
/*-------------------------------------------------- Visuel mode inline ------------------------------------------------------*/
    else if (Response.controle=="by_mode")
     { contenu = $('<img>').addClass("wtd-visuel")
                           .attr ( "id", id+"-img" )
                           .attr("src", localStorage.getItem("static_data_url")+"/img/"+Response.forme+"_"+Response.mode+"."+Response.extension)
                           .append($('<img>').attr("id", id+"_HG") /*.attr("src","")*/
                                             .addClass("wtd-vignette wtd-img-superpose-haut-gauche").slideUp() );
       contenu.attr("src", localStorage.getItem("static_data_url")+"/img/"+Response.forme+"_"+Response.mode+"."+Response.extension);
     }
    else if (Response.controle=="by_color")
     { contenu = $('<img>').addClass("wtd-visuel")
                           .attr ( "id", id+"-img" )
                           .attr("src", localStorage.getItem("static_data_url")+"/img/"+Response.forme+"_"+Response.color+"."+Response.extension);
       contenu.attr("src", localStorage.getItem("static_data_url")+"/img/"+Response.forme+"_"+Response.color+"."+Response.extension);
     }
    else if (Response.controle=="by_mode_color")
     { contenu = $('<img>').addClass("wtd-visuel")
                           .attr ( "id", id+"-img" );
       contenu.attr("src", localStorage.getItem("static_data_url")+"/img/"+Response.forme+"_"+Response.mode+"_"+Response.color+"."+Response.extension);
     }
    else if (Response.controle=="complexe" && Response.forme=="cadran")
     { if (Response.mode=="texte")
        { contenu = $('<h4></h4>').addClass("text-center text-white").text( "Loading" )
                    .attr("id", "wtd-visuel-texte-"+Response.tech_id+"-"+Response.acronyme);
        }
       else if (Response.mode.startsWith("progress"))
        { contenu = $('<div>')
                    .append ( $('<div>').addClass("progress my-2")
                              .append( $('<div>').addClass("progress-bar")
                                       .attr("id", "wtd-visuel-barre-"+Response.tech_id+"-"+Response.acronyme)
                                       .attr("role", "progressbar" )
                                       .attr("aria-valuemin", Response.minimum )
                                       .attr("aria-valuemax", Response.maximum )
                                     )
                            )
                    .append( $('<h4>').addClass("text-center text-white").text( "Loading" )
                             .attr("id", "wtd-visuel-texte-"+Response.tech_id+"-"+Response.acronyme)
                           );
        }
       else { console.log ( "Visuel mode unknow for cadran: " + Response.tech_id+"-"+Response.acronyme ); return(null); }
     }
    else { console.log ( "Visuel unknow : " + Response.tech_id+"-"+Response.acronyme ); return(null); }

    contenu.click( function (event) { Clic_sur_visuel ( event, Response ); } );
    contenu.on("touchstart mousedown", function(event)                           /* Démarre un timer lors du début de l'appui */
             { Response.clic_timer = setTimeout(function()
                { Response.clic_inhib = true;                                                    /* Interdit le prochain clic */
                  Long_Clic_sur_visuel(event, Response);                                               /* Fonction à exécuter */
                  clearTimeout(Response.clic_timer);
                }, 2000);
             })
           .on("touchend mouseup touchmove mousemove", function(event)/* Annule le timer si l'appui est relâché avant la fin du délai */
            { if (Response.clic_timer)
               { clearTimeout(Response.clic_timer);
                 Response.clic_timer = null;
               }
            });

console.debug ( Response );
    var card = $('<div>').addClass("row bg-transparent mb-3")
               .append( $('<div>').addClass("col text-center mb-1")
                                  .append ( $("<span>").addClass("text-white").text(Response.dls_owner_shortname))
                      )
               .append( $('<div>').addClass('w-100') )
               .append( $('<div>').addClass("col text-center mb-1")
                        .append( contenu )
                      )
               .append( $('<div>').addClass('w-100') )
               .append( $('<div>').addClass("col text-center")
                        .append ( $("<span>").addClass("text-white")
                                  .text( (Response.input_libelle != null ? Response.input_libelle : Response.libelle) ))
                        .attr ( "id", id+"-footer-text" )
                      )
               .attr ( "id", id );

    return(card);
  }
/******************************************************************************************************************************/
/* Changer_etat_visuel: Appeler par la websocket pour changer un visuel d'etat                                                */
/******************************************************************************************************************************/
 function Changer_etat_visuel ( etat )
  { if (Synoptique==null) return;
    visuels = Synoptique.visuels.filter( function (item) { return(item.tech_id==etat.tech_id && item.acronyme==etat.acronyme); });
    if (visuels.length!=1) return;
    visuel = visuels[0];
/*-------------------------------------------------- Visuel mode inline ------------------------------------------------------*/
console.log("Changer_etat_visuel " + visuel.controle + " " + visuel.tech_id + ":" + visuel.acronyme +
            " valeur=" + etat.valeur + " unite=" + etat.unite + " decimal=" + etat.nb_decimal );

    if (Synoptique.mode_affichage == false) /* Affichage léger */
     { if (visuel.forme == "cadran")
        { Changer_etat_cadran ( visuel, etat ); }
       else if (visuel.controle=="static")
        { Changer_etat_visuel_static ( visuel, etat );  }
       else if (visuel.controle=="by_mode")
        { Changer_etat_visuel_by_mode ( visuel, etat );   }
       else if (visuel.controle=="by_color")
        { Changer_etat_visuel_by_color ( visuel, etat );   }
       else if (visuel.controle=="by_mode_color")
        { Changer_etat_visuel_by_mode_color ( visuel, etat );   }
     }
    else /* affichage lourd */
     { console.log ( visuel );
       if (typeof visuel.Set_state === 'function') { visuel.Set_state ( etat ); }
       else { console.log ( "No Set_state for " + visuel );
              console.log ( visuel );
            }
     }
  }
/******************************************************************************************************************************/
/* Changer_etat_visuel: Appeler par la websocket pour changer un visuel d'etat                                                */
/******************************************************************************************************************************/
 function Changer_etat_visuel_by_mode ( visuel, etat )
  { var idvisuel = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme;
    var idimage  = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-img";
    var idfooter = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-footer-text";
    visuels = Synoptique.visuels.filter( function (item) { return(item.tech_id==etat.tech_id && item.acronyme==etat.acronyme); });
    if (visuels.length!=1) return;
    visuel = visuels[0];
    console.log("Changer_etat_visuel_by_mode " + etat.tech_id + ":" + etat.acronyme + " -> mode = "+etat.mode +" couleur="+etat.color );
    console.debug(visuel);
/*-------------------------------------------------- Visuel si pas de comm ---------------------------------------------------*/
    if (etat.disable==true) $("#"+idimage).addClass("wtd-img-grayscale");
                       else $("#"+idimage).removeClass("wtd-img-grayscale");
/*-------------------------------------------------- Visuel si pas de comm ---------------------------------------------------*/
    if (etat.mode=="default")                                                                              /* si mode inconnu */
     { etat.cligno = false;
       target = "https://static.abls-habitat.fr/img/question.png";
       Changer_img_src ( idimage, target );
     }
/*-------------------------------------------------- Visuel mode inline ------------------------------------------------------*/
    else
     { target = localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+etat.mode+"."+visuel.extension;
       Changer_img_src ( idimage, target );
     }
/*-------------------------------------------------- Visuel commun -----------------------------------------------------------*/
    if (etat.cligno) $("#"+idimage).addClass("wtd-cligno");
                else $("#"+idimage).removeClass("wtd-cligno");
    $("#"+idfooter).addClass("text-white").text(etat.libelle);
  }
/******************************************************************************************************************************/
/* Changer_etat_visuel: Appeler par la websocket pour changer un visuel d'etat                                                */
/******************************************************************************************************************************/
 function Changer_etat_visuel_by_color ( visuel, etat )
  { var idvisuel = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme;
    var idimage  = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-img";
    var idfooter = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-footer-text";
    visuels = Synoptique.visuels.filter( function (item) { return(item.tech_id==etat.tech_id && item.acronyme==etat.acronyme); });
    if (visuels.length!=1) return;
    visuel = visuels[0];
    console.log("Changer_etat_1_visuel_by_color " + etat.tech_id + ":" + etat.acronyme + " -> mode = "+etat.mode +" couleur="+etat.color );
    console.debug(visuel);
/*-------------------------------------------------- Visuel si pas de comm ---------------------------------------------------*/
    if (etat.disable==true) $("#"+idimage).addClass("wtd-img-grayscale");
                       else $("#"+idimage).removeClass("wtd-img-grayscale");
/*-------------------------------------------------- Visuel mode inline ------------------------------------------------------*/
    target = localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+etat.color+"."+visuel.extension;
    Changer_img_src ( idimage, target );
/*-------------------------------------------------- Visuel commun -----------------------------------------------------------*/
    if (etat.cligno) $("#"+idimage).addClass("wtd-cligno");
                else $("#"+idimage).removeClass("wtd-cligno");
    $("#"+idfooter).addClass("text-white").text(etat.libelle);
  }
/******************************************************************************************************************************/
/* Changer_etat_visuel: Appeler par la websocket pour changer un visuel d'etat                                                */
/******************************************************************************************************************************/
 function Changer_etat_visuel_by_mode_color ( visuel, etat )
  { var idvisuel = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme;
    var idimage  = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-img";
    var idfooter = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-footer-text";
    visuels = Synoptique.visuels.filter( function (item) { return(item.tech_id==etat.tech_id && item.acronyme==etat.acronyme); });
    if (visuels.length!=1) return;
    visuel = visuels[0];
    console.log("Changer_etat_visuel_by_mode_color " + etat.tech_id + ":" + etat.acronyme + " -> mode = "+etat.mode +" couleur="+etat.color );
    console.debug(visuel);
/*-------------------------------------------------- Visuel si pas de comm ---------------------------------------------------*/
    if (etat.disable==true) $("#"+idimage).addClass("wtd-img-grayscale");
                       else $("#"+idimage).removeClass("wtd-img-grayscale");
/*-------------------------------------------------- Visuel si pas de comm ---------------------------------------------------*/
    if (etat.mode=="default")                                                                         /* si mode inconnu */
     { etat.cligno = false;
       target = "https://static.abls-habitat.fr/img/question.png";
       Changer_img_src ( idimage, target );
     }
/*-------------------------------------------------- Visuel mode inline ------------------------------------------------------*/
    else
     { target = localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+etat.mode+"_"+etat.color+"."+visuel.extension;
       Changer_img_src ( idimage, target );
     }
/*-------------------------------------------------- Visuel commun -----------------------------------------------------------*/
    if (etat.cligno) $("#"+idimage).addClass("wtd-cligno");
                else $("#"+idimage).removeClass("wtd-cligno");
    $("#"+idfooter).addClass("text-white").text(etat.libelle);
  }
/******************************************************************************************************************************/
/* Changer_etat_visuel: Appeler par la websocket pour changer un visuel d'etat                                                */
/******************************************************************************************************************************/
 function Changer_etat_visuel_static ( visuel, etat )
  { var idvisuel = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme;
    var idimage  = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-img";
    var idfooter = "wtd-visu-"+etat.tech_id+"-"+etat.acronyme+"-footer-text";
    visuels = Synoptique.visuels.filter( function (item) { return(item.tech_id==etat.tech_id && item.acronyme==etat.acronyme); });
    if (visuels.length!=1) return;
    visuel = visuels[0];
    console.log("Changer_etat_visuel_static " + etat.tech_id + ":" + etat.acronyme + " -> mode = "+etat.mode +" couleur="+etat.color );
    console.debug(visuel);

/*-------------------------------------------------- Visuel mode inline ------------------------------------------------------*/
    target = localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"."+visuel.extension;
    Changer_img_src ( idimage, target );
    $("#"+idimage).removeClass("wtd-img-grayscale");
/*-------------------------------------------------- Visuel commun -----------------------------------------------------------*/
    if (etat.cligno) $("#"+idimage).addClass("wtd-cligno");
                else $("#"+idimage).removeClass("wtd-cligno");
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
