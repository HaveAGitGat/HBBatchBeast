
//global variable


process.on('message', (infoArray) => {




if(infoArray[0]=="analyseThis"){


//var workerCommand = infoArray[1];


var filepath = infoArray[1]

process.env.NODE_ENV = "production";

  
if(process.platform=='win32'){

var stringProcessingSlash ="\\";
        }

        if(process.platform == 'linux' || process.platform == 'darwin'){
            var stringProcessingSlash ="/";
        }

  var ffprobe = require('ffprobe'),
  ffprobeStatic = require('ffprobe-static');
  var path = require("path");

  var ffprobeStaticPath = ''

if(process.platform=='win32'){

if(process.env.NODE_ENV == 'production'){

    //production
var fullPath=__dirname;
fullPath = fullPath.slice(0,fullPath.lastIndexOf(stringProcessingSlash));
fullPath = fullPath.slice(0,fullPath.lastIndexOf(stringProcessingSlash));
ffprobeStaticPath = fullPath+ "\\ffprobe.exe"

}else{

    //development
    ffprobeStaticPath = require('ffprobe-static').path

}

}

if(process.platform == 'linux' || process.platform == 'darwin'){

  if(process.env.NODE_ENV == 'production'){
//development && //production
var handBrakeCLIPath = "HandBrakeCLI -i \""

  }else{


  }


}

    var thisval
 
ffprobe(filepath, { path: ffprobeStaticPath }, function (err, info) {
  //if (err) return done(err);

  if (err){
    var message = [
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
