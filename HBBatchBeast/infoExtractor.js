
//global variable


process.on('message', (infoArray) => {




if(infoArray[0]=="analyseThis"){


//var workerCommand = infoArray[1];


var filepath = infoArray[1]


var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');

    var thisval
 
ffprobe(filepath, { path: ffprobeStatic.path }, function (err, info) {
  if (err) return done(err);
  //console.log(info);

  console.log(info);

thisval = info;

console.log(thisval.streams[0]["codec_name"]);

var message = [
    "fileInfo",
    info,
    ];
process.send(message);

process.exit()

});


//

}



});