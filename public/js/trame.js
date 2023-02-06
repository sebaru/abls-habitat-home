
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Trame_new ( idcontainer )
  {
    $("#"+idcontainer).empty().css("position","relative");
    var Trame = SVG().addTo("#"+idcontainer).attr("id", "idTrame")
                     .attr("viewBox", "0 0 1920 1080")
                     .attr("preserveAspectRatio", "xMidYMid meet")
                     .addClass("border border-success")
                     .css("background-color", "darkgray");

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
                                   } );
       visuel.svggroupe.add ( svgimage );
       this.update_matrice ( visuel );
       return( visuel );
     }
/***************************************************** New cadran *************************************************************/
    Trame.new_visuel = function ( visuel )
     { console.log ( "new cadran " + visuel.forme + " " + visuel.tech_id + ":" + visuel.acronyme + " " + visuel.posx + "x" + visuel.posy );
       visuel.svggroupe = this.group().attr("id", "wtd-visu-"+visuel.tech_id+"-"+visuel.acronyme);
       this.add(visuel.svggroupe);
       var rectangle = Trame.rect ( 110, 30 ).cx(0).cy(0).attr("rx", 10).fill("gray" ).stroke({ width:1, color:"lightgreen" });
       visuel.svggroupe.add ( rectangle );

       var texte = this.text( "- visuel -" ).cx(0).cy(0).font ( { family: "arial", size:14, anchor: "middle", variant:"italic" } );
       visuel.svggroupe.add ( texte );
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
       visuel.svggroupe.add ( texte );
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
                       .attr("rx", 5).fill("blue" );

       visuel.svggroupe.add ( rectangle );
       visuel.svggroupe.add ( texte );
       visuel.svggroupe.addClass ( "wtd-darker-on-hover" ).css("cursor", "pointer");
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

       var titre = this.text ( visuel.libelle ).cx(0).cy(-hauteur/2 - 15 )
                   .font( { family: "Sans", size: 18, style: "italic", weight: "normal" } )
                   .fill( visuel.color )
                   .stroke( { width: 0 } );
       visuel.svggroupe.add ( titre );

       var rect = Trame.rect( largeur, hauteur ).x(-largeur/2).y(-hauteur/2).attr("rx", 15)
                       .fill( "none" )
                       .stroke( { width: 4, color: visuel.color } );
       visuel.svggroupe.add ( rect );
       this.update_matrice ( visuel );
       return(visuel);
     }
    return(Trame);
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
