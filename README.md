[![Build Status](https://travis-ci.com/Vungle/node_stat_tracker.svg?token=zokj87uTuruMNu9yXXRH&branch=master)](https://travis-ci.com/Vungle/node_stat_tracker)

# Node Stat Tracker
A generic stat tracker for NodeJS that can support many instances and different
reporting backends.

Tested for NodeJS: 4+

# Usage

```javascript
  var dummy_backend = {
    counts: {},
    gauges: {},
    timings: {},

    count: function(key, num) {
      this.counts[key] += num;
    },

    gauge: function(key, amount) {
      this.gauges[key] = amount;
    },

    timings: function(key, time) {
      if (!this.timings[key]) {this.timings[key]  = []}

      this.timings[key].push(time);
    }

  }

  var tracker = new StatTracker.Tracker({});
  function track_this() {
    var profiler = tracker.profiler('profile_scope');

    ... Some computation ...
    tracker.count('step1_num_runs', 1, ["sometag"]);

    profiler.tick('first_step');

    ... Some computation ...
    tracker.count('step2_num_runs', 1);

    profiler.end();
  }
```

# Backend Interface
A backend is a JavaScript prototype that implements the following:

```javascript
function Backend(config) {}

Backend.prototype.count = function(metric, value, tags) {};
Backend.prototype.time = function(metric, value, tags) {};
Backend.prototype.gauge = function(metric, value, tags) {};

module.exports = Backend;
```

The initialization `config` is provided by StatTracker `backend_config` property.

# Default Backends
`Node Stat Tracker` comes with two backends:
  * `statsd_backend`: Uses `node-statsd` for sending StatsD packets.
  * `logger_backend`: Logs the values using `bunyan` or config provided logger.