#!/bin/sh
rm -rf vendor; composer update
cp -r ./vendor/codeigniter4/framework/app/Config/* app/Config/
cp -r ./vendor/codeigniter4/framework/app/Views/errors/* app/Views/errors/
cp ./vendor/codeigniter4/framework/public/index.php public/
git add app/Config/*
