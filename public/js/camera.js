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
function Camera_fermer_flux ( camera_id )
 { var video = document.getElementById("idCamera_"+camera_id);
   if (video)
    { if (video.hlsInstance)
       { video.hlsInstance.destroy();
         video.hlsInstance = null;
       }
      video.pause();
      video.src = "";
    }
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Arreter_toutes_cameras ( )
 { $(".wtd-camera").each(function()
    { var camera_id = $(this).attr("data-camera-id");
      if (camera_id) Camera_fermer_flux(camera_id);
    });
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Creer_camera ( Response )
 { var camera_id  = Response.syn_camera_id;
   var element_id = "idCamera_"+camera_id;
   var url        = Response.url;

   var video = $('<video></video>').attr("id", element_id)
                                   .attr("title", Response.camera_name)
                                   .attr("aria-label", Response.camera_name)
                                   .attr("data-camera-id", camera_id)
                                   .attr("controls", true)
                                   .attr("autoplay", true)
                                   .attr("muted", true)
                                   .attr("playsinline", true)
                                   .addClass("wtd-camera");

   var card = $('<div></div>').addClass("row bg-transparent mb-3")
              .append( $('<div></div>').addClass("col text-center mb-1")
                       .append( video )
                     )
              .append( $('<div></div>').addClass('w-100') )
              .append( $('<div></div>').addClass("col text-center")
                       .append( $('<span></span>').addClass("text-white").text(" "+Response.camera_name) )
                     );

   setTimeout(function()
    { var videoEl = document.getElementById(element_id);
      if (!videoEl) return;
      if (typeof Hls !== 'undefined' && Hls.isSupported())
       { var hls = new Hls();
         hls.loadSource(url);
         hls.attachMedia(videoEl);
         videoEl.hlsInstance = hls;
       }
      else if (videoEl.canPlayType('application/vnd.apple.mpegurl'))
       { videoEl.src = url; }
    }, 0);

   return(card);
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
