ffprobe-static
====

Static binaries for `ffprobe`.

Based on <https://github.com/eugeneware/ffmpeg-static>.

Binaries are from <http://ffmpeg.zeranoe.com/builds/>

Usage
----

```js
var ffprobe = require('ffprobe-static');
console.log(ffprobe.path);
```

Version Notes
----

Currently supports Mac OS X (64-bit), Linux (32 and 64-bit) and Windows
(32 and 64-bit).

Currently version `4.0.2` is installed for Mac, Windows and Linux.

I pulled the versions from the ffmpeg static build pages linked from the
official ffmpeg site. Namely:

* [64 bit Mac OSX](https://evermeet.cx/ffmpeg/)
* [64 bit Linux](http://johnvansickle.com/ffmpeg/)
* [32 bit Linux](http://johnvansickle.com/ffmpeg/)
* [64 bit Windows](http://ffmpeg.zeranoe.com/builds/win64/static/)
* [32 bit Windows](http://ffmpeg.zeranoe.com/builds/win32/static/)

Acknowledgements
----

Special thanks to [eugeneware](https://github.com/eugeneware) for <https://github.com/eugeneware/ffmpeg-static>, which this is based upon.
