# Compose Here

Compose Here is a simple application that dynamically generates a Docker based development environment. It will also optionally install the **Laravel Framework**. The default stack includes **PHP**, **NGNIX**, **MySQL**, **Adminer** and **Mailcatcher**.

After the installation has completed you will then able to edit the generated docker-compose.yml as needed.

# System Requirements
 - Node
 - Npm
 - Docker
 - Docker-compose
 - Linux Based Environment

# Package Installation
    git clone https://github.com/alexeightsix/compose-here.git
    cd compose-here
    npm install 
    sudo ln -s $(pwd)/compose-here /usr/bin/compose-here

# Usage
Create your project destination path if it doesn't already exists as the package won't install one for you.

    mkdir ~/foo

Navigate to your projects destination path. 

    cd ~/foo

Execute Command

    compose-here

The installer will then ask you a series of questions before it proceeds the installation:

    ✔ Project Namespace? … foo
    ✔ Project root? /home/alex/foo … yes
    ✔ App URL? … http://foo.local
    ✔ What port do you want to assign adminer: … 3000
    ✔ What port do you want to assign mailcatcher: … 3001
    ✔ What port do you want to assign nginx: … 3080
    ✔ Install Laravel?: … yes
    

If the desired port for each container is already in use you will be prompted to enter a different one.

Upon completion of the installer you should now see your projects docker containers running by typing docker-container ls:

    d9001616886a   adminer:latest           "entrypoint.sh docke…"   5 minutes ago    Up 5 minutes    0.0.0.0:3000->8080/tcp, :::3000->8080/tcp             foo-adminer
    76dc7fa70c60   foo_foo-nginx            "nginx -g 'daemon of…"   5 minutes ago    Up 5 minutes    0.0.0.0:3080->80/tcp, :::3080->80/tcp                 foo-nginx
    287f72c00fab   mariadb:latest           "docker-entrypoint.s…"   5 minutes ago    Up 5 minutes    3306/tcp, 33060/tcp                                   foo-mysql
    5d7c0c521a6d   foo_foo-php              "docker-php-entrypoi…"   5 minutes ago    Up 5 minutes    9000/tcp                                              foo-php
    aae2c082d636   schickling/mailcatcher   "mailcatcher --no-qu…"   5 minutes ago    Up 5 minutes    1025/tcp, 0.0.0.0:3001->1080/tcp, :::3001->1080/tcp   foo-mailcatcher

Using the above as an example, you would then be able to access your applications public endpoints by going to the following URLs:

- Nginx - http://foo.local:5080
- Adminer - http://foo.local:5081
- Mailcatcher - http://foo.local:5082

The script is only meant to be generated a single time. Feel free to now modify the docker-compose.yml as desired.

# Troubleshooting

Feel free to submit a issue if you encounter any.

# Contributing  To The Project

Feel free to submit a PR if you encounter a bug or want to contribute a new feature.
