vagrant up fedora
vagrant ssh fedora -c "sh /vagrant/run-tests.sh"
vagrant halt fedora
