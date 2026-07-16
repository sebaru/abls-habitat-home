
 var Charts = new Array();

/***************************************** Echappe une cellule CSV *************************************************************/
function Csv_escape_cell ( value )
 { if (value === undefined || value === null) return('""');
   var string_value = value.toString();
   if (string_value.length>0 && (string_value[0]=='=' || string_value[0]=='+' || string_value[0]=='-' || string_value[0]=='@'))
    { string_value = "'"+string_value; }
   string_value = string_value.replace(/"/g, '""');
   return('"'+string_value+'"');
 }

/***************************************** Active/Désactive bouton export ******************************************************/
function Tableau_export_button_set_enabled ( idTableau, enabled )
 { $("#"+idTableau+"-export").prop("disabled", !enabled); }

/***************************************** Nom de fichier export ***************************************************************/
function Tableau_get_export_filename ( tableau )
 { var now = new Date();
   var yyyy = now.getFullYear().toString();
   var mm = ("0" + (now.getMonth()+1)).slice(-2);
   var dd = ("0" + now.getDate()).slice(-2);
   var hh = ("0" + now.getHours()).slice(-2);
   var mi = ("0" + now.getMinutes()).slice(-2);
   var titre = (tableau.titre ? tableau.titre : "tableau").toString().replace(/[^a-zA-Z0-9_-]/g, "_");
   return(titre+"_"+tableau.periode+"_"+yyyy+mm+dd+"-"+hh+mi+".csv");
 }

/***************************************** Exporte la derniere réponse archive en CSV *****************************************/
function Tableau_export_csv ( idTableau, tableau, tableau_map )
 { if (!Charts[idTableau] || !Charts[idTableau].lastArchiveResponse || !Charts[idTableau].lastArchiveResponse.valeurs)
    { Show_shell_error("Export impossible: données non chargées.");
      return;
    }

   var Response = Charts[idTableau].lastArchiveResponse;
   var lignes = [];
   var headers = [ "Date" ];
   var i = 0;

   for (i=0; i<tableau_map.length; i++)
    { var courbe = Response["courbe"+(i+1)];
      var colonne = "Courbe "+(i+1);
      if (courbe && courbe.libelle) colonne = courbe.libelle;
      if (courbe && courbe.unite) colonne += " ("+courbe.unite+")";
      headers.push(colonne);
    }
   lignes.push(headers.map(Csv_escape_cell).join(";"));

   $.each(Response.valeurs, function (j, item)
    { var row = [ item.date ];
      for (i=0; i<tableau_map.length; i++)
       { var brut = item["valeur"+(i+1)];
         if (brut === undefined || brut === null || brut === "")
          { row.push("");
            continue;
          }

         var nombre = parseFloat(brut);
         if (isNaN(nombre)) row.push(brut);
         else row.push((tableau_map[i].multi*nombre)+tableau_map[i].offset);
       }
      lignes.push(row.map(Csv_escape_cell).join(";"));
    });

   var csv = "\uFEFF" + lignes.join("\n");
   var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
   var url = URL.createObjectURL(blob);
   var link = document.createElement("a");
   link.href = url;
   link.download = Tableau_get_export_filename(tableau);
   /* Ne pas appender au body pour éviter que le router intercepte le click */
   link.dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
   setTimeout(function() { URL.revokeObjectURL(url); }, 200);
   Show_toast_ok("Export CSV créé");
 }

/***************************************** Click export tableau ***************************************************************/
function Tableau_on_export_click ( idTableau, tableau, tableau_map )
 { var bouton = $("#"+idTableau+"-export");
   if (bouton.prop("disabled")) return;

   bouton.prop("disabled", true);
   try { Tableau_export_csv ( idTableau, tableau, tableau_map ); }
   finally { Tableau_export_button_set_enabled(idTableau,
                                               Charts[idTableau] && Charts[idTableau].lastArchiveResponse !== null &&
                                               Charts[idTableau].lastArchiveResponse !== undefined );
           }
 }

/********************************* Chargement d'une courbe dans 1 synoptique **************************************************/
 function Update_tableau_by_courbe ( idDest, tableau, tableau_map )
  { var idTableau = "idTableau-"+tableau.tableau_id;
    if (Charts[idTableau]) Charts[idTableau].lastArchiveResponse = null;
    Tableau_export_button_set_enabled(idTableau, false);

    var chartElement = document.getElementById(idTableau);
    if (!chartElement)                                                                    /* Le tableau a-t'il été supprimé ? */
     { Charts[idTableau].ctx.destroy();                                                          /* Si oui, on fait le menage */
       if (Charts[idTableau].timeout != null) clearTimeout ( Charts[idTableau].timeout );
       Charts[idTableau] = null;
       return;
     }

    if (tableau.periode == "BY_HOUR")
     { Charts[idTableau].timeout = setTimeout ( function()                                                   /* Update graphe */
        { Update_tableau_by_courbe ( idDest, tableau, tableau_map ); }, 60000 );
     }
    else if (Charts[idTableau].timeout != null) clearTimeout ( Charts[idTableau].timeout );            /* Arret timeout sinon */

    var json_request =
     { courbes: tableau_map.map( function (item)
                                  { return( { tech_id : item.tech_id,
                                              acronyme: item.acronyme,
                                              methode : item.methode
                                            } )
                                  }),
       period : tableau.periode
     };

    Send_to_API ( "POST", "/archive/get", json_request, function(Response)
     { Charts[idTableau].lastArchiveResponse = Response;
       Tableau_export_button_set_enabled(idTableau, true);

       var ctx = chartElement.getContext('2d');
       if (!ctx) { console.log("Erreur chargement context " + json_request ); return; }

       var dates = Response.valeurs.map( function(item) { return item.date; } );

       var data = { labels: dates, datasets: [] };
       for (i=0; i<tableau_map.length; i++)
        { data.datasets.push ( { label: Response["courbe"+(i+1)].libelle+ " ("+Response["courbe"+(i+1)].unite+")",
                                 borderColor: tableau_map[i].color,
                                 /*backgroundColor: "rgba(0, 0, 0, 0.5)",*/
                                 backgroundColor: tableau_map[i].color,/*"rgba(100, 100, 100, 0.1)",*/
                                 borderWidth: "1",
                                 tension: "0.1",
                                 radius: "1",
                                 data: Response.valeurs.map( function(item)
                                  { return( (tableau_map[i].multi*item["valeur"+(i+1)]) + tableau_map[i].offset);
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

    Charts[idTableau] = new Object ();
    Charts[idTableau].lastArchiveResponse = null;

    $("#"+idDest).append( $("<div></div>").addClass("col").attr("id", idTableau+"-div")
                          .append ( $("<div></div").addClass("d-flex align-items-center")
                                    .append ( $("<h2></h2>").addClass("flex-grow-1 text-white text-center").append (tableau.titre)
                                            )
                                    .append ( $("<div></div>").addClass(" w-auto btn-group align-items-center")
                                              .attr("id", idTableau+"-div-select")
                                              .append ( $("<i></i>").addClass("fas fa-clock text-primary me-2" ) )
                                              .append ( $( "<select></select" )
                                                        .attr("id", idTableau+"-select")
                                                      )
                                              .append ( $("<button></button>")
                                                        .attr("id", idTableau+"-export")
                                                        .addClass("btn btn-primary btn-sm ms-2 d-none d-md-inline-flex")
                                                        .prop("disabled", true)
                                                        .append( $("<i></i>").addClass("fas fa-file-csv me-1") )
                                                      )
                                            )
                                  )
                          .append( $("<canvas></canvas>").attr("id", idTableau).addClass("wtd-courbe") )
                        );
    if (tableau.period_lock == false)
     { $("#"+idTableau+"-select").replaceWith ( Select ( idTableau+"-select", null, PeriodeTableau, tableau.periode ) );
       $("#"+idTableau+"-select").off("change").on("change", function ()
        { tableau.periode = $("#"+idTableau+"-select").val()
          console.log("Change period for "+idTableau+" to " + tableau.periode);
          Update_tableau_by_courbe ( idDest, tableau, tableau_map )
        });
     } else $("#"+idTableau+"-div-select").hide();

    $("#"+idTableau+"-export").off("click").on("click", function ()
     { Tableau_on_export_click ( idTableau, tableau, tableau_map );
     });

    var chartElement = document.getElementById(idTableau);                                          /* On récupère le tableau */
    if (!chartElement) { console.log("Erreur chargement chartElement " + idTableau ); return; }

    Update_tableau_by_courbe ( idDest, tableau, tableau_map );
  }
/********************************* Chargement d'une courbe dans 1 synoptique **************************************************/
 function Update_tableau_by_valeur ( idDest, tableau, tableau_map )
  { var idTableau = "idTableau-"+tableau.tableau_id;
    if (!Charts[idTableau]) Charts[idTableau] = new Object();
    Charts[idTableau].lastArchiveResponse = null;
    Tableau_export_button_set_enabled(idTableau, false);

    var json_request =
     { courbes: tableau_map.map( function (item)
                                  { return( { tech_id: item.tech_id, acronyme: item.acronyme, methode: item.methode } ) } ),
       period : tableau.periode
     };
    var colonnes = [];
    colonnes.push ( { "data": "date", "title":"Date", "className": "text-center" } );
    for (var i=0; i<json_request.courbes.length; i++)
     { colonnes.push ( { "data": "valeur"+(i+1), "title":"Valeur", "className": "text-center" } ); }

    $("#"+idTableau).DataTable(
       { destroy: true, pageLength: 15,
         fixedHeader: true, searching: false, lengthChange: false,
         ajax: { url : $ABLS_API+"/archive/get", type : "POST", contentType: "application/json",
                 dataSrc: function (Response)
                  { Charts[idTableau].lastArchiveResponse = Response;
                    Tableau_export_button_set_enabled(idTableau, true);
                    return(Response.valeurs);
                  },
                 data: function () { return (JSON.stringify(json_request)); },
                 error: function ( xhr, status, error )
                  { Tableau_export_button_set_enabled(idTableau, false);
                    Show_shell_error(xhr.statusText);
                  }
               },
         /*rowId: "tableau_id",*/
         columns: colonnes,
         /*order: [ [0, "desc"] ],*/
       }
     );
  }
/********************************* Chargement d'une courbe dans 1 synoptique **************************************************/
 function Charger_tableau_by_table ( idDest, tableau, tableau_map )
  { var idTableau = "idTableau-"+tableau.tableau_id;
    if (!Charts[idTableau]) Charts[idTableau] = new Object();
    Charts[idTableau].lastArchiveResponse = null;
    var tableElement = document.getElementById(idTableau);                 /* Tableau existant ? Sinon on l'ajoute à l'idDest */
    if (!tableElement)
     { $("#"+idDest).append( $("<div></div>").addClass("col").attr("id", idTableau+"-div")
                             .append ( $("<div></div").addClass("d-flex align-items-center")
                                       .append ( $("<h2></h2>").addClass("flex-grow-1 text-white text-center").append (tableau.titre)
                                               )
                                       .append ( $("<div></div>").addClass(" w-auto btn-group align-items-center")
                                                 .attr("id", idTableau+"-div-select")
                                                 .append ( $("<i></i>").addClass("fas fa-clock text-primary me-2" ) )
                                                 .append ( $( "<select></select" )
                                                           .attr("id", idTableau+"-select")
                                                         )
                                                 .append ( $("<button></button>")
                                                           .attr("id", idTableau+"-export")
                                                        .addClass("btn btn-primary btn-sm ms-2 d-none d-md-inline-flex")
                                                           .prop("disabled", true)
                                                           .append( $("<i></i>").addClass("fas fa-file-csv me-1") )
                                                         )
                                               )
                                     )
                             .append( $("<table></table>").attr("id", idTableau).addClass("table table-dark") )
                           );
     }

    if (tableau.period_lock == false)
     { $("#"+idTableau+"-select").replaceWith ( Select ( idTableau+"-select", null, PeriodeTableau, tableau.periode ) );
       $("#"+idTableau+"-select").off("change").on("change", function ()
        { tableau.periode = $("#"+idTableau+"-select").val()
          console.log("Change period for "+idTableau+" to " + tableau.periode);
          Update_tableau_by_valeur ( idDest, tableau, tableau_map );
        });
     } else $("#"+idTableau+"-div-select").hide();

    $("#"+idTableau+"-export").off("click").on("click", function ()
     { Tableau_on_export_click ( idTableau, tableau, tableau_map );
     });

    Update_tableau_by_valeur ( idDest, tableau, tableau_map );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
