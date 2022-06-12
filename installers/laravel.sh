#!/bin/bash         
root=$(find /var/www/$NAMESPACE/current -type d | head -n 1)
laravel_version="9.1.9"
randomNumber=laravel_tmp_$((1 + $RANDOM % 10 * $RANDOM ))

mkdir -p /tmp/$randomNumber/ && \
wget https://github.com/laravel/laravel/archive/refs/tags/v$laravel_version.zip -O /tmp/$randomNumber/laravel.zip && \
unzip /tmp/$randomNumber/laravel.zip -d /tmp/$randomNumber && \
cp -rv /tmp/$randomNumber/laravel-9.1.9/. $root && \
rm -rf /tmp/$randomNumber && \
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
sed -i "s/DB_HOST=127.0.0.1/DB_HOST=$DB_HOST/" $root/.env && \
sed -i "s/DB_DATABASE=laravel/DB_DATABASE=$DB_DATABASE/" $root/.env && \
sed -i "s/DB_USERNAME=root/DB_USERNAME=$DB_USERNAME/" $root/.env && \
sed -i "s/DB_PASSWORD=/DB_PASSWORD=$DB_PASSWORD/" $root/.env && \
sed -i "s/APP_URL=http:\/\/localhost/APP_URL=$APP_URL/" $root/.env && \
php artisan key:generate && \
php artisan cache:clear && \
php artisan storage:link && \
php artisan telescope:install && \
php artisan migrate && \
php artisan telescope:publish && \
php artisan vendor:publish --provider="Barryvdh\Debugbar\ServiceProvider"