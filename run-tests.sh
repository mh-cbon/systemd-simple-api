if [ ! -f /home/vagrant/node/node-v6.1.0-linux-x64.tar.xz ]; then
  sudo dnf install wget -y
  mkdir -p /home/vagrant/node
  cd /home/vagrant/node/
  wget https://nodejs.org/dist/v6.1.0/node-v6.1.0-linux-x64.tar.xz
  tar -xvf node-v6.1.0-linux-x64.tar.xz
  /home/vagrant/node/node-v6.1.0-linux-x64/bin/node /home/vagrant/node/node-v6.1.0-linux-x64/bin/npm i mocha -g
fi
cd /vagrant/
rm -fr node_modules/
/home/vagrant/node/node-v6.1.0-linux-x64/bin/node /home/vagrant/node/node-v6.1.0-linux-x64/bin/npm i
/home/vagrant/node/node-v6.1.0-linux-x64/bin/node /home/vagrant/node/node-v6.1.0-linux-x64/bin/mocha test/index.js
/home/vagrant/node/node-v6.1.0-linux-x64/bin/node /home/vagrant/node/node-v6.1.0-linux-x64/bin/mocha test/funct-user.js
DEBUG=* sudo /home/vagrant/node/node-v6.1.0-linux-x64/bin/node /home/vagrant/node/node-v6.1.0-linux-x64/bin/mocha test/funct-system.js
yasudo='' /home/vagrant/node/node-v6.1.0-linux-x64/bin/node /home/vagrant/node/node-v6.1.0-linux-x64/bin/mocha test/funct-system.js
