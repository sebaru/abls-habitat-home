<?php

namespace App\Controllers;

class Home extends BaseController
{

 public function send_page ( $page )
  { echo view('header');
	   echo view($page);
	   echo view('footer');
  }

 public function default()
  { $this->send_page ("index"); }
    /*return redirect()->to(base_url("/home"));*/

 public function index()        { $this->send_page ("index"); }
}
