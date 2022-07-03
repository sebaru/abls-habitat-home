/********************************************* Chargement du synoptique 1 au démrrage *****************************************/
 function Load_page ()
  { if ( localStorage.getItem("domain_uuid") == null ) $("#idAlertNoDomain").slideDown("slow");

    Send_to_API ( 'POST', "/domain/list", null, function (Response)
     { Response.domains.forEach ( function (element, index)
        { let card = $("<div>").addClass("card shadow m-1 bg-dark");

          let header = $("<h5>").html( Badge_Access_level ( element.access_level ) + " " + element.domain_name );
          card.append ( $("<div>").addClass("card-header text-center").append(header) );

          let body = $("<img>").css("cursor","pointer").addClass("wtd-img-card")
                     .click( function () { Changer_domaine ( element ); } );
          if (element.image) body.attr ("src", element.image );
                        else body.attr ("src", "https://static.abls-habitat.fr/img/syn_accueil.png" );
          card.append ( $("<div>").addClass("card-body text-center").append(body) );

          let footer = $("<button>").addClass("btn btn-primary")
                         .click( function () { Changer_domaine ( element ); } )
                         .text("Choisir");

          card.append ( $("<div>").addClass("card-footer text-center").append( footer ) );

          $("#idCardContainer").append(card);
        });
     }, null );
  }
/******************************************************************************************************************************/
 function Changer_domaine ( element )
  { console.log("Demande de changement de domaine : " + element.domain_uuid );
    localStorage.setItem ( "domain_uuid", element.domain_uuid );
    localStorage.setItem ( "domain_name", element.domain_name );
    element.target_domain_uuid = element.domain_uuid;
    Send_to_API ( 'POST', "/user/set_domain", element, function (Response)
     { Redirect("/");
     }, null );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
