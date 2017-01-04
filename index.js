/**
 * StatTracker is a generic stats tracker library that can be used with any backend.
 *
 * Sample usage:
 *
 * ```javascript
 *   var dummy_backend = {
 *     counts: {},
 *     gauges: {},
 *     timings: {},
 *
 *     count: function(key, num) {
 *       this.counts[key] += num;
 *     },
 *
 *     gauge: function(key, amount) {
 *       this.gauges[key] = amount;
 *     },
 *
 *     timings: function(key, time) {
 *       if (!this.timings[key]) {this.timings[key]  = []}
 *
 *       this.timings[key].push(time);
 *     }
 *
 *   }
 *
 *   var statTracker = new StatTracker({});
 *   function track_this() {
 *     var profiler = statTracker.profiler('profile_scope');
 *
 *     ... Some computation ...
 *     statTracker.count('step1_num_runs', 1);
 *
 *     profiler.tick('first_step');
 *
 *     ... Some computation ...
 *     statTracker.count('step2_num_runs', 1);
 *
 *     profiler.end();
 *   }
 * ```
 */

// Default configuration object
const DEFAULT_CONFIG = {
  global_tags: [],
  prefix: '',
  separator: '.',
  backend: null
};

/**
 * [Profiler description]
 * @param {[type]} metric  [description]
 * @param {[type]} tracker [description]
 * @param {[type]} config  [description]
 */
function Profiler(metric, tracker, config) {
  this._metric = metric;
  this._tracker = tracker;
  this._config = config;

  // Starts the profiler by default
  this.start();
}

Profiler.prototype.start = function() {
  if (!this._tracker) { return; }

  this._start = Date.now();
  this._tick = Date.now();
};

Profiler.prototype.tick = function(name) {
  if (!this._tracker) { return; }

  var key = [this._metric, name].join(this._config.separator);
  this._tick = this._tracker.time(key, this._tick);
};

Profiler.prototype.end = function() {
  if (!this._tracker) { return; }

  var key = this._metric + this._config.separator + 'total';
  this._tracker.time(key, this._start);

  this._kill();
};

Profiler.prototype._kill = function() {
  this._tracker = null;
  this._start = null;
  this._tick = null;
  this._metric = null;
};

/**
 * StatTracker object is a
 * @param {{
 *        prefix {String},
 *
 *        }} config [description]
 */
function StatTracker(config) {
  try {
    this._config = config;
    this._backend = new (config.backend)(config);
    this._prefix = config.prefix.length ? config.prefix + config.separator : '';
    this._tags = config.global_tags;
  } catch (ex) {
    throw new Error('Failed to start stat tracker.', ex);
  }
}

/**
 * Given a metric name this function adds `value` to the metric, counting the number of
 * occurences in the time frame.
 *
 * [Based on the StatsD Protocol]{@link https://github.com/b/statsd_spec#counters}
 *
 * @param  {String} metric Metric name for the count
 * @param  {Number} value Count value
 */
StatTracker.prototype.count = function(metric, value) {
  var key = this._prefix + String(metric);
  this._backend.count(key, value);
};

/**
 * Records a gauge metric value. This sets a metric to a value at that instance The
 * difference with count is that it is calculated on the client rather than the server.
 *
 * [Based on the StatsD Protocol]{@link https://github.com/b/statsd_spec#gauges}
 *
 * @param  {String} metric
 * @param  {Number} value
 */
StatTracker.prototype.gauge = function(metric, value) {
  var key = this._prefix + metric;
  this._backend.gauge(key, value);
};

/**
 * Returns a new Profiler instance for the given metric. The profiler can be used
 * to profile a chain of events.
 *
 * @param  {String} metric Metric name
 *
 * @return {Profiler} Profiler instance
 */
StatTracker.prototype.profiler = function(metric) {
  return new Profiler(metric, this, this._config);
};

/**
 * Given a start time in milliseconds the metric is timed to `Date.now()`.
 *
 * [Based on the StatsD Protocol]{@link https://github.com/b/statsd_spec#timers}
 *
 * @param  {String} metric Metric name
 * @param  {Integer} start Start time for the timing
 *
 * @return {Integer} Time this timing was diff-ed against
 */
StatTracker.prototype.time = function(metric, start) {
  var key = this._prefix + String(metric);
  var now = Date.now();
  var diff = now - start;

  this._backend.time(key, diff);

  return now;
};


module.exports = function(customConfig) {
  var c = Object.assign({}, DEFAULT_CONFIG, customConfig);
  return new StatTracker(c);
}
