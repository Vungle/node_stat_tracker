# Node Stat Tracker
NodeJS generic stat tracker.

This is an improvement to the version already implemented in
the legacy adserver code. We are pulling it out
so that other Vungle NodeJS projects can use it.

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

  var statTracker = new StatTracker({});
  function track_this() {
    var profiler = statTracker.profiler('profile_scope');

    ... Some computation ...
    statTracker.count('step1_num_runs', 1, ["sometag"]);

    profiler.tick('first_step');

    ... Some computation ...
    statTracker.count('step2_num_runs', 1);

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