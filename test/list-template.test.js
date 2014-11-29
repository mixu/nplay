var assert = require('assert'),
    chalk = require('chalk'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    list = require('../lib/templates/list.js');

describe('list template test', function() {

  describe('single track utf8', function() {
    var songs = [
      {
        path: homePath + '/foo/Test track.mp3',
        name: 'Test track',
        rating: 5,
        playCount: 321,
        lastPlay: new Date().getTime()
      }
    ];

    it('can render a single track', function() {
      var actual = list(songs, songs[0], 60, true).map(chalk.stripColor, chalk),
          expected = [ '~/foo/Test track       > less than a minute ago ♫ 321 ★★★★★' ]

      console.log();
      console.log(actual[0]);
      console.log(expected[0]);

      assert.equal(actual[0].length, 59);
      assert.equal(actual[0], expected[0]);

    });


    it('drops the last played if col count is small', function() {
      var actual = list(songs, songs[0], 30, true).map(chalk.stripColor, chalk),
          expected = [ '~/foo/Test track  ♫ 321 ★★★★★' ]

      console.log();
      console.log(actual[0]);
      console.log(expected[0]);

      assert.equal(actual[0].length, 29);
      assert.equal(actual[0], expected[0]);
    });

    it('drops the path if the col count is small', function() {
      var actual = list(songs, songs[0], 23, true).map(chalk.stripColor, chalk),
          expected = [ 'Test track ♫ 321 ★★★★★' ]

      console.log();
      console.log(actual[0]);
      console.log(expected[0]);

      assert.equal(actual[0].length, 22);
      assert.equal(actual[0], expected[0]);
    });

    it('drops the play count if the col count is too small', function() {
      var actual = list(songs, songs[0], 20, true).map(chalk.stripColor, chalk),
          expected = [ 'Test track    ★★★★★' ]

      console.log();
      console.log(actual[0]);
      console.log(expected[0]);

      assert.equal(actual[0].length, 19);
      assert.equal(actual[0], expected[0]);
    });

    it('drops the ratings if the col count is too small', function() {
      var actual = list(songs, songs[0], 14, true).map(chalk.stripColor, chalk),
          expected = [ 'Test track   ' ]

      console.log();
      console.log(actual[0]);
      console.log(expected[0]);

      assert.equal(actual[0].length, 13);
      assert.equal(actual[0], expected[0]);
    });

    it('shortens the name if the col count is too small', function() {
      var actual = list(songs, songs[0], 8, true).map(chalk.stripColor, chalk),
          expected = [ 'Test tr' ]

      console.log();
      console.log(actual[0]);
      console.log(expected[0]);

      assert.equal(actual[0].length, 7);
      assert.equal(actual[0], expected[0]);
    });

    it('shortens the name to 1 character', function() {
      var actual = list(songs, songs[0], 2, true).map(chalk.stripColor, chalk),
          expected = [ 'T' ]

      console.log();
      console.log(actual[0]);
      console.log(expected[0]);

      assert.equal(actual[0].length, 1);
      assert.equal(actual[0], expected[0]);
    });
  });

  describe('single track ascii', function() {

  });

});
