var StatsDBackend = require('../lib/statsd_backend');
var StatTracker = new require('../')({
  global_tags: ["tag1", "tag2"],
  prefix: 'stat_tracker_test',
  backend: StatsDBackend
});

var profiler = StatTracker.profiler('counts', ["extra_tag1"]);

StatTracker.count('my_count', 1);

profiler.tick('first_count');

StatTracker.count('my_second_count', 10);
StatTracker.count('my_second_count', -5, ["extra_tag2"]);

profiler.end();

// Wait for everything to go through before killing.
setTimeout(function() {
  process.exit(0);
}, 100);