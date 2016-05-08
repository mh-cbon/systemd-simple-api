var should = require('should');
var fs = require('fs');
var SystemdSimpleApi = require('../index.js');

describe('systemd-simple-api userland', function() {
  var sds = new SystemdSimpleApi();
  it('should install the fake service', function(done) {
    var service = {
      install: [],
      unit: [
        {
          name: 'Description',
          value: 'fake service'
        }
      ],
      service: [
        {
          name: 'ExecStart',
          value: '/bin/sh -c "' + process.argv[0] + ' /vagrant/utils/fake-service.js"'
        }
      ]
    }
    sds.install({user: true, id: 'fake', properties: service}, done)
  });

  it('should list the fake service unit file', function(done) {
    sds.listUnitFiles({user: true}, function (err, list) {
      ('fake' in list).should.eql(true);
      list['fake'].id.should.eql('fake');
      done(err);
    })
  });

  it('should start the fake service', function(done) {
    sds.start('fake', {user: true}, function (err) {
      setTimeout(function(){
        done(err);
      }, 500); // this is needed for the system to load and start the program.
    })
  });

  it('should list the fake service', function(done) {
    sds.list({user: true, type: 'service', all: true}, function (err, list) {
      ('fake' in list).should.eql(true);
      list['fake'].description.should.eql('fake service');
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

  it('should stop the fake service', function(done) {
    sds.stop('fake', {user: true}, done)
  });
});
