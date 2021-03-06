var http = require('supertest');
var assert = require('assert');
var settings = require('../../lib/v2/routers/settings');
var app = require('../../lib/app');

describe('v2 settings', function () {
  var id;
  var one;
  it('should allCallback', function (done) {
    var allCallback = settings.settings.__allCallback;
    var res = {
      errorize: function (error, data) {
        assert(error === 'hood');
        assert(data.error);
        assert(data.data === undefined);
        done();
      },
      errors: {
        Failed: 'hood'
      }
    };
    var cb = allCallback(res);
    cb(true);
  });

  it('should failed', function (done) {
    var failed = settings.settings.__failed;
    var res = {
      errorize: function (error, data) {
        assert(error === 'hood');
        assert(data);
        done();
      },
      errors: {
        Failed: 'hood'
      }
    };
    var cb = failed(res);
    cb(true);
  });

  it('should create a settings item', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 1;
    var req = http(app);
    req.post('/v2/settings/user')
      .send({
        action: 'create',
        key: 'weixin',
        value: JSON.stringify({
          hello: 'world'
        })
      })
      .end(function (error, res) {
        assert(!error);
        var body = res.body;
        console.log(body.data);
        assert(body.code === 0);
        assert(body.data);
        assert(body.data.id);
        id = body.data.id;
        one = body.data;
        done();
      });
  });

  it('should not create a settings item', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 1;
    var req = http(app);
    req.post('/v2/settings/user')
      .send({
        action: 'create',
        if: 'weixin',
        no: JSON.stringify({
          hello: 'world'
        })
      })
      .expect(200)
      .end(function (error, res) {
        assert(!error);
        assert.deepEqual(res.body, {
          code: 2,
          name: 'InputInvalid',
          message: '输入无效!'
        });
        done();
      });
  });

  it('should not create a settings item', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 0;
    var req = http(app);
    req.post('/v2/settings/user')
      .send({
        action: 'create',
        key: 'weixin',
        value: JSON.stringify({
          hello: 'world'
        })
      })
      .expect(403)
      .end(done);
  });

  it('should not create a settings item', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 1;
    var req = http(app);
    req.post('/v2/settings/user')
      .send({
        action: 'list',
        key: 'weixin',
        value: JSON.stringify({
          hello: 'world'
        })
      })
      .expect(404)
      .end(done);
  });

  it('should get settings list', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 1;
    var req = http(app);
    req.get('/v2/settings?limit=10&page=1')
      .end(function (error, res) {
        assert(!error);
        var body = res.body;
        assert(body.code === 0);
        var data = body.data;
        console.log(data);
        assert(data.total >= 1);
        assert(data.page >= 1);
        assert(data.count >= 1);
        assert(data.results.length >= 1);
        done();
      });
  });

  it('should get settings info', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 1;
    var req = http(app);
    req.get('/v2/settings/' + id)
      .end(function (error, res) {
        assert(!error);
        var body = res.body;
        assert(body.code === 0);
        assert(body.data);
        assert.deepEqual(body.data, one);
        done();
      });
  });

  it('should get settings info', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 0;
    var req = http(app);
    req.get('/v2/settings/' + id)
      .expect(403)
      .end(done);
  });

  it('should not get settings', function (done) {
    process.env.FORIM_BY_PASS_POLICIES = 1;
    var req = http(app);
    req.get('/v2/settings/100000')
      .end(function (error, res) {
        assert(!error);
        var body = res.body;
        assert(body.name === 'NotFound');
        assert(!body.data);
        done();
      });
  });
});
