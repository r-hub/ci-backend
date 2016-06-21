var is_pr = require('../lib/is-pr');

function get_email(job) {
    if (is_pr(job)) {
	return '';
    } else {
	return job.pusher.email;
    }
}

module.exports = get_email;
