if [ ! -f /home/vagrant/node/node-v5.9.1-linux-x64.tar.xz ]; then
  sudo dnf install wget -y
  mkdir -p /home/vagrant/node
  cd /home/vagrant/node/
  wget https://nodejs.org/dist/v5.9.1/node-v5.9.1-linux-x64.tar.xz
  tar -xvf node-v5.9.1-linux-x64.tar.xz
  /home/vagrant/node/node-v5.9.1-linux-x64/bin/npm i mocha -g
fi
cd /vagrant/
/home/vagrant/node/node-v5.9.1-linux-x64/bin/npm i
/home/vagrant/node/node-v5.9.1-linux-x64/bin/node /home/vagrant/node/node-v5.9.1-linux-x64/bin/mocha test/index.js
/home/vagrant/node/node-v5.9.1-linux-x64/bin/node /home/vagrant/node/node-v5.9.1-linux-x64/bin/mocha test/funct-user.js
sudo /home/vagrant/node/node-v5.9.1-linux-x64/bin/node /home/vagrant/node/node-v5.9.1-linux-x64/bin/mocha test/funct-system.js
SUDOPWD='' /home/vagrant/node/node-v5.9.1-linux-x64/bin/node /home/vagrant/node/node-v5.9.1-linux-x64/bin/mocha test/funct-system.js
