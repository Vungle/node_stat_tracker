var StatsD = require('hot-shots');

function StatsdBackend(config) {
  this._statsd = new StatsD(config);
}

StatsdBackend.prototype.count = function(metric, value, tags) {
  // Increment by 1 by default, still allowing 0
  if (typeof value !== 'number') {
    value = 1;
  }

  if (value < 0) {
    this._statsd.decrement(metric, -value, undefined, tags);
  } else {
    this._statsd.increment(metric, value, undefined, tags);
  }
};

StatsdBackend.prototype.time = function(metric, value, tags) {
  this._statsd.timing(metric, value, undefined, tags);
};

StatsdBackend.prototype.gauge = function(metric, value, tags) {
  this._statsd.gauge(metric, value, undefined, tags);
};

module.exports = StatsdBackend;
