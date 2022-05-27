# Abls-Habitat Project

Abls-Habitat is my own project to do home automation. it presents:

* one or more [Agents](https://github.com/sebaru/abls-habitat-agent), in house, to interact with sensors and outputs
* one [API](https://github.com/sebaru/abls-habitat-api) on SaaS, main process of project, to handle all of agents
* one [Console](https://github.com/sebaru/abls-habitat-home) to configure each element and develop [D.L.S module](https://docs.abls-habitat.fr/)
* one [Home](https://github/com/sebaru/abls-habitat-home) frontend for all users

This software is Work In Progress. It is a complete refund of all-in-one Watchdog Project.
I'm developing on my sparse-time, not so easy with little kid :-).

All detailed documentations [are here](https://docs.abls-habitat.fr)
Have a good day, Sebaru.

## What is Abls-Habitat HOME

This component is the frontend of my project.

## Installation with apache Httpd

Make sure apache, php and composer packages are installed. Then follow these command lines:

    # mkdir /var/www/html/abls-home
    # cd /var/www/html/abls-home
    # git clone https://github.com/sebaru/abls-habitat-home.git .
    # composer update

Create Let's Encrypt certificate for your domain and adapt domain and certificate names in httpd-abls-home.conf.sample. And finally do:

    # cp httpd-abls-home.conf.sample /etc/httpd/conf.d/httpd-abls-home.conf
    # systemctl restart httpd

## Upgrade

When upgrading, follow these command lines:

    # git pull /var/www/html/abls-home

## Setup

Edit /var/www/html/abls-home/public/js/config.json and change:

* the `api_url` to your own API Instance
* the `idp_url` to your own OpenID IDP Instance
