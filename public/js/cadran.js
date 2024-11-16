/******************************************************************************************************************************/
/* Changer_etat_cadran: Appeler par la websocket pour changer un visuel d'un cadran                                           */
/******************************************************************************************************************************/
 function Changer_etat_cadran ( visuel, etat )
  { visuel.valeur = etat.valeur;
    console.log("Changer_etat_cadran valeur="+etat.valeur+ " unite " + visuel.unite + " mode: " + visuel.mode +
                " nb_decimal " + visuel.nb_decimal +" minimim="+minimum+" maximum="+maximum
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
       else if (visuel.mode == "progress-vor" )
        {      if ( visuel.valeur>=visuel.seuil_nth ) { $('#'+idvisuelbarre).addClass("bg-danger"); }
          else if ( visuel.valeur>=visuel.seuil_nh )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
          else { $('#'+idvisuelbarre).addClass("bg-success"); }
        }
       else if (visuel.mode == "progress-rovor" )
        {      if ( visuel.valeur<=visuel.seuil_ntb ) { $('#'+idvisuelbarre).addClass("bg-danger"); }
          else if ( visuel.valeur<=visuel.seuil_nb )  { $('#'+idvisuelbarre).addClass("bg-warning"); }
          else if ( visuel.valeur<=visuel.seuil_nh )  { $('#'+idvisuelbarre).addClass("bg-success"); }
          else if ( visuel.valeur<=visuel.seuil_nth ) { $('#'+idvisuelbarre).addClass("bg-warning"); }
          else { $('#'+idvisuelbarre).addClass("bg-danger"); }
        }
     }

    var idvisueltexte = "wtd-visuel-texte-"+visuel.tech_id+"-"+visuel.acronyme;
    texte = visuel.valeur.toFixed(visuel.nb_decimal);                                             /* Affiche la valeur non capée */
    $('#'+idvisueltexte).text( texte + " " + visuel.unite );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
