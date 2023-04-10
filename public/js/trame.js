
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Trame_new ( idcontainer )
  {
    $("#"+idcontainer).empty().css("position","relative");
    var Trame = SVG().addTo("#"+idcontainer).attr("id", "idTrame")
                     .attr("viewBox", "0 0 1920 1080")
                     .attr("preserveAspectRatio", "xMidYMid meet")
                     .addClass("border border-success")
                     .css("background-color", "darkgray");
    Trame.maille = 1;
/***************************************************** Set Grille *************************************************************/
    Trame.set_grille = function ( maille )
     { this.maille = maille;
       if (this.grille !== undefined) this.grille.remove();
       if(!maille) return;
       var x, y;
       this.grille = this.group().attr("id", "wtd-grille");
       for ( x=0; x<1920; x+=maille )
        { for ( y=0; y<1080; y+=maille )
           { var point = this.circle(2).fill("black").cx(x).cy(y);
             this.grille.add(point);
           }
        }
     }
/*************************************** Met à jour la matrice de transformation **********************************************/
    Trame.update_matrice = function ( visuel )
     { visuel.svggroupe.transform ( { scale: visuel.scale, translate: [visuel.posx, visuel.posy],
                                      rotate: visuel.angle, origin: 'center center' } );
     }

/***************************************************** New image **************************************************************/
    Trame.new_from_image = function ( visuel, image_filename )
     { console.log ( "new image " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var svgimage = this.image( "https://static.abls-habitat.fr/img/"+image_filename, function(event)
                                   { this.dx ( -this.width()/2 );
                                     this.dy ( -this.height()/2 );
                                   } ).attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       this.update_matrice ( visuel );
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_static = function ( visuel )
     { console.log ( "new static " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       var svgimage = this.image( "https://static.abls-habitat.fr/img/"+visuel.forme+"."+visuel.extension,
                                  function(event)
                                   { this.dx ( -this.width()/2 );
                                     this.dy ( -this.height()/2 );
                                   } ).attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { visuel.mode = etat.mode;
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                           }
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_by_mode = function ( visuel )
     { console.log ( "new by_mode " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       var svgimage = this.image( "https://static.abls-habitat.fr/img/"+visuel.forme+"_"+visuel.mode+"."+visuel.extension,
                                  function(event)
                                   { this.dx ( -this.width()/2 );
                                     this.dy ( -this.height()/2 );
                                   } ).attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { if (visuel.mode != etat.mode)
                              { groupe.fadeOut("fast", function ()
                                 { svgimage.load("https://static.abls-habitat.fr/img/"+visuel.forme+"_"+visuel.mode+"."+visuel.extension );
                                   groupe.fadeIn();
                                 } );
                              }
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                             if (etat.disable==true) visuel.svggroupe.addClass("wtd-img-grayscale");
                                                else visuel.svggroupe.removeClass("wtd-img-grayscale");
                             visuel.mode    = etat.mode;
                             visuel.cligno  = etat.cligno;
                             visuel.color   = etat.color;
                             visuel.disable = etat.disable;
                           }
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_by_mode_color = function ( visuel )
     { console.log ( "new by_mode_color " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       var svgimage = this.image( "https://static.abls-habitat.fr/img/"+visuel.forme+"_"+visuel.mode+"_"+visuel.color+"."+visuel.extension,
                                  function(event)
                                   { this.dx ( -this.width()/2 );
                                     this.dy ( -this.height()/2 );
                                   } ).attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { if (visuel.mode != etat.mode || visuel.color != etat.color)
                              { groupe.fadeOut("fast", function ()
                                 { svgimage.load("https://static.abls-habitat.fr/img/"+visuel.forme+"_"+visuel.mode+"_"+visuel.color+"."+visuel.extension );
                                   groupe.fadeIn();
                                 } );
                              }
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                             if (etat.disable==true) visuel.svggroupe.addClass("wtd-img-grayscale");
                                                else visuel.svggroupe.removeClass("wtd-img-grayscale");
                             visuel.mode    = etat.mode;
                             visuel.cligno  = etat.cligno;
                             visuel.color   = etat.color;
                             visuel.disable = etat.disable;
                           }
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_by_color = function ( visuel )
     { console.log ( "new by_color " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       var svgimage = this.image( "https://static.abls-habitat.fr/img/"+visuel.forme+"_"+visuel.color+"."+visuel.extension,
                                  function(event)
                                   { this.dx ( -this.width()/2 );
                                     this.dy ( -this.height()/2 );
                                   } ).attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { if (visuel.color != etat.color)
                              { groupe.fadeOut("fast", function ()
                                 { svgimage.load("https://static.abls-habitat.fr/img/"+visuel.forme+"_"+visuel.color+"."+visuel.extension );
                                   groupe.fadeIn();
                                 } );
                              }
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                             if (etat.disable==true) visuel.svggroupe.addClass("wtd-img-grayscale");
                                                else visuel.svggroupe.removeClass("wtd-img-grayscale");
                             visuel.mode    = etat.mode;
                             visuel.cligno  = etat.cligno;
                             visuel.color   = etat.color;
                             visuel.disable = etat.disable;
                           }
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return( visuel );
     }
/***************************************************** New cadran *************************************************************/
    Trame.new_cadran = function ( visuel )
     { console.log ( "new cadran " + visuel.forme + " " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var rectangle = Trame.rect ( 120, 40 ).attr("rx", 10).fill("gray" ).stroke({ width:2, color:"lightgreen" }).cx(0).cy(0);
       visuel.svggroupe.add ( rectangle );

       var texte = this.text( "- cadran -" ).font ( { family: "arial", size:16, anchor: "middle", variant:"italic" } )
                       .cx(0).cy(0).css("cursor", "default");
       visuel.svggroupe.add ( texte );
       visuel.Set_text = function ( etat )
                          { if (this.classe=="CH")
                             { var date = new Date();
                               date.setSeconds(etat.valeur);
                               var hhmmssFormat = date.toISOString().substr(11, 8);
                               texte.text (hhmmssFormat);
                             }
                            else if (this.classe="CI")
                             { texte.text( etat.valeur.toString() + " " + etat.unite ); }
                            else if (this.classe=="REGISTRE" && this.forme=="horaire")
                             { var heure = Math.trunc(etat.valeur);
                               var minute = Math.trunc((etat.valeur - heure)*100); if (minute > 59) minute = 59;
                               texte.text ( ("0"+heure).slice(-2) + ":" +  ("0"+minute).slice(-2) );
                             }
                            else texte.text( "call seb" );
                          }
       this.update_matrice ( visuel );
       return(visuel);
     }

/***************************************************** New commentaire ********************************************************/
    Trame.new_comment = function ( visuel )
     { console.log ( "new comment " + visuel.forme + " " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var size, family, style, weight;
       if ( visuel.mode == "titre" )
        { size   = 32;
          family = "Sans";
          style  = "italic";
          weight = "bold";
        }
       else if ( visuel.mode =="soustitre" )
        { size   = 24;
          family = "Sans";
          style  = "italic";
          weight = "normal";
        }
       else
        { size   = 18;
          family = "Sans";
          style  = "italic";
          weight = "normal";
        }

       var texte = this.text ( visuel.libelle )
                       .font ( { family: family+ ",serif", size: size, style: style, weight: weight, anchor: "middle" } )
                       .fill(visuel.color).cx(0).cy(0);
       visuel.Set_state = function ( etat )
                           { visuel.mode = etat.mode;
                             texte.text ( etat.libelle ).fill(etat.color);
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                           }

       visuel.svggroupe.add ( texte );
       visuel.svggroupe.css("cursor", "default")
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return(visuel);
     }
/***************************************************** New button *************************************************************/
    Trame.new_button = function ( visuel )
     { console.log ( "new visuel " + visuel.forme + " " + visuel.tech_id + ":" + visuel.acronyme + " " +
                     visuel.posx + "x" + visuel.posy + " taille " + visuel.libelle.length );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var font_size = 18;
       var texte = this.text( visuel.libelle ).fill("white")
                       .font ( { family: "arial", size: font_size, anchor: "middle" } ).cx(0).cy(0);
       taille = visuel.libelle.length;
       var rectangle = Trame.rect ( visuel.libelle.length*font_size, 2*font_size ).cx(0).cy(0)
                            .attr("rx", 5).fill( visuel.color );

       visuel.svggroupe.add ( rectangle );

       visuel.Set_state = function ( etat )
                           { texte.text( etat.libelle );
                             rectangle.fill(etat.color);
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                             /*if (etat.disable==true) visuel.svggroupe.addClass("wtd-img-grayscale");
                                                else visuel.svggroupe.removeClass("wtd-img-grayscale");*/
                             visuel.mode    = etat.mode;
                             visuel.cligno  = etat.cligno;
                             visuel.color   = etat.color;
                             visuel.disable = etat.disable;
                           }

       visuel.svggroupe.add ( texte );
       visuel.svggroupe.addClass ( "wtd-darker-on-hover" ).css("cursor", "pointer");
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return(visuel);
     }

/***************************************************** New encadre ************************************************************/
    Trame.new_encadre = function ( visuel )
     { console.log ( "new encadre " + visuel.posx + " " + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);

       var dimensions = visuel.mode.split('x');
       console.log("Encadre : dimensions");
       console.debug(dimensions);
       if (!dimensions[0]) dimensions[0] = 1;
       if (!dimensions[1]) dimensions[1] = 1;

       var hauteur=96*parseInt(dimensions[0]);
       var largeur=96*parseInt(dimensions[1]);

       var titre = this.text ( visuel.libelle )
                   .font( { family: "Sans", size: 18, style: "italic", weight: "normal" } )
                   .cx(0).cy(-hauteur/2 - 15 ).fill( visuel.color ).stroke( { width: 0 } ).css("cursor", "default");
       visuel.svggroupe.add ( titre );

       var rect = Trame.rect( largeur, hauteur ).x(-largeur/2).y(-hauteur/2).attr("rx", 15)
                       .fill( "black" ).attr( "fill-opacity", 0.1 )
                       .stroke( { width: 4, color: visuel.color } );
       visuel.svggroupe.add ( rect );
       visuel.Set_state = function ( etat )
                           { rect.stroke( { color: etat.color } ); titre.fill ( etat.color );
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                           }
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return(visuel);
     }
    return(Trame);
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
