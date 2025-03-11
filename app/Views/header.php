<!doctype html>
<html lang="fr">
    <head>
        <meta charset="utf-8">
        <title>Chez moi</title>

        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="google" content="notranslate">
        <meta name="robots" content="noindex, nofollow">
        <link rel="icon" href="https://static.abls-habitat.fr/img/abls.svg">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css"/>
        <style>
        :root { color-scheme: dark; }

        body { background-image: url('https://static.abls-habitat.fr/img/fond_home.jpg');
               background-position: center;
               background-size: cover;
               background-repeat: no-repeat;
               background-attachment: fixed;
               height: 100%;
               background-color: rgba(30,28,56,1.0);
               padding-top: 80px;
               padding-bottom: 40px;
               overflow-y: scroll;
             }

        h3 { color: white; }

        .wtd-cligno { animation-duration: 1.0s;
                      animation-name: wtdClignoFrames;
                      animation-iteration-count: infinite;
                      animation-fill-mode: backwards;
                      transition: none;
                    }
        @keyframes wtdClignoFrames
         {   0% { opacity: 1; }
            30% { opacity: 0; }
           100% { opacity: 1; }
         }

        .wtd-noshow { animation-duration: 0.3s;
                      animation-name: wtdNoShowFrames;
                      animation-iteration-count: infinite;
                      animation-fill-mode: backwards;
                      transition: none;
                    }
        @keyframes wtdNoShowFrames
         {   0% { visibility: visibility; opacity: 1; }
           100% { visibility: hidden;     opacity: 0; }
         }

        .card { color: white; }

        .wtd-img-grayscale
          { filter: grayscale(100%) blur(1px);
            transition: 2s;
          }

        .wtd-img-container
          { position: relative;
          }

        .wtd-img-superpose-milieu
          { position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index:2;
          }

        .wtd-img-superpose-bas-droite
          { position: absolute;
            bottom: 0px;
            right: 0px;
            transform: translate(+50%, 0%);
            z-index:2;
          }

        .wtd-img-superpose-haut-droite
          { position: absolute;
            top: 0px;
            right: 0px;
            transform: translate(+50%, 0%);
            z-index:2;
          }

        .wtd-img-superpose-haut-gauche
          { position: absolute;
            top: 0px;
            left: 0px;
            transform: translate(-50%, 0%);
            z-index:2;
          }

        .wtd-menu
          { border-radius: 20%;
            max-width: 48px;
            max-height: 48px;
            cursor: pointer;
          }

        .wtd-synoptique { border-radius: 20%;
                          width: 128px;
                          height: auto;
                          cursor: pointer;
                        }

        .wtd-visuel { /*border-radius: 20%;*/
                      width: 128px;
                      height: auto;
                      max-height: 128px;
                      cursor: pointer;
                    }

        .wtd-courbe { background-color: #777;
                      width: auto;
                      max-width: 100vw;
                      min-height: 30vh;
                      max-height: 70vh;
                      cursor: pointer;
                    }

        .wtd-vignette
          { width: 32px;
            height: 32px;
          }

        @media (max-width: 768px)
         { .wtd-synoptique
            { width: 96px;
              max-height: 96px;
            }
           .wtd-vignette
            { max-width: 24px;
              max-height: 24px;
            }
           .wtd-menu
             { max-width: 48px;
               max-height: 48px;
             }
           .wtd-visuel
             { max-width: 96px;
               max-height: 96px;
             }
           .wtd-courbe
             {
             }
         }

        .wtd-img-card { object-fit: contain; height: 196px; max-width: 196px; padding: 10px; }

        input:focus { outline: 0 0 0 0  !important;
                      box-shadow: 0 0 0 0 !important;
                    }


        .navbar { background-color: rgba(30,28,56,0.95);
                }

        .nav-link {
                  }

        .nav-link:hover { color: white !important;
                          background-color: #48BBC0;
                        }
      </style>
      <script>
        var $ABLS_API      = "<?php echo getenv("ABLS_API"); ?>";
        var $IDP_REALM     = "<?php echo getenv("IDP_REALM"); ?>";
        var $IDP_URL       = "<?php echo getenv("IDP_URL"); ?>";
        var $IDP_CLIENT_ID = "<?php echo getenv("IDP_CLIENT_ID"); ?>";
      </script>
    </head>

    <body class="bg-dark" style="display:none">

