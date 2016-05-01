# systemd-simple-api

Simple api for node to interface with systemd bin.

# Install

```
npm i @mh-cbon/systemd-simple-api --save
```


# Usage

```js
var SystemdSimpleApi = require('@mh-cbon/systemd-simple-api');
var sds = new SystemdSimpleApi(/* version */);

// systemctl --user -t service --all
sds.list(opts={user: true, t: 'service', all: true}, function (err, items) {
  console.log(items);
})

// systemctl -t timers
sds.list(opts={t: 'timers'}, function (err, items) {
  console.log(items);
})

// systemctl list-unit-files --user
sds.listUnitFiles(opts={user: true}, function (err, items) {
  console.log(items);
})

// systemctl show serviceId --user
sds.describe('serviceId', opts={user: true}, function (err, info) {
  console.log(info);
})

// systemctl start serviceId --user
sds.start('serviceId', opts={user: true}, function (err) {
  console.log(err);
})

// systemctl stop serviceId --user
sds.stop('serviceId', opts={user: true}, function (err) {
  console.log(err);
})

// systemctl reload serviceId --user
sds.reload(opts={user: true}, function (err) {
  console.log(err);
})

// systemctl reload-or-restart serviceId --user
sds.reloadOrRestart(opts={user: true}, function (err) {
  console.log(err);
})

// systemctl daemon-reload
sds.refresh(function () {
  console.log('systemd is refreshed')
})

```

## Install a service

```js
// per user
var service = {
  install:{},
  unit: {
    Description: "your service"
  },
  service: {
    ExecStart: '/bin/sh ...'
  }
}
sds.install({user: true, id: 'fake', properties: service}, done)

// system wide
var service = {
  install:{},
  unit: {
    Description: "your service"
  },
  service: {
    ExecStart: '/bin/sh ...'
  }
}
sds.install({user: !true, id: 'fake', properties: service}, done)


// later...
sds.uninstall({user: !true, id: 'fake', properties: service}, done)
```

## Run the tests

- install vagrant
- run `npm run test-fedora`

# Read more

- https://coreos.com/os/docs/latest/using-environment-variables-in-systemd-units.html
- https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files
- https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units
- https://www.freedesktop.org/software/systemd/man/systemd.unit.html#id-1.7.4
- https://www.freedesktop.org/software/systemd/man/systemd.service.html#
- https://www.freedesktop.org/software/systemd/man/systemd.exec.html#
- https://www.freedesktop.org/software/systemd/man/systemd.kill.html#
- https://fedoraproject.org/wiki/SysVinit_to_Systemd_Cheatsheet
