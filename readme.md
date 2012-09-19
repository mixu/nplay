# Nplay

Node frontend for mplayer with Winamp key bindings.

You need to install:
- mplayer (e.g. aptitude install mplayer).

mplayer is used for playback (mp3, m4a, wav). Even works on Windows, though you have to set the command in the source.

Can play mp3 files from the console.

z - x - c - v - b is the bottom row on your keyboard.

### Commands:

    z - Previous
    x - Play
    c - Pause
    v - Stop
    b - Next
    s - Shuffle mode
    r - Repeat mode
    f - Filter mode (filtered by rating >= 3)
    1...5 - Rate song
    j - Jump to file by filename search

## Command line

You can pass paths (to directories or to files) to nplay to play the files. Directories are traversed recursively.

    nplay /home/m/mp3

When no arguments are passed, nplay reads ~/.nplay.json and uses the paths set there. The idea is that you are mostly listening to the same library of files:

    {
      "directories": [ "/home/m/mp3" ]
    }

## Playback interface:

![screenshot](https://github.com/mixu/node-winamp/raw/master/doc/playback.png)

Jump to with autocompletion and song selection using up/down/enter keys:

Partial matches are supported, separate terms with a space.

![screenshot](https://github.com/mixu/node-winamp/raw/master/doc/jump_mode.png)

## Shuffle mode

The random playlist is pre-generated when the mode is started, so if you skip past a good song, you can go back to it.

## Filter mode

Filters songs to only rated ones.
