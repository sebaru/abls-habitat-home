/******************************************************************************************************************************/
/* Inviter_open: Ouvre le modal d'invitation                                                                                  */
/******************************************************************************************************************************/
 function Inviter_open ()
  { $("#idUserInviteEmail").val("");
    $("#idUserInviteAccessLevel").replaceWith( Select_Access_level( "idUserInviteAccessLevel", null ) );
    $("#idUserInviteValider").off("click").on("click", function ()
     { var json_request = { friend_email: $("#idUserInviteEmail").val(),
                            friend_level: parseInt($("#idUserInviteAccessLevel").val())
                          };
       Send_to_API ( "POST", "/user/invite", json_request, function()
        { $("#idModalInviter").modal("hide");
          Show_toast_ok ( json_request.friend_email + " a été invité." );
        }, null );
     });
    $("#idModalInviter").modal("show");
  }
/*----------------------------------------------------------------------------------------------------------------------------*/
