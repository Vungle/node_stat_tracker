'use strict';
/**
 * Profiler type makes it easier to profile flow of a piece of code, using a
 * given stat tracker.
 */

/**
 * Profiler constructor will create an instance of the Profile for easily
 * tracking time.
 *
 * @param {string}      metric  This is the scope of the profiler. All reported metrics
 *                              will start with this scope.
 * @param {string[]}    tags    What tags to add to all the metrics.
 * @param {StatTracker} tracker The tracker instance to use.
 * @param {Object}      config  Tracker configuration.
 */
function Profiler(metric, tags, tracker, config) {
  this._metric = metric;
  this._tracker = tracker;
  this._config = config;
  this._tags = tags;

  // Starts the profiler by default
  this.start();
}

/**
 * Will initialize the start times. All later calls are the time difference
 * between the time start is called and the measurement function call.
 */
Profiler.prototype.start = function() {
  if (!this._tracker) { return; }

  this._start = Date.now();
  this._tick = Date.now();
};

/**
 * Tick will report time taken by step of the process. Each tick is the time
 * between this call and the last time tick was called. If this is the first
 * call the time from start() is used.
 *
 * @param  {string} name Metric name.
 */
Profiler.prototype.tick = function(name) {
  if (!this._tracker) { return; }

  var key = [this._metric, name].join(this._config.separator);
  this._tick = this._tracker.time(key, this._tick, this._tags);
};

/**
 * End will report a total time since the start of the profiler and will kill
 * all the instance variables. This instance of the profiler cannot be used
 * after end has been called. A new instance has to be created.
 */
Profiler.prototype.end = function() {
  if (!this._tracker) { return; }

  var key = this._metric + this._config.separator + 'total';
  this._tracker.time(key, this._start, this._tags);

  this._kill();
};

Profiler.prototype._kill = function() {
  this._tracker = null;
  this._start = null;
  this._tick = null;
  this._metric = null;
  this._tags = null;
  this._config = null;
};

module.exports = Profiler;