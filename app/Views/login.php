<!doctype html>
<html lang="fr">
    <head>
        <meta charset="utf-8">
        <title>Chez Moi !</title>

        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="google" content="notranslate">
        <meta name="robots" content="noindex, nofollow">
        <link rel="icon" href="https://static.abls-habitat.fr/img/abls.svg">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
        <script src="https://kit.fontawesome.com/1ca1f7ba56.js" crossorigin="anonymous"></script>
        <style>
        html,body { background-image: url('https://static.abls-habitat.fr/img/fond_login.jpg');
                    background-size: cover;
                    background-repeat: no-repeat;
                    height: 100%;
                    /*background-color: rgba(30,28,56,1.0)*/
                  }

        .container { height: 100%;
                   }

        .card { margin-top: auto;
                margin-bottom: auto;
                background-color: rgba(30,28,56,0.5) !important;
                border-radius: 5px;
                width:22em;
              }

        .wtd_title { color: white; }

        .card-link { color: white; }
        .input-group-prepend span { width: 50px;
                                    background-color: #F1E413;
                                    color: black;
                                    border:0 !important;
                                  }

        input:focus { outline: 0 0 0 0  !important;
                      box-shadow: 0 0 0 0 !important;
                    }

        .abls_logo { width: 64px; }

        .wtd_login_btn { color: white;
                         background-color: #1E1C38;
                         width: 100px;
                       }

        .wtd_login_btn:hover { color: white;
                               background-color: #48BBC0;
                             }

      </style>
      <script> var $ABLS_API = "<?php echo getenv("ABLS_API"); ?>"; </script>
    </head>
    <body class="">

<div id="idLoginContainer" style="display: none" class="container">
	<div class="d-flex justify-content-center h-100">
		<div class="card">
			<div class="card-header">
     <?php if ( getenv("CI_ENVIRONMENT") == "development" ) { echo "<div class='alert alert-warning'>Instance de DEV</div>"; } ?>
     <div class="row">
       <img class="col-4 abls_logo" src="https://static.abls-habitat.fr/img/abls.svg" alt="ABLS Logo">
       <h4 class="col-8 align-self-center text-center wtd_title">Console ABLS</h4>
     </div>
			</div>
			<div class="card-body">

     <div class="text-center"><label id="idLabel" class="text-white">Entrez vos authentifiants</label></div>

					<div class="input-group form-group">
						<div class="input-group-prepend">
							<span class="input-group-text"><i class="fas fa-desktop"></i></span>
						</div>
						<input id="appareil" name="appareil" type="text" class="form-control" placeholder="Device Name">
					</div>

					<div class="input-group form-group">
						<div class="input-group-prepend">
							<span class="input-group-text"><i class="fas fa-user"></i></span>
						</div>
						<input id="login" name="login" type="text" class="form-control" placeholder="Username or Email">
					</div>

					<div class="input-group form-group">
						<div class="input-group-prepend">
							<span class="input-group-text"><i class="fas fa-key"></i></span>
						</div>
						<input id="password" name="password" type="password" class="form-control" placeholder="My password">
					</div>

					<div class="form-group">
						<button onclick="Send_credential()" class="btn float-right btn-primary">Entrer</button>
					</div>
			</div>
			<div class="card-footer">
				<div class="d-flex justify-content-center">
					<a class="card-link" href="https://docs.abls-habitat.fr"><i class="fas fa-info-circle"></i> Go to ABLS Docs !</a>
				</div>
			</div>
		</div>
	</div>
</div>

<!--
<div id="idLoadingContainer" style="display: none" class="container">
	<div class="d-flex justify-content-center h-100">
	    <div class="row loading justify-content-center ">
       <div class="col m-3 align-self-center spinner-border text-warning"></div>
     </div>
 </div>
</div>
-->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js" integrity="sha384-+YQ4JLhjyBLPDQt//I+STsc9iw4uQqACwlvpslubQzn4u2UU2UFM80nGisd026JF" crossorigin="anonymous"></script>
    <script src="https://idp.abls-habitat.fr/js/keycloak.js"></script>
    <script src="/js/login.js" type="text/javascript"></script>
    <script src="/js/common.js" type="text/javascript"></script>
  </body>
</html>
