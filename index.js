
var pkg       = require('./package.json')
var spawn     = require('child_process').spawn;
var yasudo    = require('@mh-cbon/c-yasudo')
var debug     = require('debug')(pkg.name);
var split     = require('split');
var path      = require('path');
var fs        = require('fs-extra');
var sudoFs    = require('@mh-cbon/sudo-fs')
var through2  = require('through2');
var dStream   = require('debug-stream')(debug)


function systemdSimpleApi (version) {

  var elevationEnabled = false;
  var pwd = false;
  this.enableElevation = function (p) {
    if (p===false){
      elevationEnabled = false;
      pwd = false;
      return;
    }
    elevationEnabled = true;
    pwd = p;
  }

  var getFs = function () {
    return elevationEnabled ? sudoFs : fs;
  }

  var spawnAChild = function (bin, args, opts) {
    if (elevationEnabled) {
      opts = opts || {};
      if (pwd) opts.password = pwd;
      return yasudo(bin, args, opts);
    }
    return spawn(bin, args, opts);
  }

  var processListArgs = function (opts) {
    var args = [];
    if (opts.type) args = args.concat(['--type=' + opts.type])
    if (opts.state) args = args.concat(['--state=' + opts.state])
    if (opts.all || opts.a) args = args.concat(['--all'])
    if (opts.ignore_inhibitors || opts.i) args = args.concat(['-i'])
    if (opts.quiet || opts.q) args = args.concat(['-q'])
    if (opts.user || opts.u) args = args.concat(['--user'])
    else if (opts.system || opts.s) args = args.concat(['--system'])
    return args;
  }

  var runSystemCtlList = function (args, results, then) {

    debug("systemctl %s", args.join(' '))

    var c = spawnAChild('systemctl', args, {stdio: 'pipe'});

    c.stdout.on('end', function () {
      if (then) then(null, results);
      then = null;
    })
    c.on('error', function (err) {
      if (then) then(err, results);
      then = null;
    });
    c.stdout.pipe(dStream('process.stdout: %s').resume());
    c.stderr.pipe(dStream('process.stderr: %s').resume());

    return c;
  }

  this.list = function (opts, then) {
    var services = {};

    var args = processListArgs(opts || {});
    args.push('--no-legend')
    args.push('--no-page')

    runSystemCtlList(args, services, then)
    .stdout
    .pipe(split())
    .pipe(through2(function (chunk, enc, callback) {
      var k = chunk.toString().split(/^([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+(.+)/g);
      if (k && k[1]) {
        services[k[1].replace(/\.service/, '')] = {
          id:           k[1].replace(/\.service/, ''),
          isLoaded:     k[2],
          isActive:     k[3],
          sub:          k[4],
          description:  k[5]
        }
      }
      callback(null, chunk)
    }));
  }

  this.listUnitFiles = function (opts, then) {
    var services = {};

    var args = processListArgs(opts || {});
    args.unshift('list-unit-files')
    args.push('--no-legend')
    args.push('--no-page')

    runSystemCtlList(args, services, then)
    .stdout
    .pipe(split())
    .pipe(through2(function (chunk, enc, callback) {
      var k = chunk.toString().split(/^([^\s]+)\s+([^\s]+)\s+/g);
      if (k && k[1]) {
        services[k[1].replace(/\.service/, '')] = {
          id:    k[1].replace(/\.service/, ''),
          state: k[2],
        }
      }
      callback(null, chunk)
    }));
  }

  this.listSockets = function (opts, then) {
    then('not implemented')
  }

  this.listTimers = function (opts, then) {
    then('not implemented')
  }

  this.describe = function (serviceId, opts, then) {
    var properties = [];

    var args = processListArgs(opts || {});
    args.unshift(serviceId)
    args.unshift('show')
    args.push('--no-legend')
    args.push('--no-page')

    runSystemCtlList(args, properties, function (err) {
      if (!err && properties['LoadError'] && properties['LoadError'].match(/fileNotfound/i)) {
        properties = null;
        err = "not found"
      }
      then(err, properties)
    })
    .stdout
    .pipe(split())
    .pipe(through2(function (chunk, enc, callback) {
      var k = chunk.toString().split(/^([^=]+)=(.+)/g);
      k && k[1] && properties.push({
        name: k[1].replace(/\.service/, ''),
        value: k[2]
      })
      callback(null, chunk)
    }));
  }

  this.refresh = function (then) {
    var child = spawnAChild('systemctl', ['daemon-reload'], {stdio: 'pipe'})
    child.on('error', function (err) {
      then && then(err)
      then = null;
    })
    child.on('close', function () {
      then && then();
    })
    child.stdout.pipe(dStream('process.stdout: %s').resume());
    child.stderr.pipe(dStream('process.stderr: %s').resume());
  }


  var processControlArgs = function (opts) {
    var args = [];
    if (opts.quiet || opts.q) args = args.concat(['-q'])
    if (opts.user || opts.u) args = args.concat(['--user'])
    else if (opts.system || opts.s) args = args.concat(['--system'])
    return args;
  }
  var runSystemCtlControls = function (args, then) {

    debug("systemctl %s", args.join(' '))

    var c = spawnAChild('systemctl', args, {stdio: 'pipe'});

    var stdout = '';
    var stderr = '';
    c.stdout.on('data', function (data) {
      stdout += data.toString();
    })
    c.stderr.on('data', function (data) {
      stderr += data.toString();
    })

    c.on('close', function (code) {
      if (then) then(code!==0 ? stdout+stderr : null);
      then = null;
    })
    c.on('error', function (err) {
      if (then) then(err);
      then = null;
    });
    c.stdout.pipe(dStream('process.stdout: %s').resume());
    c.stderr.pipe(dStream('process.stderr: %s').resume());

    return c;
  }
  this.start = function (serviceId, opts, then) {
    return runSystemCtlControls(
      [].concat(['start', serviceId], processControlArgs(opts)),
      then
    )
  }
  this.stop = function (serviceId, opts, then) {
    return runSystemCtlControls(
      [].concat(['stop', serviceId], processControlArgs(opts)),
      then
    )
  }
  this.restart = function (serviceId, opts, then) {
    return runSystemCtlControls(
      [].concat(['restart', serviceId], processControlArgs(opts)),
      then
    )
  }
  this.reload = function (serviceId, opts, then) {
    return runSystemCtlControls(
      [].concat(['reload', serviceId], processControlArgs(opts)),
      then
    )
  }
  this.enable = function (serviceId, opts, then) {
    return runSystemCtlControls(
      [].concat(['enable', serviceId], processControlArgs(opts)),
      then
    )
  }
  this.disable = function (serviceId, opts, then) {
    return runSystemCtlControls(
      [].concat(['disable', serviceId], processControlArgs(opts)),
      then
    )
  }
  this.reloadOrRestart = function (serviceId, opts, then) {
    return runSystemCtlControls(
      [].concat(['reload-or-restart', serviceId], processControlArgs(opts)),
      then
    )
  }
  this.status = function (serviceId, opts, then) {
    then('not implemented')
  }

  var generateUnitContent = function (properties) {
    var content = '';
    if (properties.install) {
      content += '\n[Install]\n'
      properties.install.forEach(function (prop) {
        content += prop.name + '=' + prop.value + '\n'
      })
      content += '\n'
    }
    if (properties.unit) {
      content += '\n[Unit]\n'
      properties.unit.forEach(function (prop) {
        content += prop.name + '=' + prop.value + '\n'
      })
      content += '\n'
    }
    if (properties.service) {
      content += '\n[Service]\n'
      properties.service.forEach(function (prop) {
        content += prop.name + '=' + prop.value + '\n'
      })
      content += '\n'
    }
    return content.replace(/^\s+/, '').replace(/\s+$/, '\n');
  }

  var getUnitsPath = function (userMode) {
    var installPath = '/etc/systemd/system/';
    if (userMode) {
      if ('XDG_DATA_HOME' in process.env) installPath = path.join(process.env['XDG_DATA_HOME'], 'systemd/user');
      if ('HOME' in process.env) installPath = path.join(process.env['HOME'], '.config/systemd/user');
    }
    return installPath;
  }

  this.install = function (opts, then) {
    // https://www.freedesktop.org/software/systemd/man/systemd.unit.html#id-1.7.4
    var installPath = getUnitsPath(opts.user || opts.u);

    (getFs().mkdirs || getFs().mkdir)(installPath, function (err) {
      if (err) return then(err);
      var unitContent = generateUnitContent(opts.properties)
      var unitPath = path.join(installPath, opts.id.replace(/\.service$/, '') + '.service')
      getFs().writeFile(unitPath, unitContent, then);
    })
  }

  this.uninstall = function (opts, then) {
    var installPath = getUnitsPath(opts.user || opts.u);
    var unitPath = path.join(installPath, opts.id.replace(/\.service$/, '') + '.service')

    getFs().unlink(unitPath, then);
  }

}

module.exports = systemdSimpleApi;
