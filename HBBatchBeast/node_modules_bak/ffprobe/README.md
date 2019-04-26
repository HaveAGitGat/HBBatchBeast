# ffprobe

Use ffprobe to get info from media files and return as JSON

[![build status](https://secure.travis-ci.org/eugeneware/ffprobe.png)](http://travis-ci.org/eugeneware/ffprobe)

## Installation

This module is installed via npm:

``` bash
$ npm install ffprobe
```

## Example Usage

`ffprobe` is a *dual* API, supporting both node.js callbacks *AND* `Promise`s.

### Callback API
List the output of ffprobe for a media file in a convenient JSON format:

``` js
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');

ffprobe('./file.mp4', { path: ffprobeStatic.path }, function (err, info) {
  if (err) return done(err);
  console.log(info);
/***
{
    "streams": [
        {
            "index": 0,
            "codec_name": "h264",
            "codec_long_name": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
            "profile": "High",
            "codec_type": "video",
            "codec_time_base": "1/50",
            "codec_tag_string": "avc1",
            "codec_tag": "0x31637661",
            "width": 1280,
            "height": 720,
            "coded_width": 1280,
            "coded_height": 720,
            "has_b_frames": 0,
            "sample_aspect_ratio": "1:1",
            "display_aspect_ratio": "16:9",
            "pix_fmt": "yuv420p",
            "level": 31,
            "chroma_location": "left",
            "refs": 1,
            "is_avc": "1",
            "nal_length_size": "4",
            "r_frame_rate": "25/1",
            "avg_frame_rate": "25/1",
            "time_base": "1/25",
            "start_pts": 0,
            "start_time": "0.000000",
            "duration_ts": 299,
            "duration": "11.960000",
            "bit_rate": "1031739",
            "bits_per_raw_sample": "8",
            "nb_frames": "299",
            "disposition": {
                "default": 1,
                "dub": 0,
                "original": 0,
                "comment": 0,
                "lyrics": 0,
                "karaoke": 0,
                "forced": 0,
                "hearing_impaired": 0,
                "visual_impaired": 0,
                "clean_effects": 0,
                "attached_pic": 0
            },
            "tags": {
                "language": "und",
                "handler_name": "VideoHandler"
            }
        },
        {
            "index": 1,
            "codec_name": "aac",
            "codec_long_name": "AAC (Advanced Audio Coding)",
            "profile": "LC",
            "codec_type": "audio",
            "codec_time_base": "1/44100",
            "codec_tag_string": "mp4a",
            "codec_tag": "0x6134706d",
            "sample_fmt": "fltp",
            "sample_rate": "44100",
            "channels": 2,
            "channel_layout": "stereo",
            "bits_per_sample": 0,
            "r_frame_rate": "0/0",
            "avg_frame_rate": "0/0",
            "time_base": "1/44100",
            "start_pts": 0,
            "start_time": "0.000000",
            "duration_ts": 528384,
            "duration": "11.981497",
            "bit_rate": "192287",
            "max_bit_rate": "203120",
            "nb_frames": "516",
            "disposition": {
                "default": 1,
                "dub": 0,
                "original": 0,
                "comment": 0,
                "lyrics": 0,
                "karaoke": 0,
                "forced": 0,
                "hearing_impaired": 0,
                "visual_impaired": 0,
                "clean_effects": 0,
                "attached_pic": 0
            },
            "tags": {
                "creation_time": "2015-11-16 00:48:42",
                "language": "eng",
                "handler_name": "IsoMedia File Produced by Google, 5-11-2011"
            }
        }
    ]
}
 **/
});
```

### Promise API
List the output of ffprobe for a media file in a convenient JSON format:

``` js
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');

ffprobe('./file.mp4', { path: ffprobeStatic.path })
  .then(function (info) {
    console.log(info);
    /***
    {
        "streams": [
            {
                "index": 0,
                "codec_name": "h264",
                "codec_long_name": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
                "profile": "High",

                ...
                }
            }
        ]
    }
     **/
  })
  .catch(function (err) {
    console.error(err);
  })
});
```

## API

### `ffprobe(mediaFilePath, opts, [cb])`

* `mediaFilePath` - path to your audio / video / image that you want to get media
  info for.
* `opts` - options object with the following options:
  * `path` - path to ffprobe binary (You can use
    [`ffprobe-static`](https://github.com/joshwnj/ffprobe-static) to easily get
    a static binary that you can install with npm.
* `cb(err, info)` - standard callback, with the info returned as a javascript
  object. NB: If the `cb` parameter is not provided, a `Promise` will be returned
  allowing chained `then()`, `catch()` methods.

