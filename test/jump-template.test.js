var assert = require('assert'),
    chalk = require('chalk'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    jump = require('../lib/templates/jump.js');

describe('jump template test', function() {

  describe('list render', function() {
    var songs = [
      {
        path: homePath + '/foo/Red Hot Chili Peppers - Californication.mp3',
        name: 'Red Hot Chili Peppers - Californication',
        rating: 5,
        playCount: 321,
        lastPlay: new Date().getTime()
      },
      {
        path: homePath + '/foo/Red Hot Chili Peppers - Give It Away.mp3',
        name: 'Red Hot Chili Peppers - Give It Away',
        rating: 3,
        playCount: 1000,
        lastPlay: new Date().getTime()
      }
    ];

    it('can render a single track', function() {
      var raw = jump(songs, songs[0], ['red', 'hot'], 55, 30, true),
          actual = raw.map(chalk.stripColor, chalk),
          expected = [
            'Red Hot Chili Peppers - Californication    ♫ 321 ★★★★★',
            'Red Hot Chili Peppers - Give It Away      ♫ 1000   ★★★'
          ];

      assert.equal(actual[0].length, 54);
      assert.equal(actual[0], expected[0]);
      assert.equal(actual[1], expected[1]);
    });

    it('drops the play count if the col count is too small', function() {
      var raw = jump(songs, songs[0], ['red', 'hot'], 46, 30, true),
          actual = raw.map(chalk.stripColor, chalk),
          expected = [
            'Red Hot Chili Peppers - Californication ★★★★★',
            'Red Hot Chili Peppers - Give It Away      ★★★'
          ];

      assert.equal(actual[0].length, 45);
      assert.equal(actual[0], expected[0]);
      assert.equal(actual[1], expected[1]);
    });

    it('drops the rating if the col count is too small', function() {
      var raw = jump(songs, songs[0], ['red', 'hot'], 45, 30, true),
          actual = raw.map(chalk.stripColor, chalk),
          expected = [
            'Red Hot Chili Peppers - Californication     ',
            'Red Hot Chili Peppers - Give It Away        '
          ];

      assert.equal(actual[0].length, 44);
      assert.equal(actual[0], expected[0]);
      assert.equal(actual[1], expected[1]);
    });

    it('shortens the name if the col count is too small', function() {
      var raw = jump(songs, songs[0], ['red', 'hot'], 26, 30, true),
          actual = raw.map(chalk.stripColor, chalk),
          expected = [
            'Red Hot Chili Peppers - C',
            'Red Hot Chili Peppers - G'
          ];

      assert.equal(actual[0].length, 25);
      assert.equal(actual[0], expected[0]);
      assert.equal(actual[1], expected[1]);
    });

    it('shortens the name to 1 character', function() {
      var raw = jump(songs, songs[0], ['red', 'hot'], 2, 30, true),
          actual = raw.map(chalk.stripColor, chalk),
          expected = ['R', 'R'];

      assert.equal(actual[0].length, 1);
      assert.equal(actual[0], expected[0]);
      assert.equal(actual[1], expected[1]);
    });

  });

});
