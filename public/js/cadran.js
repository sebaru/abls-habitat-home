/******************************************************************************************************************************/
/* Changer_etat_cadran: Appeler par la websocket pour changer un visuel d'un cadran                                           */
/******************************************************************************************************************************/
 function Changer_etat_cadran ( visuel, etat )
  { visuel.valeur     = etat.valeur;
    visuel.unite      = etat.unite;
    visuel.nb_decimal = etat.nb_decimal;
    console.log("Changer_etat_cadran valeur="+visuel.valeur+ " unite " + visuel.unite + " mode: " + visuel.mode +
                " nb_decimal " + visuel.nb_decimal +" minimim="+visuel.minimum+" maximum="+visuel.maximum +
                " ntb="+visuel.seuil_ntb+" nb="+visuel.seuil_nb+" nh="+visuel.seuil_nh+" nth="+visuel.seuil_nth);

    var minimum = parseFloat(visuel.minimum);
    var maximum = parseFloat(visuel.maximum);
    var valeur_capee = visuel.valeur;                                           /* Calcul de la valeur capée pour l'affichage */
         if (visuel.valeur<minimum) valeur_capee=minimum;
    else if (visuel.valeur>maximum) valeur_capee=maximum;

    if (visuel.mode=="texte")
     {
     }
    else if (visuel.mode.startsWith("progress"))
     { var position = 100*(valeur_capee-minimum)/(maximum-minimum);
       var idvisuelbarre = "wtd-visuel-barre-"+visuel.tech_id+"-"+visuel.acronyme;

       $('#'+idvisuelbarre).css("width", position+"%").attr("aria-valuenow", position);

       $('#'+idvisuelbarre).removeClass("bg-danger bg-success bg-warning");
       if (visuel.mode == "progress-rov" )
        {      if ( valeur_capee<=visuel.seuil_ntb ) { $('#'+idvisuelbarre).addClass("bg-danger"); }
          else if ( valeur_capee<=visuel.seuil_nb )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
          else { $('#'+idvisuelbarre).addClass("bg-success"); }
        }
       else if (visuel.mode == "progress-vor" )
        {      if ( valeur_capee>=visuel.seuil_nth ) { $('#'+idvisuelbarre).addClass("bg-danger"); }
          else if ( valeur_capee>=visuel.seuil_nh )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
          else { $('#'+idvisuelbarre).addClass("bg-success"); }
        }
       else if (visuel.mode == "progress-rovor" )
        {      if ( valeur_capee<=visuel.seuil_ntb ) { $('#'+idvisuelbarre).addClass("bg-danger"); }
          else if ( valeur_capee<=visuel.seuil_nb )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
          else if ( valeur_capee<=visuel.seuil_nh )  { $('#'+idvisuelbarre).addClass("bg-success"); }
          else if ( valeur_capee<=visuel.seuil_nth ) { $('#'+idvisuelbarre).addClass("bg-warning"); }
          else { $('#'+idvisuelbarre).addClass("bg-danger"); }
        }
     }

    var idvisueltexte = "wtd-visuel-texte-"+visuel.tech_id+"-"+visuel.acronyme;
    texte = visuel.valeur.toFixed(visuel.nb_decimal);                                          /* Affiche la valeur non capée */
    $('#'+idvisueltexte).text( texte + " " + visuel.unite );
  }
/******************************************************************************************************************************/
/* Clic_sur_cadran: Ouvrir le modal de saisie de valeur / durée selon le type de cadran                                       */
/******************************************************************************************************************************/
 function Clic_sur_cadran ( visuel )
  { if (!visuel.rw) return;
    console.log("Clic_sur_cadran " + visuel.tech_id + ":" + visuel.acronyme + " mode=" + visuel.mode);

    if (visuel.mode == "horaire")
     { var valeur_brute = parseFloat(visuel.valeur) || 0;           /* Valeur interne en dixièmes de secondes */
       var temps    = valeur_brute / 10.0;
       var heures   = Math.floor(temps / 3600);
       temps %= 3600;
       var minutes  = Math.floor(temps / 60);
       var secondes = Math.floor(temps % 60);

       $('#idModalCadranHoraireTitre').text(visuel.libelle);
       $('#idModalCadranHoraireH'  ).val(heures);
       $('#idModalCadranHoraireMn' ).val(minutes);
       $('#idModalCadranHoraireSec').val(secondes);

       $('#idModalCadranHoraireValider').off("click").on("click", function ()
        { var h   = parseInt($('#idModalCadranHoraireH'  ).val()) || 0;
          var mn  = parseInt($('#idModalCadranHoraireMn' ).val()) || 0;
          var sec = parseInt($('#idModalCadranHoraireSec').val()) || 0;
          var nouvelle_valeur = (h * 3600 + mn * 60 + sec) * 10;   /* Reconversion en dixièmes de secondes */
          Send_to_API ( 'POST', "/syn/set_cadran",
                        { tech_id: visuel.tech_id, acronyme: visuel.acronyme, valeur: nouvelle_valeur },
                        function () { Show_toast_ok("Durée mise à jour."); },
                        function () { Show_toast_ko("Erreur lors de la mise à jour de la durée."); } );
        });
       $('#idModalCadranHoraire').modal("show");
     }
    else                                                             /* mode texte ou progress-* */
     { var step = visuel.nb_decimal > 0 ? Math.pow(10, -visuel.nb_decimal) : 1;
       $('#idModalCadranTexteTitre').text(visuel.libelle);
       $('#idModalCadranTexteValeur')
           .attr("min",  parseFloat(visuel.minimum))
           .attr("max",  parseFloat(visuel.maximum))
           .attr("step", step)
           .val(parseFloat(visuel.valeur).toFixed(visuel.nb_decimal));

       $('#idModalCadranTexteValider').off("click").on("click", function ()
        { var nouvelle_valeur = parseFloat($('#idModalCadranTexteValeur').val());
          if (isNaN(nouvelle_valeur)) return;
          Send_to_API ( 'POST', "/syn/set_cadran",
                        { tech_id: visuel.tech_id, acronyme: visuel.acronyme, valeur: nouvelle_valeur },
                        function () { Show_toast_ok("Valeur mise à jour."); },
                        function () { Show_toast_ko("Erreur lors de la mise à jour de la valeur."); } );
        });
       $('#idModalCadranTexte').modal("show");
     }
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
