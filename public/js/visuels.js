/********************************************* Appeler quand l'utilisateur selectionne un motif *******************************/
 function Clic_sur_visuel ( visuel )
  { console.log(" Clic sur visuel " + visuel.libelle + " mode="+visuel.mode + "disable = "+visuel.disable );
    if (visuel.disable) return;
    var target = { tech_id : visuel.tech_id,
                   acronyme: visuel.acronyme,
                 };
    Send_to_API ( 'POST', "/syn/clic", target, function () { }, null);
  }
/******************************************************************************************************************************/
/* Création d'un visuel sur la page de travail                                                                                */
/******************************************************************************************************************************/
 function Creer_visuel ( Response )
  { var id = "wtd-visu-"+Response.tech_id+"-"+Response.acronyme;
    var contenu;

/*-------------------------------------------------- Visuel mode cadre -------------------------------------------------------*/
         if (Response.ihm_affichage=="static")
     { contenu = $('<img>').addClass("wtd-visuel p-2")
                           .attr ( "id", id+"-img" )
                           .attr("src", "https://static.abls-habitat.fr/img/"+Response.forme+"."+Response.extension)
                           .click( function () { Clic_sur_visuel ( Response ); } );
     }
/*-------------------------------------------------- Visuel mode inline ------------------------------------------------------*/
    else if (Response.ihm_affichage=="by_mode")
     { contenu = $('<img>').addClass("wtd-visuel")
                           .attr ( "id", id+"-img" )
                           .attr("src", "https://static.abls-habitat.fr/img/"+Response.forme+"_"+Response.mode+"."+Response.extension)
                           .click( function () { Clic_sur_visuel ( Response ); } );
       if (Response.mode=="hors_comm") contenu.attr("src", "https://static.abls-habitat.fr/img/hors_comm.png");
       else contenu.attr("src", "https://static.abls-habitat.fr/img/"+Response.forme+"_"+Response.mode+"."+Response.extension);
     }
    else if (Response.ihm_affichage=="by_color")
     { contenu = $('<img>').addClass("wtd-visuel")
                           .attr ( "id", id+"-img" )
                           .attr("src", "https://static.abls-habitat.fr/img/"+Response.forme+"_"+Response.color+"."+Response.extension)
                           .click( function () { Clic_sur_visuel ( Response ); } );
       if (Response.mode=="hors_comm") contenu.attr("src", "https://static.abls-habitat.fr/img/hors_comm.png");
       else contenu.attr("src", "https://static.abls-habitat.fr/img/"+Response.forme+"_"+Response.color+"."+Response.extension);
     }
    else if (Response.ihm_affichage=="by_mode_color")
     { contenu = $('<img>').addClass("wtd-visuel")
                           .attr ( "id", id+"-img" )
                           .click( function () { Clic_sur_visuel ( Response ); } );
       if (Response.mode=="hors_comm") contenu.attr("src", "https://static.abls-habitat.fr/img/hors_comm.png");
       else contenu.attr("src", "https://static.abls-habitat.fr/img/"+Response.forme+"_"+Response.mode+"_"+Response.color+"."+Response.extension);
     }
    else
     {  }

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
                                        .append ( $("<span>").addClass("text-white").text(Response.libelle))
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
console.log("Changer_etat_visuel " + visuel.ihm_affichage );
    if (Synoptique.mode_affichage == false)
     { if (visuel.ihm_affichage=="static")
        { Changer_etat_visuel_static ( visuel, etat );  }
       else if (visuel.ihm_affichage=="by_mode")
        { Changer_etat_visuel_by_mode ( visuel, etat );   }
       else if (visuel.ihm_affichage=="by_color")
        { Changer_etat_visuel_by_color ( visuel, etat );   }
       else if (visuel.ihm_affichage=="by_mode_color")
        { Changer_etat_visuel_by_mode_color ( visuel, etat );   }
     }
    else /* Heavysyn */
     { /*else if (visuel.ihm_affichage=="complexe" && visuel.forme=="bouton")
                       { Trame.new_button ( visuel ); }
                      else if (visuel.ihm_affichage=="complexe" && visuel.forme=="encadre")
                       { Trame.new_encadre ( visuel ); }
                      else if (visuel.ihm_affichage=="complexe" && visuel.forme=="comment")
                       { Trame.new_comment ( visuel ); }
/*{ if (visuel.ihm_affichage=="static")
        { Changer_etat_visuel_static ( visuel, etat );  }
       else if (visuel.ihm_affichage=="by_mode")*/
        { visuel.Set_state ( etat ); }
       /*else if (visuel.ihm_affichage=="by_color")
        { Changer_etat_visuel_by_color ( visuel, etat );   }
       else if (visuel.ihm_affichage=="by_mode_color")
        { Changer_etat_visuel_by_mode_color ( visuel, etat );   }*/
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
     { target = "https://static.abls-habitat.fr/img/"+visuel.forme+"_"+etat.mode+"."+visuel.extension;
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
    target = "https://static.abls-habitat.fr/img/"+visuel.forme+"_"+etat.color+"."+visuel.extension;
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
     { target = "https://static.abls-habitat.fr/img/"+visuel.forme+"_"+etat.mode+"_"+etat.color+"."+visuel.extension;
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
    target = "https://static.abls-habitat.fr/img/"+visuel.forme+"."+visuel.extension;
    Changer_img_src ( idimage, target );
    $("#"+idimage).removeClass("wtd-img-grayscale");
/*-------------------------------------------------- Visuel commun -----------------------------------------------------------*/
    if (etat.cligno) $("#"+idimage).addClass("wtd-cligno");
                else $("#"+idimage).removeClass("wtd-cligno");
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
