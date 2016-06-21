
var pg = require('pg');
var range = require('array-range');
var get_job_ref = require('../lib/get-job-ref');
var db = process.env.DATABASE_URL;

function add_job(job, jenkins_job, callback) {
    pg.connect(db, function(err, client, done) {
	if (err) { done(client); return callback(err); }
	if ('pull_request' in job) {
	    add_job_pr(job, jenkins_job, callback, client, done);
	} else {
	    add_job_regular(job, jenkins_job, callback, client, done);
	}
    });
}

function add_job_pr(job, jenkins_job, callback, client, done) {
    var slug = job.repository.full_name;
    var branch = get_branch(job);
    var sha = get_job_ref(job);
    client.query(
	{
	    'text': 'SELECT add_job(' + pg_args(12) + ')',
	    'values': [ slug, branch, sha, job.pull_request.title,
			job.pull_request.updated_at, null, null, null,
			null, true, job.number, jenkins_job ]
	},
	function(err, result) {
	    done();
	    return callback(err, result);
	}
    );
}

function add_job_regular(job, jenkins_job, callback, client, done) {
    var slug = job.repository.full_name;
    var branch = get_branch(job);
    var commit = job.head_commit;
    client.query(
	{
	    'text': 'SELECT add_job(' + pg_args(12) + ')',
	    'values': [ slug, branch, commit.id, commit.message,
			commit.timestamp, commit.author.name,
			commit.author.email, commit.committer.name,
			commit.committer.email, false, 0, jenkins_job ]
	},
	function(err, result) {
	    done();
	    return callback(err, result);
	}
    );
}

function pg_args(num) {
    return range(1, num + 1)
	.map(function(x) { return '$' + x; })
	.join(', ');
}

function get_branch(job) {
    var ref = job.ref.split('/');
    return ref[ ref.length - 1];
}

module.exports = { 'add_job': add_job };
