# mp3worker

Web Worker to decode MP3 files

## Why?

Web Audio includes support for decoding audio via `decodeAudioData()`; however, this doesn't work for all formats on all operating systems.

In our case, MP3 files failed to decode on the following configurations:

 1. Opera on Windows Vista and Windows 7 (possibly others)
 2. Firefox on Linux
 3. Various Android devices (including all Kindle Fire tablets)

To solve this, we compiled Martin Fiedler's [minimp3](http://keyj.emphy.de/minimp3/) project with [Emscripten](https://github.com/kripken/emscripten)
and duct-taped on an abstraction layer.

The `source` directory contains the source code at various stages of minification:

  1. We tweaked `minimp3.c` a bit to make it easier to call from JavaScript
  2. Emscripten turned `minimp3.c` into `0.js`
  3. We chainsawed `0.js` to remove unused functions and saved it as `1.js`
  4. `1.js` was ran through `jsmin` to get the final `mp3worker.js` file

## Usage

See example in index.html.  

## License

```
/*
 * mp3worker
 * (based on minimp3, which is based on FFmpeg)
 *
 * https://github.com/musictheory/mp3worker/
 *
 * Copyright (c) 2001, 2002 Fabrice Bellard (FFmpeg)
 *           (c) 2007 Martin J. Fiedler (minimp3)
 *           (c) 2016 musictheory.net, LLC
 *
 * This file is based on a stripped-down version of the MPEG Audio
 * decoder from the FFmpeg libavcodec library.
 *
 * mp3worker is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * mp3worker are distributed in the hope that they will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with FFmpeg; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */
 ```
 
