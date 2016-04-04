# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

    config.vm.define "fedora" do |fedora|
      fedora.vm.box = "fedora/23-cloud-base"
      fedora.vm.hostname = "fedora.vagrant.dev"
      fedora.vm.network "private_network", type: :dhcp
      config.vm.synced_folder ".", "/vagrant", type: "rsync", rsync__auto: true
    end

end
