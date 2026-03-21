/******************************************************************************************************************************/
/* HOME/public/js/camera.js  Gestion des cameras dans les synoptiques                                                         */
/* Projet Abls-Habitat version 4.7       Gestion d'habitat                                                                    */
/* Auteur: LEFEVRE Sebastien                                                                                                  */
/******************************************************************************************************************************/
/*
 * camera.js
 * This file is part of Abls-Habitat
 *
 * Copyright (C) 1988-2026 - Sébastien LEFÈVRE
 *
 * Watchdog is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Watchdog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Watchdog; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */
/*----------------------------------------------------------------------------------------------------------------------------*/
 function Creer_camera ( Response )
  { var card = $('<div></div>').addClass("row bg-transparent mb-3")
               .append( $('<div></div>').addClass("col text-center mb-1")
                        .append( $('<img>').attr("src", Response.url)
                                           .attr("alt",  Response.camera_name)
                                           .attr("id",   "idCamera_"+Response.syn_camera_id)
                                           .addClass("wtd-camera")
                               )
                      )
               .append( $('<div></div>').addClass('w-100') )
               .append( $('<div></div>').addClass("col text-center")
                        .append( $('<span></span>').addClass("text-white").text(" "+Response.camera_name) )
                      );
    return(card);
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
