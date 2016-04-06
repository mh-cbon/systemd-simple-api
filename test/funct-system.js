var should = require('should');
var fs = require('fs');
var SystemdSimpleApi = require('../index.js');

describe('systemd-simple-api rootland', function() {
  var sds = new SystemdSimpleApi();
  it('should install the fakesys service', function(done) {
    var service = {
      install:{},
      unit: {
        Description: "fakesys service"
      },
      service: {
        ExecStart: '/bin/sh -c "/home/vagrant/node/node-v5.9.1-linux-x64/bin/node /vagrant/utils/fake-service.js"'
      }
    }
    sds.install({id: 'fakesys', properties: service}, done)
  });

  it('should list the fakesys service unit file', function(done) {
    sds.listUnitFiles({}, function (err, list) {
      ('fakesys' in list).should.be.true;
      list['fakesys'].id.should.eql('fakesys');
      done(err);
    })
  });

  it('should start the fakesys service', function(done) {
    sds.start('fakesys', {}, function (err) {
      setTimeout(function(){
        done(err);
      }, 500); // this is needed for the system to load and start the program.
    })
  });

  it('should list the fakesys service', function(done) {
    sds.list({type: 'service', all: true}, function (err, list) {
      ('fakesys' in list).should.be.true;
      list['fakesys'].description.should.eql('fakesys service');
      done(err);
    })
  });

  it('should be able to consume the service', function(done) {
    var net = require('net');
    var client = net.connect({port: 8080});
    var d;
    client.on('data', (data) => {
      d = data.toString()
    });
    client.on('end', () => {
      d.should.match(/goodbye/)
      done();
    });
    client.on('error', done);
  });

  it('should stop the fakesys service', function(done) {
    sds.stop('fakesys', {}, done)
  });
});
