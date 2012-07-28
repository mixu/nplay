# Nplay

Node frontend for mpg321 / mpg123 / mplayer with Winamp key bindings.

You need to install:
- mpg123 (e.g. aptitude install mpg123).
- optional: mplayer (e.g. aptitude install mplayer).

mpg123 is used to playback mp3 files, mplayer for other files (m4a, wav).

Can play mp3 files from the console.

z - x - c - v - b is the bottom row on your keyboard.

### Commands:

    z - Previous
    x - Play
    c - Pause
    v - Stop
    b - Next
    s - Shuffle
    r - Repeat
    j - Jump to file by filename search

## Playback interface:

![screenshot](https://github.com/mixu/node-winamp/raw/master/doc/playback.png)

Jump to with autocompletion and song selection using up/down/enter keys:

Partial matches are supported, separate terms with a space.

![screenshot](https://github.com/mixu/node-winamp/raw/master/doc/jump_mode.png)


## Shuffle mode

The random playlist is pre-generated when the mode is started, so if you skip past a good song, you can go back to it.

## Filter mode

Filters songs to only rated ones.
