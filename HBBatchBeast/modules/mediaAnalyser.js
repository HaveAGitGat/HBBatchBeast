const updateConsole = (text) => {
  const message = {
    type: "consoleMessage",
    text,
  };
  process.send(message);
};

process.on('uncaughtException', (err) => {
  console.log(err.stack);

  updateConsole(err.stack)

  process.exit();
});

//console.log(randomvariable)

//global variable

process.on('message', (infoArray) => {
  if (infoArray.type == "analyseThis") {
    //var workerCommand = infoArray.command;

    const filepath = infoArray.filePath

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

    ffprobe(filepath, { path: ffprobeStaticPath }, (err, info) => {
      //if (err) return done(err);

      if (err) {
        const message = {
          type: "fileInfo",
          info,
        };
        process.send(message);

        process.exit()
      }

      //console.log(info);

      console.log(info);

      thisval = info;

      console.log(thisval.streams[0]["codec_name"]);

      const message = {
        type: "fileInfo",
        info,
      };
      process.send(message);

      process.exit()
    });

    //
  }
});
