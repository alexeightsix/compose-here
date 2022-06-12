FROM php:8.1-fpm-buster as php-base

# Update OS, Install Packages and cleanup
RUN apt-get update && \
    apt-get install -y --no-install-recommends \ 
    openssl \
    git \
    libxml2-dev \
    zip \
    unzip \
    zlib1g-dev \
    libzip-dev \
    libicu-dev g++ \
    libpng-dev \ 
    libxml2-dev \
    htop \
    telnet \ 
    vim \
    dos2unix \
    openssh-client \
    wget && \
    rm -rf /var/lib/apt/lists/* 

# Common PHP Extensions
RUN docker-php-ext-install bcmath && \
    docker-php-ext-install pdo_mysql && \
    docker-php-ext-install gd && \
    docker-php-ext-install soap && \
    docker-php-ext-configure zip && \
    docker-php-ext-install zip

# Setup User
RUN groupadd -g 1000 centos && \
    useradd -s /bin/bash -r -u 1000 -g centos centos && \
    groupadd -g 1001 www && \
    useradd -r -u 1001 -g www www && \
    mkdir -p /home/centos/ && \
    touch /root/bash_history /home/centos/.bash_history && \ 
    chown -R centos:centos /home/centos/

## PHP-FPM Healthcheck
RUN wget -O /usr/local/bin/php-fpm-healthcheck \
    https://raw.githubusercontent.com/renatomefi/php-fpm-healthcheck/master/php-fpm-healthcheck \
    && chmod +x /usr/local/bin/php-fpm-healthcheck \ 
    && printf "[www]\npm.status_path = /status" > /usr/local/etc/php-fpm.d/php-fpm-status-path.conf

# SSH2
RUN apt-get update -y && \
    apt-get install libssh2-1 libssh2-1-dev -y && \
    cd /tmp && git clone https://github.com/php/pecl-networking-ssh2 && cd /tmp/pecl-networking-ssh2 \
    && phpize && ./configure && make && make install \
    && echo "extension=ssh2.so" > /usr/local/etc/php/conf.d/ext-ssh2.ini \
    && rm -rf /tmp/ssh2 && \
    rm -rf /var/lib/apt/lists/* 

## Install Composer
RUN curl -sS https://getcomposer.org/installer -o composer-setup.php \ 
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
    mkdir -p /home/centos/.composer && \
    mkdir /home/centos/.cache

## Node 
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash \
    && apt-get install -y nodejs && \
    mkdir /home/centos/.npm  && \
    mkdir /home/centos/.node && \
    chown -R centos:centos /home/centos && \
    echo 'prefix = ~/.node' | tee /home/centos/.npmrc && \
    echo 'PATH="$HOME/.node/bin:$PATH" \
    NODE_PATH="$HOME/.node/lib/node_modules:$NODE_PATH" \
    MANPATH="$HOME/.node/share/man:$MANPATH"' | tee /home/centos/.profile

## Cleanup
RUN apt-get autoremove -y && \ 
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/* \ 
    && rm -rf /tmp/pear

## CUSTOM INIT
COPY init.sh /root/

WORKDIR /var/www/${config.namespace}/current

FROM php-base as php-dev

RUN apt-get update -y && \
    pecl install xdebug && \ 
    docker-php-ext-enable xdebug

RUN apt-get install zsh -y && \ 
    chown -R centos:centos /home/centos/

USER centos

RUN cd ~ && \ 
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

USER root

RUN usermod --shell $(which zsh) centos

## Cleanup
RUN apt-get autoremove -y && \ 
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/* \ 
    && rm -rf /tmp/pear