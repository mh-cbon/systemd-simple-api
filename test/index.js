var should = require('should');
var fs = require('fs');
var SystemdSimpleApi = require('../index.js');

describe('systemd-simple-api', function() {
  it('lists services', function(done) {
    var sds = new SystemdSimpleApi();
    sds.list({}, function (err, list) {
      (err===null).should.eql(true);
      ('local-fs.target' in list).should.eql(true);
      (list['local-fs.target'].isLoaded).should.eql('loaded');
      (list['local-fs.target'].isActive).should.eql('active');
      (list['local-fs.target'].sub).should.eql('active');
      (list['local-fs.target'].description).should.eql('Local File Systems');
      done();
    })
  });
  it('lists units', function(done) {
    var sds = new SystemdSimpleApi();
    sds.listUnitFiles({}, function (err, list) {
      (err===null).should.eql(true);
      ('dbus' in list).should.eql(true);
      (list['dbus'].id).should.eql('dbus');
      (list['dbus'].state).should.eql('static');
      done();
    })
  });
  it('describes a service', function(done) {
    var sds = new SystemdSimpleApi();
    sds.describe('dbus', {}, function (err, unit) {
      err && console.error(err);
      (err===null).should.eql(true);
      (unit.length).should.not.eql(0);
      (unit[0].name).should.eql('Type');
      (unit[0].value).should.eql('simple');
      done();
    })
  });
  it('installs an unit', function(done) {
    var sds = new SystemdSimpleApi();
    var service = {
      unit: [

      ],
      service: [
        {
          name: 'ExecStart',
          value: 'sh -c "echo hello"'
        },
        {
          name: 'ExecReload',
          value: 'sh -c "echo hello"'
        }
      ]
    }
    sds.install({user: true, id: 'some', properties: service}, function (err) {
      (err===null).should.eql(true);
      fs.access('/home/vagrant/.config/systemd/user/some.service', fs.R_OK, function (err) {
        (err===null).should.eql(true);
        fs.readFile('/home/vagrant/.config/systemd/user/some.service', function (err, content) {
          (err===null).should.eql(true);
          content.toString().should.match(/Unit/)
          content.toString().should.match(/Service/)
          done();
        })
      })
    })
  });

  it('starts a service', function(done) {
    var sds = new SystemdSimpleApi();
    sds.start('some', {}, function (err) {
      (err===null).should.eql(true);
      done();
    })
  });

  it('restarts a service', function(done) {
    var sds = new SystemdSimpleApi();
    sds.start('some', {}, function (err) {
      (err===null).should.eql(true);
      done();
    })
  });

  it('reloads a service', function(done) {
    var sds = new SystemdSimpleApi();
    sds.start('some', {}, function (err) {
      (err===null).should.eql(true);
      done();
    })
  });

  it('reloads-or-restarts a service', function(done) {
    var sds = new SystemdSimpleApi();
    sds.start('some', {}, function (err) {
      (err===null).should.eql(true);
      done();
    })
  });

  it('stops a service', function(done) {
    var sds = new SystemdSimpleApi();
    sds.start('some', {}, function (err) {
      (err===null).should.eql(true);
      done();
    })
  });

});
