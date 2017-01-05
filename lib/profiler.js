'use strict';
/**
 * Profiler type makes it easier to profile flow of a piece of code, using a
 * given stat tracker.
 */

function Profiler(metric, tags, tracker, config) {
  this._metric = metric;
  this._tracker = tracker;
  this._config = config;
  this._tags = tags;

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
  this._tick = this._tracker.time(key, this._tick, this._tags);
};

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