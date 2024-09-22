
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
           { if ( x%100==0 && y%100==0 )
              { var croix1 = this.line(x, y-6, x, y+6).stroke({ color: 'blue', width: 1 });
                var croix2 = this.line(x-6, y, x+6, y).stroke({ color: 'blue', width: 1 });
                this.grille.add(croix1);
                this.grille.add(croix2);
              }
             else
              { var point = this.circle(2).fill("black").cx(x).cy(y);
                this.grille.add(point);
              }
           }
        }
     }
/*************************************** Met à jour la matrice de transformation **********************************************/
    Trame.update_matrice = function ( visuel )
     { var translate_x = visuel.posx;
       var translate_y = visuel.posy;
       if (visuel.controle == "by_js")
        { translate_x = translate_x - visuel.svggroupe.width()/2;
          translate_y = translate_y - visuel.svggroupe.height()/2;
        }
       visuel.svggroupe.transform ( { scale: visuel.scale, translate: [translate_x, translate_y],
                                      rotate: visuel.angle, origin: 'center center' } );
     }

/***************************************************** New image **************************************************************/
    Trame.new_from_image = function ( visuel, image_filename )
     { console.log ( "new image " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var svgimage = this.image( localStorage.getItem("static_data_url")+"/img/"+image_filename)
                          .attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
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
       var svgimage = this.image( localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"."+visuel.extension,
                                  function(event) { this.center(0,0); })
                          .attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { visuel.mode = etat.mode;
                             if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                         else visuel.svggroupe.removeClass("wtd-cligno");
                           }
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       visuel.svggroupe.css("cursor", "pointer");
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_by_mode = function ( visuel )
     { console.log ( "new by_mode " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       var svgimage = this.image( localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+visuel.mode+"."+visuel.extension,
                                  function(event) { this.center(0,0); })
                          .attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { if (visuel.mode != etat.mode)
                              { groupe.fadeOut("fast", function ()
                                 { svgimage.load(localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+visuel.mode+"."+visuel.extension );
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
       visuel.svggroupe.css("cursor", "pointer");
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_by_mode_color = function ( visuel )
     { console.log ( "new by_mode_color " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       var svgimage = this.image( localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+visuel.mode+"_"+visuel.color+"."+visuel.extension,
                                  function(event) { this.center(0,0); })
                          .attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img")
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { if (visuel.mode != etat.mode || visuel.color != etat.color)
                              { groupe.fadeOut("fast", function ()
                                 { svgimage.load(localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+visuel.mode+"_"+visuel.color+"."+visuel.extension );
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
       visuel.svggroupe.css("cursor", "pointer");
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_by_color = function ( visuel )
     { console.log ( "new by_color " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       var svgimage = this.image( localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+visuel.color+"."+visuel.extension,
                                  function(event) { this.center(0,0); })
                          .attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme + "-img");
       visuel.svggroupe.add ( svgimage );
       visuel.Set_state = function ( etat )
                           { if (visuel.color != etat.color)
                              { groupe.fadeOut("fast", function ()
                                 { svgimage.load(localStorage.getItem("static_data_url")+"/img/"+visuel.forme+"_"+visuel.color+"."+visuel.extension );
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
       visuel.svggroupe.css("cursor", "pointer");
       return( visuel );
     }
/***************************************************** New image **************************************************************/
    Trame.new_by_js = function ( visuel )
     { console.log ( "new by_js " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var groupe = $("#wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       fetch ( localStorage.getItem("static_data_url")+"/img/"+visuel.forme+".svg" )
       .then ( Response => Response.text() )
       .then ( svg_text =>
                { visuel.Set_state = function ( etat )
                   { if (this.InsideSVG_Set_state !== undefined) this.InsideSVG_Set_state(etat);
                     if (etat.cligno) visuel.svggroupe.addClass("wtd-cligno");
                                 else visuel.svggroupe.removeClass("wtd-cligno");
                     if (etat.disable==true) visuel.svggroupe.addClass("wtd-img-grayscale");
                                        else visuel.svggroupe.removeClass("wtd-img-grayscale");
                     visuel.mode    = etat.mode;
                     visuel.cligno  = etat.cligno;
                     visuel.color   = etat.color;
                     visuel.disable = etat.disable;
                   }

                  fetch ( localStorage.getItem("static_data_url")+"/img/"+visuel.forme+".js" )
                  .then ( Response => Response.text() )
                  .then ( js_text => { visuel.InsideSVG_Set_state = new Function ( "state", js_text );
                                       visuel.svggroupe.svg( svg_text );/* Convertir le texte en SVG pour utiliser la librairie SVG.js */
                                       visuel.Set_state ( visuel );
                                       this.update_matrice ( visuel );
                                     } );
                }
             );
       visuel.svggroupe.css("cursor", "pointer");
       return( visuel );
     }
/***************************************************** New cadran *************************************************************/
    Trame.new_cadran_texte = function ( visuel )
     { console.log ( "new cadran texte " + visuel.forme + " " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy+
                     " decimal = " + visuel.decimal );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var rectangle = Trame.rect ( 120, 40 ).attr("rx", 10).fill("gray" ).stroke({ width:2, color:"lightgreen" }).cx(0).cy(0);
       visuel.svggroupe.add ( rectangle );

       var texte = this.text( "- cadran -" ).font ( { family: "arial", size:16, anchor: "middle", variant:"italic" } )
                       .cx(0).cy(0).css("cursor", "default");
       visuel.svggroupe.add ( texte );

       visuel.Set_state = function ( etat )
        { if (etat.valeur === undefined) texte.text("Unknown");
          else texte.text ( etat.valeur.toFixed(etat.decimal).toString() + " " + etat.unite );
        };
       visuel.Set_state ( visuel );
       this.update_matrice ( visuel );
       return(visuel);
     }

/***************************************************** New cadran *************************************************************/
    Trame.new_cadran_horaire = function ( visuel )
     { console.log ( "new cadran horaire " + visuel.forme + " " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy+
                     " decimal = " + visuel.nb_decimal );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var rectangle = Trame.rect ( 120, 40 ).attr("rx", 10).fill("gray" ).stroke({ width:2, color:"lightgreen" }).cx(0).cy(0);
       visuel.svggroupe.add ( rectangle );

       var texte = this.text( "- cadran -" ).font ( { family: "arial", size:16, anchor: "middle", variant:"italic" } )
                       .cx(0).cy(0).css("cursor", "default");
       visuel.svggroupe.add ( texte );
       visuel.Set_state = function ( etat )
                           { var temps     = etat.valeur; /* Valeur est en seconde */
                             var heures    = Math.floor(temps / 3600);
                             temps %= 3600;
                             var minutes   = Math.floor(temps / 60);
                             var secondes  = temps % 60;
                             var result    = (heures<10 ? "0" : "") + heures + ":" +  ("0"+minutes).slice(-2) + ":" +  ("0"+secondes).slice(-2)
                             texte.text ( result );
                           }
       visuel.Set_state ( visuel );
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
                       .fill( "black" ).attr( "fill-opacity", 0.2 )
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
