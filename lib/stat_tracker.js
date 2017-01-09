'use strict';
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

var Profiler = require('./profiler');

// Default configuration object
const DEFAULT_CONFIG = {
  backend: null,
  backend_config: {},
  global_tags: [],
  prefix: '',
  separator: '.'
};

/**
 * StatTracker object is a
 * @param {Object} config                    The tracker configuration
 * @param {{Object|function}} config.backend The backened to be used for this tracker.
 * @param {Object} config.backend_configs    If backened is a function this config
 *                                           will be passed to the backened init.
 * @param {string[]} config.global_tags      The tags that will be attached to all metrics.
 * @param {string} config.prefix             Scope of this tracker. All metrics will have this prefix.
 * @param {string} config.separator          The separator for prefix/metric name/profiler scope.
 */
function StatTracker(config) {
  try {
    this._config = config;
    this._backend = (typeof config.backend === 'object') ? config.backend : new (config.backend)(config.backend_config);
    this._prefix = config.prefix.length ? config.prefix + config.separator : '';
    this._tags = config.global_tags || [];
  } catch (ex) {
    throw new Error('Failed to start stat tracker.' + ex);
  }
}

/**
 * Given a metric name this function adds `value` to the metric, counting the number of
 * occurrences in the time frame.
 *
 * [Based on the StatsD Protocol]{@link https://github.com/b/statsd_spec#counters}
 *
 * @param  {string} metric Metric name for the count
 * @param  {Number} value Count value
 */
StatTracker.prototype.count = function(metric, value, tags) {
  var ntags = this._tags.concat(tags || []);
  var key = this._prefix + String(metric);

  this._backend.count(key, value, ntags);
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
StatTracker.prototype.gauge = function(metric, value, tags) {
  var ntags = this._tags.concat(tags || []);
  var key = this._prefix + metric;

  this._backend.gauge(key, value, ntags);
};

/**
 * Returns a new Profiler instance for the given metric. The profiler can be used
 * to profile a chain of events.
 *
 * @param  {String} metric Metric name
 *
 * @return {Profiler} Profiler instance
 */
StatTracker.prototype.profiler = function(metric, tags) {
  // No need to include global_tags as the profiler still uses StatTracker functions
  // and they will append the global_tags.
  var ntags = tags || [];

  return new Profiler(metric, ntags, this, this._config);
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
StatTracker.prototype.time = function(metric, start, tags) {
  var now = Date.now();
  var diff = now - start;

  // Guard against going back in time
  if (diff < 0) { return NaN; }

  var ntags = this._tags.concat(tags || []);
  var key = this._prefix + String(metric);

  this._backend.time(key, diff, ntags);

  return now;
};


module.exports = function(customConfig) {
  var c = Object.assign({}, DEFAULT_CONFIG, customConfig);
  return new StatTracker(c);
}