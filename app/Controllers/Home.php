<?php

namespace App\Controllers;

class Home extends BaseController
{

 public function send_page ( $page )
  { echo view('header');
	   echo view($page);
	   echo view('footer');
  }

 public function index()        { $this->send_page ("index"); }
 public function test()         { $this->send_page ("test"); }
 public function domains()      { $this->send_page ("domains"); }
 public function messages()     { $this->send_page ("messages"); }
 public function historique()   { $this->send_page ("historique"); }
 public function tableau()      { $this->send_page ("tableau"); }
}
