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
var Camera_streams = {};
var CAMERA_TARGET_FPS = 12;
var CAMERA_RETRY_MAX = 5;
var CAMERA_RETRY_BASE_MS = 1000;

/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_normaliser_url_ws ( url )
 { if (!url) return url;
   if (url.indexOf("https://") === 0) return "wss://" + url.substring(8);
   if (url.indexOf("http://") === 0) return "ws://" + url.substring(7);
   return url;
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_status_set ( camera_id, text, css_class )
 { var status = $("#idCameraStatus_"+camera_id);
   if (!status.length) return;
   status.removeClass("text-success text-warning text-danger text-secondary")
         .addClass(css_class)
         .text(text);
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_decode_frame_to_blob ( payload )
 { if (payload instanceof Blob) return Promise.resolve(payload);
   if (payload instanceof ArrayBuffer) return Promise.resolve(new Blob([payload], { type: "image/jpeg" }));
   if (typeof payload === "string")
    { if (payload.indexOf("data:image/") === 0)
       { var base64 = payload.split(",")[1] || "";
         var binary = atob(base64);
         var bytes = new Uint8Array(binary.length);
         for (var i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
         return Promise.resolve(new Blob([bytes], { type: "image/jpeg" }));
       }
    }
   return Promise.reject(new Error("Payload camera inconnu"));
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_draw_blob ( state, blob )
 { if (state.stopped) return Promise.resolve();

   if (window.createImageBitmap)
    { return createImageBitmap(blob).then(function(bitmap)
       { if (state.stopped) { bitmap.close(); return; }
         if (bitmap.width > 0 && bitmap.height > 0 &&
             (state.canvas.width !== bitmap.width || state.canvas.height !== bitmap.height))
          { state.canvas.width = bitmap.width;
            state.canvas.height = bitmap.height;
          }
         state.ctx.drawImage(bitmap, 0, 0, state.canvas.width, state.canvas.height);
         bitmap.close();
       });
    }

   return new Promise(function(resolve, reject)
    { var img = new Image();
      var object_url = URL.createObjectURL(blob);
      img.onload = function()
       { if (state.stopped)
          { URL.revokeObjectURL(object_url);
            resolve();
            return;
          }
         if (img.naturalWidth > 0 && img.naturalHeight > 0 &&
             (state.canvas.width !== img.naturalWidth || state.canvas.height !== img.naturalHeight))
          { state.canvas.width = img.naturalWidth;
            state.canvas.height = img.naturalHeight;
          }
         state.ctx.drawImage(img, 0, 0, state.canvas.width, state.canvas.height);
         URL.revokeObjectURL(object_url);
         resolve();
       };
      img.onerror = function()
       { URL.revokeObjectURL(object_url);
         reject(new Error("Image camera invalide"));
       };
      img.src = object_url;
    });
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_programmer_reconnexion ( state )
 { if (state.stopped) return;

   if (state.retry_count >= CAMERA_RETRY_MAX)
    { Camera_status_set ( state.camera_id, "flux indisponible", "text-danger" );
      return;
    }

   state.retry_count++;
   var delay = CAMERA_RETRY_BASE_MS * state.retry_count;
   Camera_status_set ( state.camera_id, "reconnexion...", "text-warning" );
   state.retry_timer = setTimeout ( function() { Camera_ouvrir_socket ( state ); }, delay );
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_fermer_flux ( camera_id )
 { var state = Camera_streams[camera_id];
   if (!state) return;

   state.stopped = true;
   if (state.retry_timer) clearTimeout(state.retry_timer);
   if (state.socket)
    { state.socket.onopen = null;
      state.socket.onmessage = null;
      state.socket.onerror = null;
      state.socket.onclose = null;
      try { state.socket.close(); }
      catch(err) { }
   }
   if (state.video)
    { try { state.video.pause(); }
      catch(err) { }
      state.video.srcObject = null;
   }
   delete Camera_streams[camera_id];
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_ouvrir_socket ( state )
 { if (state.stopped) return;

   if (state.retry_timer)
    { clearTimeout(state.retry_timer);
      state.retry_timer = null;
    }

   Camera_status_set ( state.camera_id, "connexion...", "text-warning" );

   try
    { state.socket = new WebSocket(state.url);
      state.socket.binaryType = "arraybuffer";
    }
   catch(err)
    { Camera_programmer_reconnexion(state);
      return;
    }

   state.socket.onopen = function()
    { state.retry_count = 0;
      Camera_status_set ( state.camera_id, "en direct", "text-success" );
    };

   state.socket.onmessage = function(event)
    { if (state.stopped || state.decoding) return;
      var now = Date.now();
      if ((now - state.last_frame_ts) < state.frame_interval_ms) return;

      state.decoding = true;
      Camera_decode_frame_to_blob(event.data)
       .then(function(blob) { return Camera_draw_blob(state, blob); })
       .then(function()
        { if (!state.stopped) state.last_frame_ts = Date.now();
        })
       .catch(function()
        { Camera_status_set ( state.camera_id, "flux dégradé", "text-warning" );
        })
       .finally(function() { state.decoding = false; });
    };

   state.socket.onerror = function()
    { Camera_status_set ( state.camera_id, "erreur flux", "text-warning" );
    };

   state.socket.onclose = function()
    { if (state.stopped) return;
      Camera_programmer_reconnexion(state);
    };
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Camera_initialiser_flux ( Response )
 { var camera_id = Response.syn_camera_id;
   var video = document.getElementById("idCamera_"+camera_id);
   if (!video) return;

   Camera_fermer_flux(camera_id);

   var canvas = document.createElement("canvas");
   canvas.width = 640;
   canvas.height = 360;
   var ctx = canvas.getContext("2d", { alpha: false });
   if (!ctx)
    { Camera_status_set ( camera_id, "canvas indisponible", "text-danger" );
      return;
    }

   var state =
    { camera_id: camera_id,
      url: Camera_normaliser_url_ws(Response.url),
      video: video,
      canvas: canvas,
      ctx: ctx,
      socket: null,
      retry_timer: null,
      retry_count: 0,
      decoding: false,
      stopped: false,
      last_frame_ts: 0,
      frame_interval_ms: Math.floor(1000 / CAMERA_TARGET_FPS)
    };
   Camera_streams[camera_id] = state;

   try
    { video.srcObject = canvas.captureStream(CAMERA_TARGET_FPS);
      video.play().catch(function() { });
    }
   catch(err)
    { Camera_status_set ( camera_id, "video indisponible", "text-danger" );
      Camera_fermer_flux(camera_id);
      return;
    }

   Camera_ouvrir_socket(state);
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Arreter_toutes_cameras ( )
 { Object.keys(Camera_streams).forEach(function(camera_id)
    { Camera_fermer_flux(camera_id); }
   );
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
function Creer_camera ( Response )
 { var camera_id = Response.syn_camera_id;
   var video_id = "idCamera_"+camera_id;
   var card = $('<div></div>').addClass("row bg-transparent mb-3")
              .append( $('<div></div>').addClass("col text-center mb-1")
                       .append( $('<video></video>').attr("id", video_id)
                                                   .attr("autoplay", true)
                                                   .attr("muted", true)
                                                   .attr("playsinline", true)
                                                   .attr("aria-label", Response.camera_name)
                                                   .attr("data-camera-url", Response.url)
                                                   .attr("data-camera-id", camera_id)
                                                   .attr("title", Response.camera_name)
                                                   .addClass("wtd-camera")
                               )
                     )
              .append( $('<div></div>').addClass('w-100') )
              .append( $('<div></div>').addClass("col text-center")
                       .append( $('<span></span>').addClass("text-white").text(" "+Response.camera_name) )
                               .append( $('<small></small>').attr("id", "idCameraStatus_"+camera_id)
                                                            .addClass("d-block text-secondary")
                                                            .text("initialisation...")
                                      )
                     );

   setTimeout(function() { Camera_initialiser_flux(Response); }, 0);
   return(card);
 }
/*----------------------------------------------------------------------------------------------------------------------------*/
