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
      if (video.mp4Abort)
       { video.mp4Abort.abort();
         video.mp4Abort = null;
       }
      video.pause();
      video.removeAttribute("src");
      video.load();
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
function Camera_is_hls ( url )
 { return url.indexOf(".m3u8") !== -1; }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_attacher_hls ( videoEl, url, camera_id )
 { var destroyed = false;
   var hls = new Hls(
    { enableWorker: true,
      liveSyncDurationCount: 5,
      liveMaxLatencyDurationCount: 10,
      maxBufferHole: 0.5,
    xhrSetup: function(xhr) {}
    });
   videoEl.muted = true;
   hls.loadSource(url);
   hls.attachMedia(videoEl);
   videoEl.hlsInstance = hls;

   hls.on(Hls.Events.MANIFEST_PARSED, function()
    { if (destroyed) return;
      videoEl.muted = true;
      videoEl.play().catch(function(error)
       { if (destroyed) return;
         if (error.name === "NotAllowedError")
          { console.log("Camera " + camera_id + ": autoplay bloqué, en attente interaction utilisateur"); }
       });
    });

   hls.on(Hls.Events.ERROR, function(event, data)
    { if (data.fatal)
       { console.log("Camera " + camera_id + ": erreur fatale HLS " + data.type + " / " + data.details, data);
         destroyed = true;
         hls.destroy();
         videoEl.hlsInstance = null;

         var delai = (data.details === "fragParsingError") ? 3000 : 5000;
         console.log("Camera " + camera_id + ": reconnexion dans " + (delai/1000) + "s...");
         setTimeout(function()
          { if (document.getElementById(videoEl.id))
             { Camera_attacher_hls(videoEl, url, camera_id); }
          }, delai);
       }
    });
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_attacher_mp4 ( videoEl, url, camera_id )
 { videoEl.muted = true;
   var abortController = new AbortController();
   videoEl.mp4Abort = abortController;

   var src = url + (url.indexOf("?") !== -1 ? "&" : "?") + "t=" + Date.now();

  fetch(src, { signal: abortController.signal })
    .then(function(response)
     { if (!response.ok) throw new Error("HTTP " + response.status);

       var mediaSource = new MediaSource();
       videoEl.src = URL.createObjectURL(mediaSource);

       mediaSource.addEventListener("sourceopen", function()
        { var mime = 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"';
          if (!MediaSource.isTypeSupported(mime)) mime = "video/mp4";
          var sourceBuffer = mediaSource.addSourceBuffer(mime);
          var reader = response.body.getReader();
          var queue = [];
          var appending = false;

          function appendNext()
           { if (appending || queue.length === 0) return;
             appending = true;
             sourceBuffer.appendBuffer(queue.shift());
           }

          sourceBuffer.addEventListener("updateend", function()
           { appending = false;
             if (queue.length > 0) appendNext();
             if (!videoEl.paused) return;
             videoEl.muted = true;
             videoEl.play().catch(function(error)
              { if (error.name === "NotAllowedError")
                 { console.log("Camera " + camera_id + ": autoplay bloqué, en attente interaction utilisateur"); }
              });
           });

          function pump()
           { reader.read().then(function(result)
              { if (result.done)
                 { if (mediaSource.readyState === "open") mediaSource.endOfStream();
                   return;
                 }
                queue.push(result.value);
                appendNext();
                pump();
              }).catch(function(e)
              { if (!abortController.signal.aborted)
                 { console.log("Camera " + camera_id + ": flux MP4 interrompu: " + e.message); }
              });
           }
          pump();
        });
     })
    .catch(function(error)
     { if (abortController.signal.aborted) return;
       console.log("Camera " + camera_id + ": erreur flux MP4: " + error.message + ", reconnexion dans 5s...");
       setTimeout(function()
        { if (document.getElementById(videoEl.id))
           { Camera_attacher_mp4(videoEl, url, camera_id); }
        }, 5000);
     });
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Creer_camera ( Response )
 { var camera_id  = Response.syn_camera_id;
   var element_id = "idCamera_"+camera_id;
   var url        = Response.url;

   var video = $('<video muted playsinline></video>')
                                   .attr("id", element_id)
                                   .attr("title", Response.camera_name)
                                   .attr("aria-label", Response.camera_name)
                                   .attr("data-camera-id", camera_id)
                                   .attr("controls", true)
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
      if (Camera_is_hls(url) && typeof Hls !== 'undefined' && Hls.isSupported())
       { Camera_attacher_hls(videoEl, url, camera_id); }
      else if (Camera_is_hls(url) && videoEl.canPlayType('application/vnd.apple.mpegurl'))
       { videoEl.src = url;
         videoEl.addEventListener('loadedmetadata', function()
          { videoEl.play().catch(function() {}); });
       }
      else
       { Camera_attacher_mp4(videoEl, url, camera_id); }
    }, 0);

   return(card);
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
