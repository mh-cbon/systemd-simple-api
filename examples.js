var systemdApi = new (require('./index.js'))();

// systemdApi.list({}, function (err, services) {
//   err && console.error(err);
//   !err && console.log('%j', services)
// });
//
// systemdApi.listUnitFiles({}, function (err, services) {
//   err && console.error(err);
//   !err && console.log('%j', services)
// });

systemdApi.describe('zram', {}, function (err, services) {
  err && console.error(err);
  !err && console.log('%j', services)
});
