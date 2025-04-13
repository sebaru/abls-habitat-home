
 var Charts = new Array();

/********************************* Chargement d'une courbe dans 1 synoptique **************************************************/
 function Update_tableau_by_courbe ( idDest, tableau, tableau_map )
  { var idTableau = "idTableau-"+tableau.tableau_id;
    var chartElement = document.getElementById(idTableau);
    if (!chartElement)                                                                    /* Le tableau a-t'il été supprimé ? */
     { Charts[idTableau].ctx.destroy();                                                          /* Si oui, on fait le menage */
       if (Charts[idTableau].timeout != null) clearTimeout ( Charts[idTableau].timeout );
       Charts[idTableau] = null;
       return;
     }

    var json_request =
     { courbes: tableau_map.map( function (item)
                                  { return( { tech_id: item.tech_id, acronyme: item.acronyme } ) } ),
       period : Charts[idTableau].period
     };

    Send_to_API ( "POST", "/archive/get", json_request, function(Response)
     { var dates;
       var ctx = chartElement.getContext('2d');
       if (!ctx) { console.log("Erreur chargement context " + json_request ); return; }

       if (Charts[idTableau].period=="HOUR") dates = Response.valeurs.map( function(item) { return item.date.split(' ')[1]; } );
                                        else dates = Response.valeurs.map( function(item) { return item.date; } );
       var data = { labels: dates,
                    datasets: [],
                  }
       for (i=0; i<tableau_map.length; i++)
        { data.datasets.push ( { label: Response["courbe"+(i+1)].libelle+ " ("+Response["courbe"+(i+1)].unite+")",
                                 borderColor: tableau_map[i].color,
                                 /*backgroundColor: "rgba(0, 0, 0, 0.5)",*/
                                 backgroundColor: tableau_map[i].color,/*"rgba(100, 100, 100, 0.1)",*/
                                 borderWidth: "1",
                                 tension: "0.1",
                                 radius: "1",
                                 data: Response.valeurs.map( function(item)
                                  { return( (tableau_map[i].multi*item["moyenne"+(i+1)]) + tableau_map[i].offset);
                                  }),
                               });
        }

       var options = { maintainAspectRatio: false,
                       scales: { x: { ticks: { color: "white" } },
                                 y: { ticks: { color: "white" } }
                               },
                       plugins: { legend: { labels: { color: "white" } }
                                },

                     };

        if (!Charts[idTableau].ctx)
         { Charts[idTableau].ctx = new Chart(ctx, { type: 'line', data: data, options: options } ); }
        else
         { Charts[idTableau].ctx.data = data;
           Charts[idTableau].ctx.options = options;
           Charts[idTableau].ctx.update();
         }
     });
  }
/********************************* Chargement d'une courbe dans 1 synoptique **************************************************/
 function Charger_tableau_by_courbe ( idDest, tableau, tableau_map )
  { console.debug(tableau);
    var idTableau = "idTableau-"+tableau.tableau_id;

    $("#"+idDest).append( $("<div></div>").addClass("col").attr("id", idTableau+"-div")
                          .append ( $("<div></div").addClass("d-flex align-items-center")
                                    .append ( $("<h2></h2>").addClass("flex-grow-1 text-white text-center").append (tableau.titre)
                                            )
                                    .append ( $("<div></div>").addClass(" w-auto btn-group align-items-center")
                                              .append ( $("<i></i>").addClass("fas fa-clock text-primary mr-2" ) )
                                              .append ( $( "<select></select" )
                                                        .attr("id", idTableau+"-select")
                                                        .addClass("custom-select")
                                                        .append ( $("<option></option>").attr("value", "HOUR").append("Heure") )
                                                        .append ( $("<option></option>").attr("value", "DAY").append("Jour") )
                                                        .append ( $("<option></option>").attr("value", "WEEK").append("Semaine") )
                                                        .append ( $("<option></option>").attr("value", "MONTH").append("Mois") )
                                                        .append ( $("<option></option>").attr("value", "YEAR").append("Année") )
                                                        .append ( $("<option></option>").attr("value", "ALL").append("Tout") )
                                                      )
                                            )
                                  )
                          .append( $("<canvas></canvas>").attr("id", idTableau).addClass("wtd-courbe") )
                        );
    Charts[idTableau] = new Object ();
    Charts[idTableau].period = "HOUR";

    $("#"+idTableau+"-select").off("change").on("change", function ()
     { Charts[idTableau].period = $("#"+idTableau+"-select").val()
       console.log("Change period for "+idTableau+" to " + Charts[idTableau].period);
       Update_tableau_by_courbe ( idDest, tableau, tableau_map )
     });

    var chartElement = document.getElementById(idTableau);                                          /* On récupère le tableau */
    if (!chartElement) { console.log("Erreur chargement chartElement " + idTableau ); return; }

    if (Charts[idTableau].period == "HOUR")
        { Charts[idTableau].timeout = setTimeout ( function()                                                /* Update graphe */
           { Update_tableau_by_courbe ( idDest, tableau, tableau_map ); }, 60000 );
        }
    else if (Charts[idTableau].timeout != null) clearTimeout ( Charts[idTableau].timeout );            /* Arret timeout sinon */

    Update_tableau_by_courbe ( idDest, tableau, tableau_map );
  }
/********************************* Chargement d'une courbe dans 1 synoptique **************************************************/
 function Charger_tableau_by_table ( idDest, tableau, tableau_map, period )
  { var idTableau = "idTableau-"+tableau.tableau_id;
    var tableElement = document.getElementById(idTableau);                 /* Tableau existant ? Sinon on l'ajoute à l'idDest */
    if (!tableElement)
     { $("#"+idDest).append( $("<div></div>").addClass("col table-responsive").attr("id", idTableau+"-div")
                             .append( $("<h2></h2").addClass("text-white text-center").append (tableau.titre) )
                             .append( $("<table></table>").attr("id", idTableau).addClass("table table-dark") )
                           );
     }

    if (period===undefined) period="HOUR";
    var json_request =
     { courbes: tableau_map.map( function (item)
                                  { return( { tech_id: item.tech_id, acronyme: item.acronyme } ) } ),
       period : period
     };

    var colonnes = [];
    colonnes.push ( { "data": "date", "title":"Date", "className": "text-center" } );
    for (var i=0; i<json_request.courbes.length; i++)
     { colonnes.push ( { "data": "moyenne"+(i+1), "title":"Valeur", "className": "text-center" } ); }

    $('#'+idTableau).DataTable(
       { pageLength : 25,
         fixedHeader: true,
         ajax: { url : $ABLS_API+"/archive/get", type : "POST", dataSrc: "valeurs", contentType: "application/json",
                 data: function () { return (JSON.stringify(json_request)); },
                 error: function ( xhr, status, error ) { Show_toast_ko(xhr.statusText); },
                 beforeSend: function (request)
                              { request.setRequestHeader('Authorization', 'Bearer ' + Token);
                                request.setRequestHeader('X-ABLS-DOMAIN', localStorage.getItem("domain_uuid") );
                              }
               },
         /*rowId: "tableau_id",*/
         columns: colonnes,
         /*order: [ [0, "desc"] ],*/
         responsive: true,
       }
     );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
