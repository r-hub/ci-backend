var uuid = require('uuid');
var jenkins_url = process.env.JENKINS_URL;
var jenkins = require('jenkins');
var jenkins_xml = require('../lib/jenkins_xml');
var job_db = require('../lib/job-db');
var get_job_ref = require('../lib/get-job-ref');

function builder(job, callback) {
    var job_name = jenkins_job_name(job);
    job_db.add_job(job, job_name, function(err, data) {
	if (err) { return callback(err); }
	var conn = jenkins(jenkins_url);
	add_pkg(conn, job, job_name, function(err) {
	    if (err) { callback(err); return; }
	    callback(null);
	});
    });
}

function add_pkg(conn, job, job_name, callback) {
    add_jenkins_job(conn, job, job_name, function(err) {
	if (err) { console.log(err); callback(err); return; }

	build_jenkins_job(conn, job, job_name, function(err) {
	    if (err) { console.log(err); callback(err); return; }
	    callback(null);
	})
    })
}

function add_jenkins_job(conn, job, job_name, callback) {
    console.log("adding " + job_name);
    jenkins_xml(job, function(err, job_xml) {
	if (err) { callback(err); return; }
	conn.job.create(
	    job_name,
	    job_xml,
	    function(err) {
		if (err) { console.log(err); callback(err); return; }
		callback(null);
	    }
	)
    })
}

function build_jenkins_job(conn, job, job_name, callback) {
    var ref = get_job_ref(job);
    var url = job.repository.archive_url
	.replace('{archive_format}', 'tarball')
	.replace('{/ref}', '/' + ref);

    conn.job.build(
	job_name,
	{ 'parameters': {
	    'package': job.repository.name + '.tar.gz',
	    'filename': ref,
	    'url': url,
	    'image': 'debian-gcc-devel' }
	},
	function(err) {
	    if (err) { console.log(err); callback(err); return; }
	    callback(null)
	}
    )
}

function jenkins_job_name(job) {
    return 'github--' +
	job.repository.full_name.replace("/", "--") + '--' +
	uuid.v4().replace(/-/g, '');
}

module.exports = builder;
