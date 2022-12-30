/********************************************* Affichage des vignettes ********************************************************/
 function Msg_acquitter ( histo_msg_id )
  { selection = $('#idTableMessages').DataTable().row("#"+histo_msg_id).data();
    var json_request =
       { histo_msg_id : selection.histo_msg_id,
         tech_id      : selection.tech_id,
         acronyme     : selection.acronyme,
       };
    Send_to_API ( 'POST', "/histo/acquit", json_request, function ()
     { $('#idTableMessages').DataTable().ajax.reload( null, false );
     }, null);
  }
/********************************************* Clic sur visuel ****************************************************************/
 function Envoyer_clic_visuel ( tech_id, acronyme )
  { console.log ("Envoyer_clic_visuel: "+tech_id+":"+acronyme );
    var json_request = JSON.stringify(
       { tech_id  : tech_id,
         acronyme : acronyme,
       }
     );
    Send_to_API ( 'POST', "/api/syn/clic", json_request, null, null );
  }
/*----------------------------------------------------------------------------------------------------------------------------*/