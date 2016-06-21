
var is_pr = require('../lib/is-pr');

function get_job_ref(job) {
    if (is_pr(job)) {
	return job.pull_request.head.sha;
    } else {
	return job.head_commit.id;
    }
}

module.exports = get_job_ref;
