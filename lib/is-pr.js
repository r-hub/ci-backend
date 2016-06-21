
function is_pr(job) {
    return 'pull_request' in job;
}

module.exports = is_pr;
