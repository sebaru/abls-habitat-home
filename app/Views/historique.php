<div class="container">

       <div class="card m-1 shadow bg-dark">
         <div class="card-header"> <i class="fas fa-history text-primary"></i> <label>Recherche dans l'historique</label> </div>
         <div class="card-body">

           <div class="row ">
             <div class="input-group mb-1">
               <label class="col-4 col-form-label text-right">Recherche</label>
               <input id="idHistoSearchQuery" type="text" class="form-control" placeholder="Recherche a effectuer">
              <button id="idHistoSearch" type="button" class="btn btn-primary ml-1">
                <i class="fas fa-search"></i> Rechercher
              </button>
             </div>
           </div>

         </div>
       </div>

<hr>

   <div class="table-responsive">
     <table id="idTableHISTOS" class='table table-dark table-bordered w-100'>
       <thead class="table-dark">
       </thead>
       <tbody>
       </tbody>
     </table>
   </div>

<!-- Container -->
</div>

<script src="/js/historique.js" type="text/javascript"></script>
