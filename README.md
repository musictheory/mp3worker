# mp3worker

Web Worker to decode MP3 files


## Why?

Web Audio includes support for decoding audio via `decodeAudioData()`; however, this doesn't work for all formats on all operating systems.

In our case, MP3 files failed to decode on the following configurations:

 1. Opera on Windows Vista and Windows 7 (possibly others)
 2. Firefox on Linux
 3. Various Android devices (including all Kindle Fire tablets)

To solve this, we compiled lieff's [minimp3](https://github.com/lieff/minimp3) project with [Emscripten](https://github.com/kripken/emscripten)
and added a small abstraction layer. Previous versions of mp3worker used Martin J. Fiedler's [minimp3](https://keyj.emphy.de/minimp3/) project.

The `source` directory contains a small Xcode project used to build the first abstraction layer. From there:

1. We ran `emcc -Oz --memory-init-file 0 -s WASM=0 -s EXPORTED_FUNCTIONS=_mp3_init,_mp3_decode mp3worker.c`
2. We copied a portion of `a.out.js` into `mp3worker.js`
3. We added an additional abstraction layer for a cleaner interface

## Usage

See example in index.html.  

## License

`mp3worker.js` and all files are [dedicated to the public domain](https://creativecommons.org/publicdomain/zero/1.0/).

```
/*
 * mp3worker
 * https://github.com/musictheory/mp3worker/
 *
 * Based on minimp3
 * https://github.com/lieff/minimp3
 *
 * Dedicated to the public domain
 * https://creativecommons.org/publicdomain/zero/1.0/
  */
 ```
 