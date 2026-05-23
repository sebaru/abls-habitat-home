
 var Charts         = new Array();
 var Token           = null;
 var RefreshToken    = null;
 var TokenParsed     = null;
 var Closing         = false;
 var Keycloak_client = null;

 document.addEventListener('DOMContentLoaded', init, false);
 window.addEventListener("beforeunload", function () { Closing = true; } );

 var PeriodeTableau = [ { valeur : "BY_MINUTE_ON_2_HOURS",   texte : "Sur 2 heures" },
                        { valeur : "BY_10_MINUTE_ON_1_DAY",  texte : "Sur 1 jour" },
                        { valeur : "BY_HOUR_ON_2_DAYS",      texte : "Sur 2 jours" },
                        { valeur : "BY_10_MINUTE_ON_3_DAYS", texte : "Sur 3 jours" },
                        { valeur : "BY_30_MINUTE_ON_1_WEEK", texte : "Sur 1 semaine" },
                        { valeur : "BY_HOUR_ON_2_WEEKS",     texte : "Sur 2 semaines" },
                        { valeur : "BY_DAY_ON_2_MONTHS",     texte : "Sur 2 mois" },
                        { valeur : "BY_WEEK_ON_4_MONTHS",    texte : "Sur 4 mois" },
                        { valeur : "BY_MONTH_ON_12_MONTHS",  texte : "Sur 1 an" },
                        { valeur : "BY_YEAR_ON_2_YEARS" ,    texte : "Sur 2 ans" },
                      ];
/**************************************************** Gère l'ID token **********************************************************/
 function init()
  { if ( typeof $IDP_URL === 'undefined' || $IDP_URL.includes('exemple.com') )
     { window.location.replace('/config.html');
       return;
     }

    Keycloak_client = new Keycloak( { "realm": $IDP_REALM, "url": $IDP_URL, "clientId": $IDP_CLIENT_ID } );

    Keycloak_client.init( { onLoad: "login-required" } )
            .then((auth) =>
             { if (!auth) { console.log( "not authenticated" ); }
               else { console.log("Authenticated"); }
             })
            .catch((error) =>
             { console.log("Authenticated Failed");
               console.debug(error);
             });

    Keycloak_client.onAuthSuccess  = function() { console.log('authenticated');
                                           TokenParsed  = Keycloak_client.tokenParsed;
                                           Token        = Keycloak_client.token;
                                           RefreshToken = Keycloak_client.refreshToken;
                                           console.debug (TokenParsed); console.debug (Token); console.debug (RefreshToken);
                                           Load_common();
                                         }
    Keycloak_client.onAuthLogout   = function() { console.log('logout'); }
    Keycloak_client.onAuthError    = function() { console.log('onAuthError'); }
    Keycloak_client.onTokenExpired = function() { console.log('onTokenExpired'); }

//Token Refresh
    setInterval(  () =>
     { Keycloak_client.updateToken(30)
       .then((refreshed) =>
        { if (refreshed) { console.log('Token refreshed' + refreshed);
                           TokenParsed  = Keycloak_client.tokenParsed;
                           Token        = Keycloak_client.token;
                           RefreshToken = Keycloak_client.refreshToken;
                         }
          else
           { console.log ('Token not refreshed, valid for '
               + Math.round(Keycloak_client.tokenParsed.exp + Keycloak_client.timeSkew - new Date().getTime() / 1000) + ' seconds');
           }
        })
        .catch(() => { console.log('Failed to refresh token'); });
     }, 60000);
  }
/******************************************************************************************************************************/
 function Set_page_context ( context )
  { if (typeof Router !== 'undefined' && Router.setPageContext)
     { Router.setPageContext(context); }
  }
/******************************************************************************************************************************/
 var ShellErrorTimer = null;
/******************************************************************************************************************************/
 function Hide_shell_error ()
  { if (ShellErrorTimer) { clearTimeout(ShellErrorTimer); ShellErrorTimer = null; }
    $('#idShellError').hide().addClass('d-none');
  }
