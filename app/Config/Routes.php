<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('/domains',        'Home::domains');
$routes->get('/messages',       'Home::messages');
$routes->get('/historique',     'Home::historique');
$routes->get('/test',           'Home::test');
$routes->get('(:any)',          'Home::default');
