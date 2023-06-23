
 var Charts = new Array();
 var Token       = null;
 var TokenParsed = null;
 var Closing     = false;

 document.addEventListener('DOMContentLoaded', init, false);
 window.addEventListener("beforeunload", function () { Closing = true; } );
/**************************************************** Gère l'ID token *********************************************************/
 function init()
  { let keycloak = new Keycloak( { "realm": $IDP_REALM, "auth-server-url": $IDP_URL, "clientId": $IDP_CLIENT_ID,
                                   "ssl-required": "external", "public-client": true, "confidential-port": 0 } );

    keycloak.init( { onLoad: "login-required" } )
            .then((auth) =>
             { if (!auth) { console.log( "not authenticated" ); }
               else { console.log("Authenticated"); }
             })
            .catch((error) =>
             { console.log("Authenticated Failed");
               console.debug(error);
             });

    keycloak.onAuthSuccess  = function() { console.log('authenticated');
                                           TokenParsed = keycloak.tokenParsed;
                                           Token       = keycloak.token;
                                           console.debug (TokenParsed); console.debug (Token);
                                           Load_common();
                                         }
    keycloak.onAuthLogout   = function() { console.log('logout'); }
    keycloak.onAuthError    = function() { console.log('onAuthError'); }
    keycloak.onTokenExpired = function() { console.log('onTokenExpired'); }

//Token Refresh
    setInterval(  () =>
     { keycloak.updateToken(30)
       .then((refreshed) =>
        { if (refreshed) { console.log('Token refreshed' + refreshed);
                           TokenParsed = keycloak.tokenParsed;
                           Token       = keycloak.token;
                         }
          else
           { console.log ('Token not refreshed, valid for '
               + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
           }
        })
        .catch(() => { console.log('Failed to refresh token'); });
     }, 60000);
  }
/******************************************************************************************************************************/
 function Show_toast_ok ( message )
  { $('#idToastStatusOKLabel').text(" "+message); $('#idToastStatusOK').toast('show'); }
/******************************************************************************************************************************/
 function Show_toast_ko ( message )
  { $('#idToastStatusKOLabel').text(" "+message); $('#idToastStatusKO').toast('show'); }
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Send_to_API ( method, URL, parametre, fonction_ok, fonction_nok )
  { var xhr = new XMLHttpRequest;
    $(".ClassLoadingSpinner").show();
    if (method=="POST" || method=="PUT" || method=="DELETE")
     { ContentType = 'application/json';
       if (parametre === null) parametre = new Object();
     }
    else if (method=="POSTFILE") { ContentType = 'application/octet-stream'; method = "POST"; }
    else ContentType = null;

    if ( method == "GET" && parametre !== null )
     { xhr.open(method, $ABLS_API+URL+"?"+parametre, true); }
    else xhr.open(method, $ABLS_API+URL, true);

    if (ContentType != null) { xhr.setRequestHeader('Content-type', ContentType ); }
    xhr.timeout = 60000; // durée en millisecondes
    xhr.setRequestHeader("X-ABLS-DOMAIN", localStorage.getItem("domain_uuid") );
    xhr.setRequestHeader("Authorization", "Bearer " + Token );

    xhr.onreadystatechange = function()
     { if ( xhr.readyState != 4 ) return;
       $(".ClassLoadingSpinner").hide();

       try { var Response = JSON.parse(xhr.responseText); }
       catch (error) { Response=undefined; }

       if (xhr.status == 200)
        { if (fonction_ok != null) fonction_ok(Response); }        /* Si function exist, on l'appelle, sinon on fait un toast */
       else { if (Response) Show_toast_ko( "Une erreur est survenue: " + Response.api_error );
                       else if (fonction_nok == null) Show_toast_ko( "Une erreur "+ xhr.status + " est survenue: " + xhr.statusText );
              if (fonction_nok != null) fonction_nok(xhr);
            }
     }
    xhr.ontimeout = function() { console.log("XHR timeout for "+URL); }
    xhr.send( JSON.stringify(parametre) );
  }
/************************************ Controle de saisie avant envoi **********************************************************/
 function isNum ( id )
  { FormatTag = RegExp(/^[0-9-]+$/);
    input = $('#'+id);
    return ( FormatTag.test(input.val()) )
  }
/********************************************* Gestion des popovers ***********************************************************/
 function Popover_hide ( element )
  { element.popover('dispose');
  }
 function Popover_show ( element, titre, content, place )
  { Popover_hide ( element );
    element.popover({ container: 'body', title: titre, content: content});
    element.popover('show');
  }
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Load_common ()
  { console.log("debut load_common");

    Send_to_API ( "GET", "/user/profil", null, function( Response )
     { console.debug(Response);
       if (Response.default_domain_uuid == null)
        { localStorage.clear(); }
       else
        { localStorage.setItem("domain_uuid", Response.default_domain_uuid );/* Positionne les parametres domain par défaut */
          localStorage.setItem("domain_name", Response.default_domain_name );
          localStorage.setItem("access_level", parseInt(Response.access_level) );
          $("#idNavDomainName").text( localStorage.getItem("domain_name") );
          if (Response.domain_notification.length) $("#idDomainNotification").text( htmlEncode(Response.domain_notification) ).show();
                                              else $("#idDomainNotification").hide();
        }

       if (Response.default_domain_uuid == null && window.location.pathname !== "/domains") { Redirect("/domains"); return; }

       if (typeof Load_page === 'function') Load_page();
     }, function () { Show_toast_ko ("Unable to request profil."); } );


         if (TokenParsed.name !== null )               $("#idUsername").text(TokenParsed.name);
    else if (TokenParsed.preferred_username !== null ) $("#idUsername").text(TokenParsed.preferred_username);
    else if (TokenParsed.given_name !== null )         $("#idUsername").text(TokenParsed.given_name);
    else if (TokenParsed.email !== null )              $("#idUsername").text(TokenParsed.email);
    else $("#idUsername").text("Unknown");

    $("body").hide().removeClass("d-none").fadeIn();
  }
/********************************************* Chargement du synoptique 1 au démarrage ****************************************/
 function Logout ()
  { Redirect ( $IDP_URL+"/realms/"+$IDP_REALM+"/protocol/openid-connect/logout" ); }
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Show_Error ( message )
  { if (message == "Not Connected") { Logout(); }
    else
     { $('#idModalDetail').html( message );
       $('#idModalError').modal("show");
     }
  }
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Show_Info ( message )
  { $('#idModalInfoDetail').html( htmlEncode(message) );
    $('#idModalInfo').modal("show");
  }
/********************************************* Redirige la page ***************************************************************/
 function Redirect ( url )
  { $('body').fadeOut("normal", function () { window.location.replace(url); } );
  }
/********************************************* Barre de boutons ***************************************************************/
 function Bouton_actions_start ( )
  { return("<div class='btn-group btn-block' role='group' aria-label='ButtonGroup'>"); }

 function Bouton_actions_add ( color, tooltip, clic_func, key, icone, texte )
  { if (clic_func !== null)
     { result = "<button class='btn btn-"+color+" btn-sm' "+
                "data-toggle='tooltip' title='"+htmlEncode(tooltip)+"' "+
                "onclick="+clic_func+"('"+key+"')>"+
                (icone!==null ? "<i class='fas fa-"+icone+"'></i> " : "") +
                (texte!==null ? htmlEncode(texte) : "") +
                "</button>";
     }
    else
     { result = "<button class='btn btn-"+color+" btn-sm' disabled "+
                "data-toggle='tooltip' title='"+htmlEncode(tooltip)+"'> "+
                (icone!==null ? "<i class='fas fa-"+icone+"'></i> " : "") +
                (texte!==null ? htmlEncode(texte) : "") +
                "</button>";
     }
    return(result);
  }
 function Bouton_actions_end ( )
  { return ("</div>"); }

/********************************************** Bouton unitaire ***************************************************************/
 function Bouton ( color, tooltip, clic_func, key, texte )
  { if (clic_func !== null)
     { result = "<button "+
                "class='btn btn-"+color+" btn-block btn-sm' "+
                "data-toggle='tooltip' title='"+htmlEncode(tooltip)+"' "+
                "onclick="+clic_func+"('"+key+"')>"+
                "<span id='idButtonSpinner_"+clic_func+"_"+key+"' class='spinner-border spinner-border-sm' style='display:none' "+
                "role='status' aria-hidden='true'></span> "+
                htmlEncode(texte)+
                "</button>";
     }
   else
    { result =  "<button "+
                "class='btn btn-"+color+" btn-block btn-sm' "+
                "data-toggle='tooltip' title='"+htmlEncode(tooltip)+"' "+
                "disabled>"+htmlEncode(texte)+
                "</button>";
    }
   return( result );
  }

 function Lien ( target, tooltip, texte )
  { return( "<a href='"+target+"' data-toggle='tooltip' title='"+htmlEncode(tooltip)+"'>"+texte+"</a>" );
  }

 function Badge ( color, tooltip, texte )
  { return("<span "+
           "class='badge badge-"+color+"' "+
           "data-toggle='tooltip' title='"+htmlEncode(tooltip)+"'>"+htmlEncode(texte)+
           "</span>" );
  }

/*****************************************Peuple un selecten fonction d'un retour API *****************************************/
 function Select_from_api ( id, url, json_request, array_out, array_item, to_string, selected )
  { $('#'+id).empty();
    Send_to_API ( "GET", url, json_request, function(Response)
     { $.each ( Response[array_out], function ( i, item )
        { $('#'+id).append("<option value='"+item[array_item]+"'>"+to_string(item)+"</option>"); } );
       if (selected!=null) $('#'+id).val(selected);
     }, null );
  }

/********************************************* Renvoi un Badge d'access Level *************************************************/
 var Access_level_description = [ { name: "Accès de niveau 0",                 color: "success" },
                                  { name: "Accès de niveau 1",                 color: "info" },
                                  { name: "Accès de niveau 2",                 color: "info" },
                                  { name: "Accès de niveau 3",                 color: "info" },
                                  { name: "Accès de niveau 4",                 color: "secondary" },
                                  { name: "Accès de niveau 5",                 color: "primary" },
                                  { name: "Technicien délégué du domaine",     color: "warning" },
                                  { name: "Technicien du domaine",             color: "warning" },
                                  { name: "Administrateur délégué du domaine", color: "warning" },
                                  { name: "Administrateur du domaine",         color: "danger" }
                                ];
 function Badge_Access_level ( level )
  { return( Badge ( Access_level_description[level].color, Access_level_description[level].name, level.toString() ) ); }
/********************************************* Renvoi un Select d'access Level ************************************************/
 function Select ( id, fonction, array, selected )
  { retour = "<select id='"+id+"' class='custom-select border border-info' ";
    if (fonction) retour += "onchange="+fonction;
    retour+= ">";
    valeur = array.map ( function(item) { return(item.valeur); } );
    texte  = array.map ( function(item) { return(item.texte); } );
    for ( i=0; i<array.length; i++ )
     { retour += "<option value='"+valeur[i]+"' "+(selected==valeur[i] ? "selected" : "")+">"+texte[i]+"</option>"; }
    retour +="</select>";
    return(retour);
  }
/********************************************* Renvoi un Select d'access Level ************************************************/
 function Select_Access_level ( id, fonction, selected )
  { retour = "<select id='"+id+"' class='custom-select'"+"onchange="+fonction+">";
    for ( i=localStorage.getItem("access_level")-1; i>=0; i-- )
     { retour += "<option value='"+i+"' "+(selected==i ? "selected" : "")+">"+i+" - "+Access_level_description[i].name+"</option>"; }
    retour +="</select>";
    return(retour);
  }
/********************************************* Affichage des vignettes ********************************************************/
 function Changer_img_src ( id, target, cligno )
  { var image = $('#'+id);

    if (cligno==false) { image.removeClass("wtd-cligno"); }
    if (image.attr('src') == target) { console.log("Changer_img_src "+id+" already in '" + target ); return; }
    console.log("Changer_img_src "+id+" from '" + image.attr('src') + "' to "+ target );

    if (image.attr('src') == "")
     { console.log("Changer_img_src "+id+" 1");
       image.slideUp("fast", function()
        { image.off("load").on("load", function() { image.slideDown("normal", function ()
                                         { if (cligno==true) { image.addClass("wtd-cligno"); } } ); } );
          image.attr("src", target);
          console.log("Changer_img_src "+id+" 1 fin:" + image.attr("src") );
        });
     }
    else
     { console.log("Changer_img_src "+id+" 2");
       image.fadeTo("fast", 0, function()
        { image.off("load").on("load", function() { image.fadeTo("normal", 1, function ()
                                         { if (cligno==true) { image.addClass("wtd-cligno"); } } ); } );
          image.attr("src", target);
          console.log("Changer_img_src "+id+" 2 fin:" + image.attr("src") );
        });
     }
  }
/********************************************* Remonte la page au top *********************************************************/
 function Scroll_to_top ()
  { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }
/********************************************* Affichage des vignettes ********************************************************/
 function Slide_down_when_loaded ( id )
  { var images = $('#'+id+' img[src]');
    var loaded_images_count = 0;
    if (images.length==0) { $('#'+id).slideDown("slow"); return; }
    images.on("load", function()
     { loaded_images_count++;
       if (loaded_images_count == images.length) { $('#'+id).slideDown("slow"); }
     });
  }
/****************************************** Escape les " et ' *****************************************************************/
 function htmlEncode ( string )
  { if (string===undefined) return("null");
    if (string===null) return("null");
    return ( string.replace(/'/g,'&apos;').replace(/"/g,'&quote;') ).replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
/****************************************** Are you sure **********************************************************************/
 function Show_modal_del ( titre, message, details, fonction )
  { $('#idModalDelTitre').html ( htmlEncode(titre) );
    $('#idModalDelMessage').html( htmlEncode(message) );
    $('#idModalDelDetails').html( htmlEncode(details) );
    $('#idModalDelValider').off("click").on( "click", fonction );
    $('#idModalDel').modal("show");
  }
/********************************************* Renvoi un input ****************************************************************/
 function Input ( type, id, change_fonction, place_holder, value, controle_function )
  { retour = "<input id='"+id+"' class='form-control' type='"+type+"' "+
             "placeholder='"+htmlEncode(place_holder)+"' "+
             "onchange="+change_fonction+" ";
    if (controle_function !== undefined)
     { retour = retour + "oninput="+controle_function+" "; }
    retour = retour + "value='"+htmlEncode(value)+"'/>";
    return(retour);
  }
/********************************* Chargement d'une courbe dans u synoptique 1 au démrrage ************************************/
 function Charger_une_courbe ( idChart, tech_id, acronyme, period )
  { var chartElement = document.getElementById(idChart);
    if (!chartElement) { console.log("Charger_une_courbe: Erreur chargement chartElement " + json_request ); return; }

    if (period===undefined) period="HOUR";
    var json_request =
     { courbes: [ { tech_id : tech_id, acronyme : acronyme, } ],
       period   : period
     };

    Send_to_API ( "POST", "/archive/get", json_request, function(json)
     { var dates;
       if (period=="HOUR") dates = json.valeurs.map( function(item) { return item.date.split(' ')[1]; } );
                      else dates = json.valeurs.map( function(item) { return item.date; } );
       var valeurs = json.valeurs.map( function(item) { return item.moyenne1; } );
       var data = { labels: dates,
                    datasets: [ { label: json.courbe1.libelle,
                                  borderColor: "rgba(0, 100, 255, 1.0)",
                                  backgroundColor: "rgba(0, 100, 100, 0.1)",
                                  borderWidth: "1",
                                  tension: "0.1",
                                  radius: "1",
                                  data: valeurs,
                                  yAxisID: "B",
                                },
                              ],
                  }
       var options = { maintainAspectRatio: false,
                       scales: { yAxes: [ { id: "B", type: "linear", position: "left",
                                            scaleLabel: { display: true, labelString: json.courbe1.unite }
                                          }
                                        ]
                               }
                     };
       var ctx = chartElement.getContext('2d');
       if (!ctx) { console.log("Charger_une_courbe: Erreur chargement context " + json_request ); return; }

       if (Charts != null && Charts[idChart] != null) Charts[idChart].destroy();
       Charts[idChart] = new Chart(ctx, { type: 'line', data: data, options: options } );
     });

    /* if (period=="HOUR") setInterval( function() { window.location.reload(); }, 60000);
    else if (period=="DAY")  setInterval( function() { window.location.reload(); }, 300000);
    else setInterval( function() { window.location.reload(); }, 600000);*/
  }

/********************************* Chargement d'une courbe dans u synoptique 1 au démrrage ************************************/
 function Charger_plusieurs_courbes ( idChart, tableau_map, period )
  { var chartElement = document.getElementById(idChart);
    if (!chartElement) { console.log("Charger_plusieurs_courbes: Erreur chargement chartElement " + idChart ); return; }

    if (period===undefined) period="HOUR";
    var json_request =
     { courbes: tableau_map.map( function (item)
                                  { return( { tech_id: item.tech_id, acronyme: item.acronyme } ) } ),
       period : period
     };

    Send_to_API ( "POST", "/archive/get", json_request, function(Response)
     { var dates;
       var ctx = chartElement.getContext('2d');
       if (!ctx) { console.log("Charger_plusieurs_courbes: Erreur chargement context " + json_request ); return; }

       if (period=="HOUR") dates = Response.valeurs.map( function(item) { return item.date.split(' ')[1]; } );
                      else dates = Response.valeurs.map( function(item) { return item.date; } );
       var data = { labels: dates,
                    datasets: [],
                  }
       for (i=0; i<tableau_map.length; i++)
        { data.datasets.push ( { label: Response["courbe"+(i+1)].libelle+ " ("+Response["courbe"+(i+1)].unite+")",
                                 borderColor: tableau_map[i].color,
                                 backgroundColor: "rgba(100, 100, 100, 0.0)",
                                 /*backgroundColor: "rgba(100, 100, 100, 0.1)",*/
                                 borderWidth: "1",
                                 tension: "0.1",
                                 radius: "1",
                                 data: Response.valeurs.map( function(item) { return(item["moyenne"+(i+1)]); } ),
                                 yAxisID: "B",
                               });
        }
console.debug(data);
       var options = { maintainAspectRatio: false,
                       scales: { yAxes: [ { id: "B", type: "linear", position: "right",
                                            scaleLabel: { display: false, labelString: tableau_map[0].unite }
                                          },
                                        ]
                               }
                     };
       if (Charts != null && Charts[idChart] != null)
        { Charts[idChart].ctx.destroy();
          if (Charts[idChart].timeout != null) clearTimeout ( Charts[idChart].timeout );
        } else Charts[idChart] = new Object ();

       Charts[idChart].ctx = new Chart(ctx, { type: 'line', data: data, options: options } );
       if (period == "HOUR")
        { Charts[idChart].timeout = setTimeout ( function()                                                  /* Update graphe */
           { Charger_plusieurs_courbes ( idChart, tableau_map, period ); }, 60000 );
        }
     });
  }
/******************************************************************************************************************************/
/* Get_url_parameter : Recupere un parametre de recherche dans l'URL                                                          */
/******************************************************************************************************************************/
 function Get_url_parameter ( name )
  { const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return (urlParams.get(name));
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
