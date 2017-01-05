'use strict';
var async = require('async');
var should = require('should');

var dummyBackend = {
  counts: {},
  times: {},
  gauges: {},

  count: function(key, val) {
    val = val || 1;
    this.counts[key] = this.counts[key] ? this.counts[key] + val : val;
  },

  time: function(key, val) {
    this.times[key] = val;
  },

  gauge: function(key, val) {
    this.gauges[key] = val;
  },

  reset: function() {
    this.counts = {};
    this.times = {};
    this.gauges = {};
  }
};

var statTracker = new (require('../').StatTracker)({
  backend: dummyBackend
});

describe('stat tracker', function() {
  beforeEach(function() {
    dummyBackend.reset();
  });

  it('should increment counts', _should_increment_counts);
  it('should increment counts with prefix', _should_increment_counts_prefix);
  it('should calculate time', _should_calculate_time);
  it('should gauge and set value', _should_set_gauge);

  describe('profiler', function() {
    it('should tick correctly and calculate time', _profiler_should_tick);
  });
});


function _should_increment_counts(done) {
  statTracker.count('test');

  statTracker.count('test2');
  statTracker.count('test2');

  dummyBackend.counts['test'].should.equal(1);
  dummyBackend.counts['test2'].should.equal(2);
  done();
}

function _should_increment_counts_prefix(done) {
  statTracker._prefix = 'cool.';
  statTracker.count('test');

  statTracker.count('test2');
  statTracker.count('test2');

  dummyBackend.counts['cool.test'].should.equal(1);
  dummyBackend.counts['cool.test2'].should.equal(2);

  // reset prefix
  statTracker._prefix = '';

  done();
}

function _should_calculate_time(done) {
  var start = Date.now();

  setTimeout(function () {
    statTracker.time('test.time', start);

    dummyBackend.times['test.time'].should.be.greaterThan(199);
    done();
  }, 200);
}

function _should_set_gauge(done) {
  statTracker.gauge('test.gauge', 100);
  statTracker.gauge('test.gauge', 600);

  dummyBackend.gauges['test.gauge'].should.equal(600);
  done();
}

function _profiler_should_tick(done) {
  var profiler = statTracker.profiler('test.profiler');
  async.waterfall([
    function wait(cb) {
      setTimeout(cb, 50);
    },
    function one(cb) {
      profiler.tick('one');
      dummyBackend.times['test.profiler.one'].should.be.greaterThan(49);

      setTimeout(cb, 100);
    },
    function two(cb) {
      profiler.tick('two');
      dummyBackend.times['test.profiler.two'].should.be.greaterThan(99);

      setTimeout(cb, 50);
    }],
    function end() {
      profiler.end();
      dummyBackend.times['test.profiler.total'].should.be.greaterThan(199);

      done();
    });
}