/******************************************************************************************************************************/
 function Show_shell_error ( message )
  { if (ShellErrorTimer) { clearTimeout(ShellErrorTimer); ShellErrorTimer = null; }
    $('#idShellErrorText').text(message);
    var bar = document.getElementById('idShellErrorProgress');
    if (bar) { bar.style.transition = 'none'; bar.style.width = '100%';
               bar.offsetWidth; /* force reflow avant animation */
               bar.style.transition = 'width 5s linear'; bar.style.width = '0%'; }
    $('#idShellError').removeClass('d-none').show();
    ShellErrorTimer = setTimeout(Hide_shell_error, 5000);
  }
/******************************************************************************************************************************/
 function Show_toast_ok ( message )
  { $('#idToastStatusOKLabel').text(" "+message); $('#idToastStatusOK').toast('show'); }
/********************************************* Chargement du synoptique 1 au démarrage ****************************************/
 function Logout ()
  { Redirect ( $IDP_URL+"/realms/"+$IDP_REALM+"/protocol/openid-connect/logout" ); }
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Send_to_API ( method, URL, parametre, fonction_ok, fonction_nok )
  { $(".ClassLoadingSpinner").show();

     var xhr = new XMLHttpRequest;

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
     xhr.timeout = 300000; // durée en millisecondes
     xhr.setRequestHeader("X-ABLS-DOMAIN", localStorage.getItem("domain_uuid") );
     xhr.setRequestHeader("Authorization", "Bearer " + Token );

     xhr.onreadystatechange = function()
      { if ( xhr.readyState != 4 ) return;
        $(".ClassLoadingSpinner").hide();

        try { var Response = JSON.parse(xhr.responseText); }
        catch (error) { Response=undefined; }

        if (xhr.status == 200)
         { if (fonction_ok != null) fonction_ok(Response); }
        else { if (Response) Show_shell_error( "Une erreur est survenue: " + Response.api_error );
               else Show_shell_error( "Une erreur "+ xhr.status + " est survenue: " + xhr.statusText );
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
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Load_common ()
  { console.log("debut load_common");

    $.ajaxSetup(
     { beforeSend: function (request)
        { request.setRequestHeader("Authorization", "Bearer " + Token );
          request.setRequestHeader("X-ABLS-DOMAIN", localStorage.getItem("domain_uuid") );
        }
     });

    Send_to_API ( "GET", "/user/profil", null, function( Response )
     { console.debug(Response);
       if (Response.default_domain_uuid == null)
        { localStorage.clear(); }
       else
        { localStorage.setItem("domain_name",        Response.default_domain_name );
          localStorage.setItem("domain_uuid",        Response.default_domain_uuid );/* Positionne les parametres domain par défaut */
          localStorage.setItem("static_data_url",    Response.static_data_url );
          localStorage.setItem("access_level",       parseInt(Response.access_level) );
          localStorage.setItem("mqtt_hostname",      Response.mqtt_hostname );
          localStorage.setItem("mqtt_port",          parseInt(Response.mqtt_port) );
          localStorage.setItem("mqtt_over_ssl",      Response.mqtt_over_ssl );
          sessionStorage.setItem("browser_password", Response.browser_password );
          $("#idNavDomainName").text( localStorage.getItem("domain_name") );
          if (Response.domain_notification.length) $("#idDomainNotification").text( Response.domain_notification ).show();
                                              else $("#idDomainNotification").hide();
          if (Response.domain_notification_warning.length) $("#idDomainNotificationWarning").text( Response.domain_notification_warning ).show();
                                                      else $("#idDomainNotificationWarning").hide();
          Send_to_API ( 'GET', "/domain/image", null, function (Response)
               { if (Response.image == null) Response.image = "https://static.abls-habitat.fr/img/syn_maison.png";
                 Changer_img_src ( "idNavImgTopSyn", Response.image, false );
                 $("#idNavImgTopSyn").off("click").on("click", Navbar_retour_accueil);
                 $("#idNavImgTopSyn").closest("a").off("click").on("click", Navbar_retour_accueil);
               }, null);

          if (Response.access_level>=6) $("#idHrefConsole").removeClass("d-none").attr("href", Response.console_url );
          $("#idHrefHome").attr("href", Response.home_url );
          $("#idHrefProfil").attr("href", Response.console_url+"/user/me" );
          $("#idHrefVueCliente").attr("href", Response.home_url );
          $("#idHrefAccount").attr("href", TokenParsed.iss+"/account/" );
        }

       if (Response.default_domain_uuid == null && window.location.pathname !== "/domains") { Redirect("/domains"); return; }

       $('#idAblsApiFooter').text(Response.abls_api_version);
            if (TokenParsed.name !== null )               $("#idUsername").text(TokenParsed.name);
       else if (TokenParsed.preferred_username !== null ) $("#idUsername").text(TokenParsed.preferred_username);
       else if (TokenParsed.given_name !== null )         $("#idUsername").text(TokenParsed.given_name);
       else if (TokenParsed.email !== null )              $("#idUsername").text(TokenParsed.email);
       else $("#idUsername").text("Unknown");
       $("body").hide().removeClass("d-none").fadeIn();
       window.dispatchEvent(new Event('keycloak-ready'));
     }, function () { Show_shell_error ("Unable to request profil."); } );
  }
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Show_Error ( message )
  { if (message == "Not Connected") { Logout(); }
    else { Show_shell_error(message); }
  }
/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Show_Info ( message )
  { $('#idModalInfoDetail').html( htmlEncode(message) );
    $('#idModalInfo').modal("show");
  }
/********************************************* Redirige la page ***************************************************************/
 function Redirect ( url )
  { if (url && url.charAt(0) === '/' && url.charAt(1) !== '/')
     { if (typeof Router !== 'undefined') { Router.push(url); }
       else { window.location.replace(url); }
     }
    else { $('body').fadeOut("fast", function () { window.location.replace(url); } ); }
  }
/********************************************* Retour à l'accueil principal **************************************************/
 function Navbar_retour_accueil ( event )
  { if (event)
     { event.preventDefault();
       event.stopPropagation();
     }
    Redirect("/");
    return(false);
  }
/********************************************* Barre de boutons ***************************************************************/
 function Bouton_actions_start ( )
  { return("<div class='btn-group w-100' role='group' aria-label='ButtonGroup'>"); }

 function Bouton_actions_add ( color, tooltip, clic_func, key, icone, texte, extra_args )
  { if (clic_func !== null)
     { result = "<button class='btn btn-"+color+" btn-sm' "+
                "data-bs-toggle='tooltip' title='"+htmlEncode(tooltip)+"' "+
                "onclick="+clic_func+"('"+key+"'"+(extra_args ? ","+extra_args : "")+")>"+
                (icone!==null ? "<i class='fas fa-"+icone+"'></i> " : "") +
                (texte!==null ? htmlEncode(texte) : "") +
                "</button>";
     }
    else
     { result = "<button class='btn btn-"+color+" btn-sm' disabled "+
                "data-bs-toggle='tooltip' title='"+htmlEncode(tooltip)+"'> "+
                (icone!==null ? "<i class='fas fa-"+icone+"'></i> " : "") +
                (texte!==null ? htmlEncode(texte) : "") +
                "</button>";
     }
    return(result);
  }
 function Bouton_actions_end ( )
  { return ("</div>"); }

/********************************************* Barre de boutons déroulant *****************************************************/
    function Bouton_deroulant_start ()
     { return("<div class='dropdown'>"+
        "<button type='button' class='btn btn-primary btn-sm dropdown-toggle' "+
        "        data-bs-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"+
        "<i class='fas fa-ellipsis-v'></i> "+
        "</button>"+
        "<div class='dropdown-menu'> "
       );
     }

 function Bouton_deroulant_add ( color, texte, clic_func, key, icone, extra_args )
  { result = "<a class='dropdown-item text-"+(color === "danger" ? "danger" : "white")+(clic_func===null ? " disabled" : "")+"' href='#' "+
             (clic_func !== null ? "onclick="+clic_func+"('"+key+"'"+(extra_args ? ","+extra_args : "")+"); return(false); "
                                 : "tabindex='-1' aria-disabled='true' ")+
             ">"+
             (icone!==null ? "<i class='fas fa-"+icone+" text-"+color+"'></i> " : "") +
             htmlEncode(texte) +
             "</a>";
    return(result);
  }

 function Bouton_deroulant_add_spacer ( )
  { return ( "<div class='dropdown-divider'></div>" ); }

 function Bouton_deroulant_end ( )
  { return ("</div></div>"); }

/********************************************** Bouton unitaire ***************************************************************/
 function Bouton ( color, tooltip, clic_func, key, texte )
  { if (clic_func !== null)
     { result = "<button "+
                "class='btn btn-"+color+" w-100 btn-sm' "+
                "data-bs-toggle='tooltip' title='"+htmlEncode(tooltip)+"' "+
                "onclick="+clic_func+"('"+key+"')>"+
                "<span id='idButtonSpinner_"+clic_func+"_"+key+"' class='spinner-border spinner-border-sm' style='display:none' "+
                "role='status' aria-hidden='true'></span> "+
                htmlEncode(texte)+
                "</button>";
     }
   else
    { result =  "<button "+
                "class='btn btn-"+color+" w-100 btn-sm' "+
                "data-bs-toggle='tooltip' title='"+htmlEncode(tooltip)+"' "+
                "disabled>"+htmlEncode(texte)+
                "</button>";
    }
   return( result );
  }

 function Lien ( target, tooltip, texte )
  { return( "<a href='"+target+"' data-bs-toggle='tooltip' title='"+htmlEncode(tooltip)+"'>"+htmlEncode(texte)+"</a>" );
  }

 function Badge ( color, tooltip, texte )
  { return("<span "+
           "class='badge bg-"+color+"' "+
           "data-bs-toggle='tooltip' title='"+htmlEncode(tooltip)+"'>"+htmlEncode(texte)+
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
  { retour = "<select id='"+id+"' class='form-select border border-info' ";
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
  { retour = "<select id='"+id+"' class='form-select'"+"onchange="+fonction+">";
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
 function Show_modal_del ( titre, message, details, fonction, options )
  { $('#idModalDelTitre').html ( htmlEncode(titre) );
    $('#idModalDelMessage').html( htmlEncode(message) );
    $('#idModalDelDetails').html( htmlEncode(details) );
    $('#idModalDelOptions').empty().addClass("d-none");
    if (options !== undefined && options !== null && options.html !== undefined)
     { $('#idModalDelOptions').html(options.html).removeClass("d-none"); }
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
 function Charger_une_courbe ( idChart, tech_id, acronyme, period, methode )
  { var chartElement = document.getElementById(idChart);
    if (!chartElement) { console.log("Charger_une_courbe: Erreur chargement chartElement " + json_request ); return; }

    if (period===undefined) period="BY_HOUR";
    var json_request =
     { courbes: [ { tech_id : tech_id, acronyme : acronyme, } ],
       period   : period,
       methode  : methode
     };

    Send_to_API ( "POST", "/archive/get", json_request, function(json)
     { var dates = dates = json.valeurs.map( function(item) { return item.date; } );
       var valeurs = json.valeurs.map( function(item) { return item.valeur1; } );
       var data = { labels: dates,
                    datasets: [ { label: json.courbe1.libelle+ " ("+json.courbe1.unite+")",
                                  borderColor: "rgba(0, 100, 255, 1.0)",
                                  backgroundColor: "rgba(0, 100, 100, 0.1)",
                                  borderWidth: "1",
                                  tension: "0.1",
                                  radius: "1",
                                  data: valeurs,
                                },
                              ],
                  }
       var options = { maintainAspectRatio: false,
                       scales: { x: { ticks: { color: "white" } },
                                 y: { ticks: { color: "white" } }
                               },
                       plugins: { legend: { labels: { color: "white" } }
                                },
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
/******************************************************************************************************************************/
/* Get_url_parameter : Recupere un parametre de recherche dans l'URL                                                          */
/******************************************************************************************************************************/
 function Get_url_parameter ( name )
  { const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return (urlParams.get(name));
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
