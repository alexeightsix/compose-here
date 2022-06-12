chmod -R 0400 /home/centos/.ssh
chown -R centos:centos /home/centos/.ssh/
chmod 700 /home/centos/.ssh/
chmod u+w /home/centos/.ssh/known_hosts

mkdir -p /root/.ssh/
cp -rf /home/centos/.ssh /root/.ssh

chmod -R 0400 /root/.ssh
chown -R root:root /root/.ssh/
chmod 700 /root/.ssh/
chmod u+w /root/.ssh/known_hosts

php-fpm