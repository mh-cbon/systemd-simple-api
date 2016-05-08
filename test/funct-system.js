var should = require('should');
var fs = require('fs');
var SystemdSimpleApi = require('../index.js');

describe('systemd-simple-api rootland', function() {
  var sds = new SystemdSimpleApi();

  this.timeout(5000);

  sds.enableElevation('');

  it('should install the fakesys service', function(done) {
    var service = {
      install: [],
      unit: [
        {
          name: 'Description',
          value: 'fakesys service'
        }
      ],
      service: [
        {
          name: 'ExecStart',
          value: '/bin/sh -c "' + process.argv[0] + ' /vagrant/utils/fake-service.js"'
        }
      ]
    }
    sds.install({id: 'fakesys', properties: service}, function (err) {
      err && console.error(err);
      (!err).should.eql(true);
      fs.access('/etc/systemd/system/fakesys.service', fs.R_OK, function (err) {
        err && console.error(err);
        (!err).should.eql(true);
        done();
      })
    })
  });

  it('should reload systemd', function(done) {
    sds.refresh(done)
  });

  it('should list the fakesys service unit file', function(done) {
    sds.listUnitFiles({}, function (err, list) {
      err && console.error(err);
      ('fakesys' in list).should.eql(true);
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
      ('fakesys' in list).should.eql(true);
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

  it('should uninstall the fakesys service', function(done) {
    sds.uninstall({id: 'fakesys'}, done)
  });

  it('should reload systemd', function(done) {
    sds.refresh(done)
  });
});
