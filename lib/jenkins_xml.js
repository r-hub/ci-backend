var fs = require('fs');
var mustache = require('mustache');
var xml_encode = require('../lib/xml_encode');
var get_email = require('../lib/get-email');

function jenkins_xml(job, callback) {

    fs.readFile(
	'./templates/job.xml',
	'utf8',
	function(err, template) {
	    if (err) { console.log(err); callback(err); return; }

	    fs.readFile(
		'./templates/jenkins.sh',
		'utf8',
		function(err, command) {
		    if (err) { console.log(err); callback(err); return; }
		    var data = { 'commands': xml_encode(command),
				 'email': xml_encode(get_email(job)) };
		    var res = mustache.render(template, data);
		    callback(null, res);
		}
	    )
	}
    )
}

module.exports = jenkins_xml;
