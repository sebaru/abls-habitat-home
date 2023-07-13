<main role="main" class="container-fluid">


 <div class="row m-2">
   <div class="col-auto"><h3><i class="fas fa-chart-line text-primary"></i> Voir la courbe</h3></div>

   <div class ="ml-auto btn-group align-items-center">
     <i class='fas fa-clock text-primary mr-2'></i>
     <select id='idTableauPeriod' class='custom-select'>
      <option value='HOUR'>Heure</option>
      <option value='DAY'>Jour</option>
      <option value='WEEK'>Semaine</option>
      <option value='MONTH'>Mois</option>
      <option value='YEAR'>Année</option>
      <option value='ALL'>Tout</option>
     </select>
   </div>

 </div>

  <div class="row m-1 justify-content-center">
     <canvas id="idTableauCanvas" class="col wtd-courbe-full-screen"></canvas>
  </div>

</main>


<script src="/js/tableau.js" type="text/javascript"></script>
