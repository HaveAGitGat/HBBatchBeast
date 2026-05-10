function updateConsole(text) {
  const message = [
    "consoleMessage",
    text,
  ];
  process.send(message);
}

process.on('uncaughtException', function (err) {
  console.log(err.stack);

  updateConsole(err.stack)

  process.exit();
});

//console.log(randomvariable)

//global variable

process.on('message', (infoArray) => {
  if (infoArray[0] == "analyseThis") {
    //var workerCommand = infoArray[1];

    const filepath = infoArray[1]

    if (__dirname.includes('.asar')) {
      process.env.NODE_ENV = "production";
    }

    const ffprobe = require('ffprobe');
    let ffprobeStaticPath;

    if (process.env.NODE_ENV == 'production') {
      ffprobeStaticPath = require('ffprobe-static').path.replace('app.asar', 'app.asar.unpacked')
    } else {
      ffprobeStaticPath = require('ffprobe-static').path
    }

    let thisval

    ffprobe(filepath, { path: ffprobeStaticPath }, function (err, info) {
      //if (err) return done(err);

      if (err) {
        const message = [
          "fileInfo",
          info,
        ];
        process.send(message);

        process.exit()
      }

      //console.log(info);

      console.log(info);

      thisval = info;

      console.log(thisval.streams[0]["codec_name"]);

      const message = [
        "fileInfo",
        info,
      ];
      process.send(message);

      process.exit()
    });

    //
  }
});
