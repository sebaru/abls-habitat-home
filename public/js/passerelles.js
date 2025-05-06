/******************************************************************************************************************************/
 function Set_syn_vars ( bit, syn )
  { if (syn.syn_id == 1) return;
    if (!Synoptique) return;
    console.log("Set_syn_vars: "+bit+"="+syn.etat+" for syn " + syn.syn_id );
    var target_syn = Synoptique.child_syns.filter ( function(child) { return child.syn_id==syn.syn_id } )[0];
    if (target_syn === undefined) { console.log("target_syn " + syn.syn_id + " non trouvé" ); return; }

    if (bit) target_syn[bit] = syn.etat;                     /* Recopie de l'etat du bit d'anomalie dans la structure interne */

/*    if (!syn_vars) return;
    if (syn_vars.bit_comm == false)
     { $('#idImgSyn_'+syn_id).addClass("wtd-img-grayscale");
       Changer_img_src ( "idVignetteComm_"+syn_id, "https://static.abls-habitat.fr/img/syn_communication.png", true );
     }
    else
     { $('#idImgSyn_'+syn_id).removeClass("wtd-img-grayscale");
       $('#idVignetteComm_'+syn_id).removeClass("wtd-cligno").fadeTo(0);
     }
*/
    if (target_syn["MEMSA_DANGER"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/croix_red.svg", true );
     }
    else if (target_syn["MEMSA_ALERTE"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/bouclier_red.svg", true );
     }
    else if (target_syn["MEMSA_ALARME"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/pignon_red.svg", true );
     }
    else if (target_syn["MEMSA_DEFAUT"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/pignon_yellow.svg", true );
     }
    else if (target_syn["MEMSSP_DERANGEMENT"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/croix_orange.svg", true );
     }
    else if (target_syn["MEMSA_ALERTE_FIXE"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/bouclier_red.svg", false );
     }
    else if (target_syn["MEMSA_ALARME_FIXE"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/pignon_red.svg",false );
     }
    else if (target_syn["MEMSA_DEFAUT_FIXE"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/pignon_yellow.svg",false );
     }
    else if (target_syn["MEMSSP_DANGER_FIXE"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/croix_red.svg",false );
     }
    else if (target_syn["MEMSA_DERANGEMENT_FIXE"] == true)
     { Changer_img_src ( "idVignette_"+syn.syn_id, "https://static.abls-habitat.fr/img/croix_orange.svg", false );
     }
/*    else if (syn_vars.bit_veille_totale == true)
     { vignette.removeClass("wtd-cligno").fadeTo(0);
     }
    else if (syn_vars.bit_veille_partielle == true)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/bouclier_yellow.svg", false );
     }
    else if (syn_vars.bit_veille_partielle == false)
     { Changer_img_src ( "idVignette_"+syn_id, "https://static.abls-habitat.fr/img/bouclier_white.svg",false );
     }*/
    else
     { Changer_img_src ( "idVignette_"+syn.syn_id, "", false );
     }
  }
/********************************************* Appelé au chargement de la page ************************************************/
 function Creer_passerelle ( Response )
  { var card = $('<div></div>').addClass("row bg-transparent mb-3")
               .append( $('<div></div>').addClass("col text-center mb-1")
                        .append( $('<div></div>').addClass("d-inline-block wtd-img-container")
                                 .append($('<img>').attr("src", (Response.image=="custom" ? Response.image
                                                                                          : localStorage.getItem("static_data_url")+"/img/"+Response.image) )
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
