FROM alpine:3.15.4

RUN apk update 

RUN apk add \ 
    busybox-extras \
    curl \
    git \
    htop \
    nginx=1.20.2-r1 \
    mlocate \
    ncdu \
    procps \
    openssl \
    vim \
    zip

RUN mkdir -p /etc/nginx/conf.d

RUN addgroup -S centos -g 1000 && \
    adduser -S -u 1000 centos -G centos -g '' && \
    adduser -D -g www www

RUN touch /var/lib/nginx/logs/error.log /var/lib/nginx/logs/access.log

RUN mkdir -p /var/www/${config.namespace}/current
RUN chown -R 1000:1000 /var/www/

RUN chown -R www:www /var/lib/nginx

CMD ["nginx", "-g", "daemon off;"]