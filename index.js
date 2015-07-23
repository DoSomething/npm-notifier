var npm = require('npm');
var request = require('superagent');
var _ = require('lodash');

function getLatestVersion(packageName, callback) {
  npm.load(function(error) {
    npm.commands.view([packageName, 'version'], true, function(error, result) {
      if (error) throw new Error(error);

      var keys = _.keys(result);
      var latestVersion = keys[0];

      callback(latestVersion);
    });
  });
}

function watchForVersionChange(packageName, callback) {
  var currentVersion = '';

  setInterval(function() {
    getLatestVersion(packageName, function(version) {
      console.log(version);

      if(version !== currentVersion) {
        callback(version);
      }

      currentVersion = version;
    });
  }, 5000);

}

watchForVersionChange(process.env.NPM_PACKAGE_NAME, function(version) {

  request.post(process.env.NPM_SLACK_WEBHOOK)
    .send({
      channel: '#botland',
      attachments: [{
        fallback: 'Package ' + process.env.NPM_PACKAGE_NAME + ' was updated to version ' + version + '.',
        text: 'Package <http://npmjs.com/' + process.env.NPM_PACKAGE_NAME + '|' + process.env.NPM_PACKAGE_NAME + '> was updated to version ' + version + '.',
        color: '#36a64f',
      }]
    })
    .end(function(err) {
      if (err) throw new Error(err);
    });


});