<div class="position-fixed" style="top: 3rem; left: 50%; z-index:9999">
  <div id="idToastStatusOK" data-delay="3000" class="toast hide bg-primary" role="status">
   <div class="toast-header">
     <strong class="me-auto"> Résultat de la commande</strong>
     <!--<small>11 mins ago</small>-->
     <button type="button" class="ml-2 mb-1 close" data-bs-dismiss="toast" aria-label="Close">
       <span aria-hidden="true">&times;</span>
     </button>
   </div>
   <div class="toast-body text-light">
     <i class="fas fa-check-circle"></i> <span id="idToastStatusOKLabel">Succès !</span>
   </div>
  </div>
</div>

<div class="position-fixed" style="top: 3rem; left: 50%; z-index:9999">
  <div id="idToastStatusKO" data-delay="3000" class="toast hide bg-danger" role="status">
   <div class="toast-header">
     <strong class="me-auto"> Résultat de la commande</strong>
     <!--<small>11 mins ago</small>-->
     <button type="button" class="ml-2 mb-1 close" data-bs-dismiss="toast" aria-label="Close">
       <span aria-hidden="true">&times;</span>
     </button>
   </div>
   <div class="toast-body text-dark">
     <i class="fas fa-check-circle"></i> <span id="idToastStatusKOLabel">Erreur !</span>
   </div>
  </div>
</div>


<div id="idModalDel" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content ">
      <div class="modal-header bg-danger text-white">
        <h5 class="modal-title text-justify"><i class="fas fa-trash"></i> <span id="idModalDelTitre"></span></h5>
        <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p id="idModalDelMessage"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times"></i> Annuler</button>
        <button id="idModalDelValider" type="button" class="btn btn-danger" data-bs-dismiss="modal"><i class="fas fa-trash"></i> Valider</button>
      </div>
    </div>
  </div>
</div>

<div id="idModalError" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header bg-warning">
        <h5 class="modal-title text-justify"><i class="fas fa-exclamation-circle"></i>Erreur</h5>
        <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p id="idModalDetail">Une erreur est survenue !</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<header>

 <nav class="navbar navbar-dark navbar-expand-md fixed-top shadow"> <!-- fixed-top -->

  <ul class="navbar-nav">
    <a class="nav-item" href="#">
      <img id ="idNavImgTopSyn" src="" alt=""
           class="wtd-menu" data-bs-toggle='tooltip' data-placement='bottom' title="Aller à l'accueil">
    </a>
  </ul>
  <ul id="idNavSynoptique" class="navbar-nav d-inline me-auto"></ul>

  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-toggled" aria-controls="navbar-toggled" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbar-toggled">
    <ul class="navbar-nav ms-auto">
      <a id="idAlertConnexionLost" class="nav-link wtd-cligno" style="display: none"><i class="fa-solid fa-link-slash fa-xl text-warning"></i></a>
      <li class="nav-item dropdown">
        <a class="nav-link rounded align-items-middle dropdown-toggle" href="#" id="navbarUSER" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fas fa-user text-white"></i> <span id="idUsername">-</span>
        </a>

        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarUSER">
          <a class="dropdown-item" href="/domains"> <i class="fas fa-globe text-primary"></i> Mes domaines</a>
          <a class="dropdown-item" href="/messages"> <i class="fas fa-book text-primary"></i> Fil de l'eau</a>
          <a class="dropdown-item" href="/historique"> <i class="fas fa-history text-primary"></i> Historique</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="/home/user" id="idHrefUsername" href="#"><i class="fas fa-user text-info"></i> Mon Profil</a>
          <a class="dropdown-item" href="<?php echo getenv("IDP_URL"); ?>/realms/<?php echo getenv("IDP_REALM");?>/account/"><i class="fas fa-user text-info"></i> Mon Compte</a>
          <a class="dropdown-item" href="#" onclick="Logout()"><i class="fas fa-sign-out-alt text-danger"></i> <span>Sortir</span> </a>
        </div>
      </li>
    </ul>
  </div>

</nav>
</header>
<?php if ( getenv("CI_ENVIRONMENT") == "development" ) { echo "<div class='alert alert-warning'>Instance de DEV</div>"; } ?>
<div id="idDomainNotification" class='alert alert-info m-1' style="display:none" role="status"></div>
