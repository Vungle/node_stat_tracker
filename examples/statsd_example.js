var StatTracker = require('../')
var StatsDBackend = StatTracker.StatsDBackend;
var tracker = new StatTracker.StatTracker({
  global_tags: ["tag1", "tag2"],
  prefix: 'stat_tracker_test',
  backend: StatsDBackend
});

var profiler = tracker.profiler('counts', ["extra_tag1"]);

tracker.count('my_count', 1);

profiler.tick('first_count');

tracker.count('my_second_count', 10);
tracker.count('my_second_count', -5, ["extra_tag2"]);

profiler.end();

// Wait for everything to go through before killing.
setTimeout(function() {
  process.exit(0);
}, 100);


