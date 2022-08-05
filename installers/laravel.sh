#!/bin/bash         
root="/var/www/${NAMESPACE}"

mv $root/current/docker-compose.yml /root/ 

rm -rf $root/current/*
rm -rf $root/current/.*

git clone --branch "9.x" https://github.com/laravel/laravel.git $root/current && \

root=$root/current 

rm -rf $root/current/.git

cd $root && \
composer install && \
composer require laravel/telescope --dev && \
composer require barryvdh/laravel-debugbar --dev && \

npm install --loglevel verbose && \

cp $root/.env.example $root/.env && \

chown -R centos:centos $root && \
usermod -a -G centos www-data && \
find $root -type f -exec chmod 644 {} \; && \
find $root -type d -exec chmod 755 {} \; && \
chown -R centos:www-data . && \
find . -type f -exec chmod 664 {} \; && \
find . -type d -exec chmod 775 {} \; && \
chgrp -R www-data storage bootstrap/cache && \
chmod -R ug+rwx storage bootstrap/cache && \

sed -i "s/DB_HOST=\S*/DB_HOST=$DB_HOST/" $root/.env && \
sed -i "s/DB_DATABASE=\S*/DB_DATABASE=$DB_DATABASE/" $root/.env && \
sed -i "s/DB_USERNAME=\S*/DB_USERNAME=$DB_USERNAME/" $root/.env && \
sed -i "s/DB_PASSWORD=\S*/DB_PASSWORD=$DB_PASSWORD/" $root/.env && \
sed -i 's/APP_URL=\S*/APP_URL=$APP_URL/' $root/.env && \

php artisan key:generate && \
php artisan cache:clear && \
php artisan storage:link && \
php artisan telescope:install && \
php artisan migrate && \
php artisan telescope:publish && \
php artisan vendor:publish --provider="Barryvdh\Debugbar\ServiceProvider"

mv /root/docker-compose.yml $root/docker-compose.yml