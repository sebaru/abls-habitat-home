/********************************************* Charge la page entiere *********************************************************/
 function Load_page ( )
  { var vars       = window.location.pathname.split('/');
    var tableau_id = vars[2];
    var period     = vars[3];
    if (tableau_id==null) tableau_id=10000;
    if (period!=null) $("#idTableauPeriod").val( period );
    $("#idCourbePeriod").off("change").on("change", function () { Redirect ( "/tableau/"+tableau_id+"/"+$("#idTableauPeriod").val() ); } );

    Send_to_API ( "GET", "/tableau/map/list", "tableau_id="+tableau_id, function(Response)
     { $('#idTableauTitle').text(Response.titre);
       Charger_plusieurs_courbes ( "idTableauCanvas", Response.tableau_map, period );
     }, null );

  }
/*----------------------------------------------------------------------------------------------------------------------------*/
