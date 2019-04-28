//SET ENV
if (__dirname.includes('.asar')) { // If dev
    process.env.NODE_ENV = "production";
  }


var shell = require('shelljs');





var home = require("os").homedir();


if (process.platform == 'win32'||process.platform == 'linux') {

var homePath = "."

    
}

if (process.platform == 'darwin'){

    var homePath = home

}

var fs = require('fs');


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}



//Log errors

function LogError(lineProcess){

//fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/ErrorLogs/Worker"+workerNumber+"ErrorLog.txt", lineProcess, 'utf8');   

//process.send(workerNumber+",appendRequest,"+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/ErrorLogs/Worker"+workerNumber+"ErrorLog.txt"+","+ lineProcess);

var message = [
workerNumber,
"appendRequest",
homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/ErrorLogs/Worker"+workerNumber+"ErrorLog.txt",
lineProcess,
];
process.send(message);

}




function consoleLog(lineProcess){
//fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Console/Worker"+workerNumber+"ConsoleLog.txt", lineProcess, 'utf8');  

//process.send(workerNumber+",appendRequest,"+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Console/Worker"+workerNumber+"ConsoleLog.txt"+","+ lineProcess);

var message = [
workerNumber,
"appendRequest",
homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Console/Worker"+workerNumber+"ConsoleLog.txt",
lineProcess,
];
process.send(message);


}



var preset="";

var customPresets = fs.readFileSync(homePath+"/HBBatchBeast/Config/customPreset.txt", 'utf8');



if(process.platform=='win32'){

    var stringProcessingSlash ="\\";
            }
    
            if(process.platform == 'linux' || process.platform == 'darwin'){
                var stringProcessingSlash ="/";
            }
    


var fullPath=__dirname;
fullPath = fullPath.slice(0,fullPath.lastIndexOf(stringProcessingSlash));
fullPath = fullPath.slice(0,fullPath.lastIndexOf(stringProcessingSlash));
var fullPath2 = fullPath+ "\\HandBrakeCLI.exe"




        // read whether to delete source files or not
 var deleteSourceFilesOnOff ="";

        if (fs.existsSync(homePath+"/HBBatchBeast/Config/deleteSourceFilesOnOff.txt")) {

         deleteSourceFilesOnOff = fs.readFileSync(homePath+"/HBBatchBeast/Config/deleteSourceFilesOnOff.txt", 'utf8');
  
        }



//handbrake CLI path


if(process.platform=='win32'){

    if(process.env.NODE_ENV == 'production'){

        //production
var handBrakeCLIPath = "\"" +fullPath2+"\"" ;

    }else{

        //development
var handBrakeCLIPath = "\"" +  __dirname + "/HandBrakeCLI.exe\"";

    }

}

if(process.platform == 'linux' || process.platform == 'darwin'){
    //development && //production
var handBrakeCLIPath = "HandBrakeCLI -i \""


}


//check to see if bat option enabled
if(fs.existsSync(homePath+"/HBBatchBeast/Config/customBatPath.txt")){

    var batOnOff  = fs.readFileSync(homePath+"/HBBatchBeast/Config/customBatPath.txt", 'utf8');

}



var iStreamSource = fs.readFileSync(homePath+"/HBBatchBeast/Config/Processes/sourceQueue.txt", 'utf8')
iStreamSource = iStreamSource.toString().split("\n");
var iStreamDestination = fs.readFileSync(homePath+"/HBBatchBeast/Config/Processes/destinationQueue.txt", 'utf8')
iStreamDestination = iStreamDestination.toString().split("\n");

var tempFolderSected = fs.readFileSync(homePath+"/HBBatchBeast/Config/tempDestinationOnOff.txt", 'utf8');



if (tempFolderSected == "1") {

var iStreamDestinationFinal = fs.readFileSync(homePath+"/HBBatchBeast/Config/Processes/destinationFinalQueue.txt", 'utf8');
iStreamDestinationFinal = iStreamDestinationFinal.toString().split("\n");
}




//Global variables

var workerNumber ;
var  globalQueueNumber;
var  skipOrCopy;
var  copyOnOff;
var  replaceOriginalFile;
var  replaceOriginalFileAlways;

var itemChecked;

var FFprobeVar="";


var fileFiltersIncludeArray
var fileFiltersExcludeArray

var includeAnyFilesWithProperties 
var includeAllFilesWithProperties
var excludeAnyFilesWithProperties 
var excludeAllFilesWithProperties 

var handBrakeMode
var FFmpegMode


var  moveCorruptFileOnOff;
var  corruptDestinationPath;

var runPriority;

var mode

var shellThreadModule;

var infoExtractModule;



process.on('uncaughtException', function(err){
    console.error(err.stack);

// var tempPath=homePath + '/HBBatchBeast/Logs/SystemErrorLog.txt'
// var tempMessage="Worker thread error: "+err.stack+"\r\n"
// process.send(workerNumber+",writeRequest,"+tempPath+","+tempMessage)


var message = [
workerNumber,
"appendRequest",
homePath + '/HBBatchBeast/Logs/SystemErrorLog.txt',
"Worker thread error: "+err.stack+"\r\n",
];
process.send(message);


    process.exit();
});



process.on('message', (m) => {

     // if(m.charAt(0) == "s"){

        if(m[0] == "suicide"){

if(process.platform=='win32'){
var killCommand = 'taskkill /PID '+process.pid+' /T /F'
}

if(process.platform=='linux'){
var killCommand = 'pkill -P ' + process.pid
}
if(process.platform=='darwin'){
var killCommand = 'pkill -P ' + process.pid
}


 if (shell.exec(killCommand).code !== 0) {

  shell.exit(1);
}

      }


 // if(m.charAt(0) == "e"){

    if(m[0] == "exitThread"){

var infoArray = [
 "exitThread",
 "itemCancelled",               
 ];     

try{


if(shellThreadModule != ""){
shellThreadModule.send(infoArray); 
}


}catch (err){}


  }


//if(m.charAt(0) == "w"){

    if(m[0] == "workerNumber"){


workerNumber =m[1];


//workerNumber =process.argv[2]



//process.send(workerNumber+",queueRequest");

var message = [
workerNumber,
"queueRequest",
];
process.send(message);

}




//workerNumber =m.substring(m.indexOf(":")+1);

 //if(m.charAt(0) == "q"){

    if(m[0] == "queueNumber"){
    




//globalQueueNumber=m.substring(m.indexOf(":")+1);

globalQueueNumber=m[1];

skipOrCopy = m[2];

copyOnOff = m[3];

replaceOriginalFile = m[4];


moveCorruptFileOnOff = m[5];
corruptDestinationPath = m[6];

mode =m[7];

if(m[8]==true){

    runPriority = 20;

}else{
    runPriority =0;
}

itemChecked =m[9];

fileFiltersIncludeArray = m[10]+"";
fileFiltersExcludeArray = m[11]+"";

replaceOriginalFileAlways = m[12];



includeAnyFilesWithProperties = m[13];
includeAllFilesWithProperties = m[14];
excludeAnyFilesWithProperties = m[15];
excludeAllFilesWithProperties = m[16];

 handBrakeMode = m[17];
 FFmpegMode = m[18];



//process.send(workerNumber+",processing,"+globalQueueNumber);



var currentLineNumber = globalQueueNumber;





//for (var i = 0; i <= globalQueueNumber; i++) {}


var currentSourceLine = iStreamSource[globalQueueNumber].split(",,,");
currentSourceLine=currentSourceLine[0];
preset=iStreamSource[globalQueueNumber].split(",,,");
preset = preset[1];


var currentDestinationLine = iStreamDestination[globalQueueNumber];

if (tempFolderSected == "1") {
var currentDestinationFinalLine = iStreamDestinationFinal[globalQueueNumber];
}















if (currentLineNumber == globalQueueNumber) {



var actionComplete=0
while(actionComplete==0){

 try{


// var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"FileName.txt"
// var tempMessage=currentDestinationLine
// process.send(workerNumber+",writeRequest,"+tempPath+","+tempMessage);  

var message = [
workerNumber,
"writeRequest",
homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"FileName.txt",
currentDestinationLine,
];
process.send(message);

//fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"FileName.txt", currentDestinationLine, 'utf8');



actionComplete=1;
}catch(err){
}
}



var actionComplete=0
while(actionComplete==0){

 try{
//fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"QueueNumber.txt", globalQueueNumber, 'utf8');
// var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"QueueNumber.txt"
// var tempMessage=globalQueueNumber
// process.send(workerNumber+",writeRequest,"+tempPath+","+tempMessage); 


var message = [
workerNumber,
"writeRequest",
homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"QueueNumber.txt",
globalQueueNumber,
];
process.send(message);


actionComplete=1;
}catch(err){
}
}



if(process.env.NODE_ENV == 'production'){
var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

}else{

var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');

}


var workerCommand="";

if(process.platform=='win32'){


if(handBrakeMode==true){

    workerCommand =handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;

}else if(FFmpegMode==true){

    workerCommand =ffmpegPath + " -i \"" + currentSourceLine + "\" "+preset+" \"" + currentDestinationLine + "\" " ;


}
    }
    
    if(process.platform == 'linux' ){
    //workerCommand ="HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

   // workerCommand ='nice -n 20 HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" ' + preset;

   if(handBrakeMode==true){

    workerCommand ="nice -n "+runPriority+" HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

}else if(FFmpegMode==true){

    workerCommand =ffmpegPath + " -i \"" + currentSourceLine + "\" "+preset+" \"" + currentDestinationLine + "\" " ;

}




    

    //20 low priority, 0 = default = highest priority (without sudo)

    //nice -n -20

//workerCommand ='HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" ' + preset;
    }


      if( process.platform == 'darwin'){


 //workerCommand ="/usr/local/bin/HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

 
 if(handBrakeMode==true){
workerCommand ="/usr/local/bin/HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;
}else if(FFmpegMode==true){
workerCommand =ffmpegPath + " -i \"" + currentSourceLine + "\" "+preset+" \"" + currentDestinationLine + "\" " ;
}



      }
    





  var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        today = dd + '/' + mm + '/' + yyyy;
        today2 = dd + '-' + mm + '-' + yyyy;

        var d = new Date(),
            h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
            m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
        timenow = h + '-' + m + '-' + s;



  var errorSwitch=0;
  


 ////


             var infoArray = [
 "processFile",                
 workerCommand
 ];


            var fs = require('fs');

           

            var errorLogFull =""


            var path = require("path");
            var childProcess = require("child_process");
           


 
// Send ipc to state shell processing is starting
var message = [
workerNumber,
"processing",
globalQueueNumber,
"Running"
];
process.send(message);
//




if(itemChecked == false){

    var message = [
        workerNumber,
        "Skipped: Not selected",
        globalQueueNumber,
        "Skip",
        errorLogFull
        ];
        process.send(message);


 var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
 if (f == "1") {
      
var message = [
workerNumber,
"queueRequest",
];
process.send(message);
        } else if (f == "0"){
        }




}else if(skipOrCopy==1){


   if(copyOnOff ==true ||  currentSourceLine.includes('.srt') || currentSourceLine.includes('.SRT') ){
    // currentSourceLine + "\" -o \"" + currentDestinationLine
    if (tempFolderSected == "1") {

        try {
         
           var fs = require('fs');
           fs.copyFileSync(currentSourceLine,currentDestinationFinalLine);

           copySuccess();

         } catch (err) { 
             copyFail();

        
         }

        }else{

           try {

                var fs = require('fs');
                fs.copyFileSync(currentSourceLine,currentDestinationLine);

                copySuccess();




           }catch (err) {
               
            copyFail(); 
        
        }
        
        
        
      



          


        }

function copySuccess(){
    var message = [
        workerNumber,
        "copied",
        globalQueueNumber,
        "Copy",
        errorLogFull
        ];
        process.send(message);


        if (deleteSourceFilesOnOff == "1") {
                
   
            if (fs.existsSync(currentSourceLine)) {
    
    fs.unlinkSync(currentSourceLine)
    
    
    } 
    }



}


function copyFail(){
        var message = [
            workerNumber,
            "copiedFail",
            globalQueueNumber,
            "Copy",
            errorLogFull
            ];
            process.send(message);

        }

endCyle();

   } else{

    var message = [
        workerNumber,
        "Skipped: File title word filter",
        globalQueueNumber,
        "Skip",
        errorLogFull
        ];
        process.send(message);


        endCyle();

   }

function endCyle(){


        
        //process.send(workerNumber+",queueRequest");
        
                    var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
                    if (f == "1") {
                  
        var message = [
        workerNumber,
        "queueRequest",
        ];
        process.send(message);
                    } else if (f == "0"){
                    }

                }
             


}else{


  


    infoExtractModule = childProcess.fork(path.join(__dirname, 'mediaAnalyser.js' ),[], { silent: true });

    var extractCommand = [
        "analyseThis",
        currentSourceLine,
        ];

    infoExtractModule.send(extractCommand); 




    infoExtractModule.on('message', function (message) {

   
       if (message[0] == "fileInfo") {





      var jsonInfo =message[1]
       
    //jsonInfo.streams[0]["codec_name"]

    // var messageJSON = [
    //     "jsonInfo",
    //     jsonInfo,
    //     jsonInfo.streams[0]["codec_name"],
    
    //     ];
    //     process.send(messageJSON);



        var filterReason="";


        // var messageJSON = [
        //     "fileFiltersIncludeArray",
        //     fileFiltersIncludeArray,
        //     ];
        //     process.send(messageJSON);
       
        var JSONBomb ="";

        if (mode == "healthCheck") {
            
            try{
            
                for (var i = 0; i < jsonInfo.streams.length; i++) {
                    Object.keys(jsonInfo.streams[i]).forEach(function(key) {
                       // JSONBomb += key+": '"+jsonInfo.streams[i][key]+"' \n"
                    });
                }
                
          

            var message = [
                workerNumber,
                "FFPROBE",
                globalQueueNumber,
                "OK",
                currentSourceLine,
        
             
                ];
                process.send(message);
                

        }catch(err){

   

            var message = [
                workerNumber,
                "FFPROBE",
                globalQueueNumber,
                "Fail",
                currentSourceLine,
              
             
                ];
                process.send(message);



        }






            var processFileY = true


        }else if(includeAnyFilesWithProperties == true || includeAllFilesWithProperties ==true){

            try{
     
        var processFileY = false
        var validateArray = []
        filterReason = "Excluded, does not meet 'Include' conditions"
       
       

     //   fileFiltersIncludeArray = "codec_name: 'h264',"

        fileFiltersIncludeArray = fileFiltersIncludeArray.split(',');

        
        for (var i = 0; i < jsonInfo.streams.length; i++) {
        Object.keys(jsonInfo.streams[i]).forEach(function(key) {

         


                for (var j = 0; j < fileFiltersIncludeArray.length; j++) {


                    // var messageJSON = [
                    //     "jsonInfo",
                    //     key+": '"+jsonInfo.streams[i][key]+"'",
                    //     "filter",
                    //     fileFiltersIncludeArray[j],
                    //     ];
                    //     process.send(messageJSON);







            if( fileFiltersIncludeArray[j].includes(key+": '"+jsonInfo.streams[i][key]+"'")){

                processFileY = true
                filterReason = "Include: "+key+": '"+jsonInfo.streams[i][key]+"' "
                validateArray.push(true)


            }
        }
         //   console.log(key, obj[key]);
            });
        }

        if(includeAllFilesWithProperties ==true){
            if((validateArray.length+1) == fileFiltersIncludeArray.length ){
                processFileY = true
            }else{
                processFileY = false
            }
        }



        var message = [
            workerNumber,
            "FFPROBE",
            globalQueueNumber,
            "OK",
            currentSourceLine,
           
         
            ];
            process.send(message);


    }catch(err){
        
        var message = [
            workerNumber,
            "FFPROBE",
            globalQueueNumber,
            "Fail",
            currentSourceLine,
           
         
            ];
            process.send(message);

        var processFileY = true
    }

}else if(excludeAnyFilesWithProperties == true || excludeAllFilesWithProperties ==true){

        try{


        var processFileY = true  

        var validateArray = []
     //   fileFiltersExcludeArray = "codec_name: 'h264',codec_name: 'aac'"

     // codec_name: 'h264',codec_name: 'aac',channel_layout: 'stereo',codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10'
        fileFiltersExcludeArray = fileFiltersExcludeArray.split(',');


        for (var i = 0; i < jsonInfo.streams.length; i++) {
        Object.keys(jsonInfo.streams[i]).forEach(function(key) {
   

            // var messageJSON = [
            //     "jsonInfo",
            //     key,
            //     jsonInfo.streams[i][key] 
            //     ];
            //     process.send(messageJSON);


                for (var j = 0; j < fileFiltersExcludeArray.length; j++) {
            if(fileFiltersExcludeArray[j].includes(key+": '"+jsonInfo.streams[i][key]+"'")){

                processFileY = false
                filterReason += "Exclude: "+key+": '"+jsonInfo.streams[i][key]+"' "
                validateArray.push(true)


            }
        }
         //   console.log(key, obj[key]);
            });
        }

    

        if(excludeAllFilesWithProperties ==true){
            if((validateArray.length+1) == fileFiltersExcludeArray.length ){
                processFileY = false
            }else{
                processFileY = true
            }
        }

        

        var message = [
            workerNumber,
            "FFPROBE",
            globalQueueNumber,
            "OK",
            currentSourceLine,
      
         
            ];
            process.send(message);


    }catch(err){


        var message = [
            workerNumber,
            "FFPROBE",
            globalQueueNumber,
            "Fail",
            currentSourceLine,
       
         
            ];
            process.send(message);

        var processFileY = true
    }

}else{

    try{
            
        for (var i = 0; i < jsonInfo.streams.length; i++) {
            Object.keys(jsonInfo.streams[i]).forEach(function(key) {
               
            });
        }
        
  

    var message = [
        workerNumber,
        "FFPROBE",
        globalQueueNumber,
        "OK",
        currentSourceLine,
       
     
        ];
        process.send(message);

}catch(err){


    var message = [
        workerNumber,
        "FFPROBE",
        globalQueueNumber,
        "Fail",
        currentSourceLine,
       
     
        ];
        process.send(message);



}


        processFileY = true

    }

        








        



//jsonInfo.streams[0]["codec_name"] == "h264"

   
     if(processFileY == true){

    
        processFile();






     }else{

        if(copyOnOff==true){
            // currentSourceLine + "\" -o \"" + currentDestinationLine
            if (tempFolderSected == "1") {
        
                try {
                 
                   var fs = require('fs');
                   fs.copyFileSync(currentSourceLine,currentDestinationFinalLine);
        
                   copySuccess();
        
                 } catch (err) { 
                     copyFail();
        
                
                 }
        
                }else{
        
                   try {
        
                        var fs = require('fs');
                        fs.copyFileSync(currentSourceLine,currentDestinationLine);
        
                        copySuccess();
        
        
        
        
                   }catch (err) {
                       
                    copyFail(); 
                
                }
                
                
                
              
        
        
        
                  
        
        
                }
        
        function copySuccess(){
            var message = [
                workerNumber,
                "copied",
                globalQueueNumber,
                "Copy",
                errorLogFull
                ];
                process.send(message);
        
        
                if (deleteSourceFilesOnOff == "1") {
                        
           
                    if (fs.existsSync(currentSourceLine)) {
            
            fs.unlinkSync(currentSourceLine)
            
            
            } 
            }
        
        
        
        }
        
        
        function copyFail(){
                var message = [
                    workerNumber,
                    "copiedFail",
                    globalQueueNumber,
                    "Copy",
                    errorLogFull
                    ];
                    process.send(message);
        
                }
        
        endCyle();
        
           } else{
        
            var message = [
                workerNumber,
                "Skipped: File property filter:"+filterReason,
                globalQueueNumber,
                "Skip",
                errorLogFull
                ];
                process.send(message);
        
        
                endCyle();
        
           }
        
        function endCyle(){
        
        
                
                //process.send(workerNumber+",queueRequest");
                var fs = require('fs');
                
                            var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
                            if (f == "1") {
                          
                var message = [
                workerNumber,
                "queueRequest",
                ];
                process.send(message);
                            } else if (f == "0"){
                            }
        
                        }
                     


        




    }

    function processFile(){

        //
        
        
        
                    var path = require("path");
                    var childProcess = require("child_process");
                    var shellThreadPath = "worker2.js"
        
        //
        
        
            shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath ),[], { silent: true });
              // var shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath ));


         
        
        
                            shellThreadModule.send(infoArray); 
        
               shellThreadModule.stdout.on('data', function(data) {    
                  //  console.log('stdoutWorker: ' + data);
        
        
        
        //log console output to text file
        
        var str =""+data;
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/Worker"+workerNumber+"ConsoleOutput.txt",
        str,
        //currentSourceLine+" ConversionError\n",
        ];
        process.send(message);
        
        
        
        
        // send percentage update to GUI
        
        
        
        
         if(str.includes("%")){
           if(str.length>=7){
           n = str.indexOf("%");
        
        
        
        if(n >=6){
        
        var output = str.substring(n-6,n+1)
        
        console.log(output)
        var message = [
        workerNumber,
        "percentage",
        globalQueueNumber,
        output
        ];
        process.send(message);
        
        
        }
        
           }
         }
        
        
           if(str.includes("Exit code:")){
        
        //console.log(str)
        
           }
        
        
        if(str.includes("stderr:")){
        
        
           }
        
          });
        
               shellThreadModule.stderr.on('data', function(data) {
                   // console.log('stderrorWorker: ' + data);
        
        var str =""+data;
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/Worker"+workerNumber+"ConsoleOutputError.txt",
        str,
        //currentSourceLine+" ConversionError\n",
        ];
        process.send(message);
        
                   errorLogFull  += data;
        
        
        
        
                      });
        
        
             
        
               shellThreadModule.on("exit", function (code,) {
                 //  console.log('shellThreadExited:', code,);
        
               });
        
        
        shellThreadModule.on('message', function (message) {
        
        if (message.error) {
        console.error(message.error);
        }
        
        //var message2 = message.split(",");
        
        
        
        if (message[0] == "Exit") {
        
        shellThreadModule="";
        
        console.log('shellThreadExited:', message[1]);
        
        
        
        
        //// exit code begin

                
        var fs = require('fs');

        if(mode != "healthCheck" && !fs.existsSync(currentDestinationLine)){

            errorLogFull  += "\n HBBB ALERT: NO OUTPUT FILE PRODUCED";

            var message = [
                workerNumber,
                "error",
                globalQueueNumber,
                preset,
                errorLogFull
                ];
                process.send(message);
        
        
   
        } else if (message[1] != 0 ) {

       
        
        
        if (message[1] == "Cancelled") {
        
        var message = [
        workerNumber,
        "cancelled",
        globalQueueNumber,
        preset,
        errorLogFull
        ];
        process.send(message);
        
        
        }else {
        
        if (mode == "healthCheck") {                
        
           if(moveCorruptFileOnOff == true){
        
        
             //  currentSourceLine  corruptDestinationPath
        
             if (process.platform == 'win32') {
        
               var stringProcessingSlash = "\\";
           }
        
           if (process.platform == 'linux' || process.platform == 'darwin') {
               var stringProcessingSlash = "/";
           }
        
           pointer = currentSourceLine.split(stringProcessingSlash);  
           filePathEnd = pointer[pointer.length - 1]   //     test.mp4
        
        
           corruptDestinationPath = corruptDestinationPath +stringProcessingSlash +filePathEnd;
        
        
        var fs = require('fs-extra')
               fs.moveSync(currentSourceLine, corruptDestinationPath, { overwrite: true })
        
        
           }
        
        
        }
        
        
        var message = [
        workerNumber,
        "error",
        globalQueueNumber,
        preset,
        errorLogFull
        ];
        process.send(message);
        
        
        
        
        
        
        
        
        }
        
        
        
        
        
        
        
        
        
        
 
        
        
        
        
        
        
        
        
        
        
        LogError("Worker"+workerNumber+" error executing shell"+"\r\n")
        
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        //fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",currentSourceLine+" ConversionError\n", 'utf8');
        
        // var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt"
        // var tempMessage=currentSourceLine+" ConversionError\n"
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",
        currentSourceLine+" ConversionError\n",
        ];
        process.send(message);
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        //   fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueError.txt","Error\n", 'utf8');
        
        // var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueError.txt"
        // var tempMessage="Error\n"
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueError.txt",
        "Error\n",
        ];
        process.send(message);
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        //  fs.appendFileSync(homePath+"/HBBatchBeast/Logs/ErrorLog.txt",today2 + "-" + timenow + "---Health---check--ERROR----------" + currentSourceLine + "\r\n", 'utf8');
        
        // var tempPath=homePath+"/HBBatchBeast/Logs/ErrorLog.txt"
        // var tempMessage=today2 + "-" + timenow + "---Health---check--ERROR----------" + currentSourceLine + "\r\n"
        
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/ErrorLog.txt",
        today2 + "-" + timenow + "---Health---check--ERROR----------" + currentSourceLine + "\r\n"+errorLogFull+ "\r\n",
        ];
        process.send(message);
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        if (tempFolderSected == "1") {
        
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        //  fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n", 'utf8');
        
        
        // var tempPath=homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"
        // var tempMessage=today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n"
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",
        today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n"+errorLogFull+ "\r\n",
        ];
        process.send(message);
        
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        
         
        
        }else{
        
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        // fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n", 'utf8');  
        
        // var tempPath=homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"
        // var tempMessage=today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n"
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",
        today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n"+errorLogFull+ "\r\n",
        ];
        process.send(message);
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        
        
          
        
        
        
        }
        
        errorSwitch=1;
        
        
        // shell.echo('Failed');
        //shell.exit(1);
        
        //process.send(workerNumber+",error,"+globalQueueNumber+","+preset);
        
        
        }else{

 if (mode == "healthCheck") {    
        
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/healthyFileList.txt",
        currentSourceLine+"\n",
        ];
        process.send(message);

    }
        
        
       // }
        
        
        
        
        
        
       // if(errorSwitch==0){
        

        
        
        
        
        
        
        
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        //   fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",currentSourceLine+" Success\n", 'utf8');
        
        // var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt"
        // var tempMessage=currentSourceLine+" Success\n"
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",
        currentSourceLine+" Success\n",
        ];
        process.send(message);
        
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        
        // fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueSuccess.txt","Success\n", 'utf8');
        
        // var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueSuccess.txt"
        // var tempMessage="Success\n";
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueSuccess.txt",
        "Success\n",
        ];
        process.send(message);
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        
        
        
        
        // process.send(workerNumber+",success,"+globalQueueNumber+","+preset);
        
        
        
        if(batOnOff != ""){
        
        var path = batOnOff;
        path = "\""+path+"\""
        
        
        try{
        require('child_process').execSync( path , function (err, stdout, stderr) {
         if (err) {
         // Ooops.
        
         return console.log(err);
         }
         
         // Done.
         //runEndSection();
         //runScan();
        
         });
        }catch(err){}
        
        }
        
        
        
        
         if (tempFolderSected == "1") {
        
            try {
             
        
               // dont use fs.renameSync(currentDestinationLine, currentDestinationFinalLine)
        
        var fs = require('fs-extra')
        fs.moveSync(currentDestinationLine, currentDestinationFinalLine, { overwrite: true })
        
        
        
        
             } catch (err) {
         
         
              try{
        
                  var fs = require('fs-extra')
        fs.moveSync(currentDestinationLine, currentDestinationFinalLine, { overwrite: true })
        
        
        
         
        }catch(err){}
        
        
            }
        
          //   if(errorSwitch==0){
        
        
        
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        //fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n", 'utf8');
        
        // var tempPath=homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"
        // var tempMessage=today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n"
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",
        today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n",
        ];
        process.send(message);
        
        
        
        actionComplete=1;
        }catch(err){
        }
        }
        
             
        
        
        
            
        //     }
            
        
         }else{
        
             //if(errorSwitch==0){
        
               
        var actionComplete=0
        while(actionComplete==0){
        
        try{
        //fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n", 'utf8');
        
        // var tempPath=homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"
        // var tempMessage=today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n"
        // process.send(workerNumber+",appendRequest,"+tempPath+","+tempMessage );
        
        
        var message = [
        workerNumber,
        "appendRequest",
        homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",
        today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n",
        ];
        process.send(message);
        
        
        
        actionComplete=1;
        }catch(err){
        }
        }
        
        
        
            
        
             // }
         }
        
        
        // check to see if should delete source files
        if (deleteSourceFilesOnOff == "1") {
                 
       // if(errorSwitch==0){
        var fs = require('fs');
            if (fs.existsSync(currentSourceLine)) {
        
        fs.unlinkSync(currentSourceLine)
        
        
                         }
      //  }
        } 
        
        //check to see if original file should be replaced if new file is smaller
        
        
        
        
        if (mode != "healthCheck") {
        
        
        
        
        if (replaceOriginalFile == true  || replaceOriginalFileAlways == true) {
        
        
        var fs = require('fs');
        
        if (fs.existsSync(currentSourceLine)) {
         var originalFileSize = fs.statSync(currentSourceLine)
             originalFileSize=originalFileSize.size
        }
        
        if (fs.existsSync(currentDestinationLine)) {
         var newFileSize = fs.statSync(currentDestinationLine)
             newFileSize=newFileSize.size
        }
        
        if (fs.existsSync(currentDestinationFinalLine)) {
         var newFinalFileSize = fs.statSync(currentDestinationFinalLine)
             newFinalFileSize=newFinalFileSize.size
        }
        
        
        
        
        if (tempFolderSected == "1") {
        
        if(newFinalFileSize < originalFileSize || replaceOriginalFileAlways == true){
        
        
        try{
            //

            var containerType =currentDestinationFinalLine.slice(currentDestinationFinalLine.lastIndexOf('.'),currentDestinationFinalLine.length );
        
             var fileName =currentSourceLine.slice(0, currentSourceLine.lastIndexOf('.'));
     
             var newCurrentSourceLine = fileName+""+containerType
     
     
             var fs = require('fs');
     
                 fs.unlinkSync(currentSourceLine)
     
             
             var fs = require('fs-extra')
             fs.moveSync(currentDestinationFinalLine, newCurrentSourceLine, { overwrite: true })
            


            //
        
        
        //var fs = require('fs-extra')
        //fs.moveSync(currentDestinationFinalLine, currentSourceLine, { overwrite: true })
        
        
        var message = [
        workerNumber,
        "Original replaced",
        globalQueueNumber,
        preset,
        errorLogFull
        ];
        process.send(message);
        
        }catch(err){
        
        //    var message = [
        //    workerNumber,
        //    "originalNotReplaced",
        //    globalQueueNumber,
        //    preset,
        //    errorLogFull
        //    ];
        //    process.send(message);

        errorLogFull  += "\n HBBB ALERT: Error replacing original file";

        var message = [
            workerNumber,
            "error",
            globalQueueNumber,
            preset,
            errorLogFull
            ];
            process.send(message);
        
        
        }
        
        
        
        
        }else{

           var message = [
            workerNumber,
            "Original not replaced: New file is larger",
            globalQueueNumber,
            preset,
            errorLogFull
            ];
            process.send(message);
        
        
        
        }
        
        
        }else{
        
        
        
         if(newFileSize < originalFileSize || replaceOriginalFileAlways == true){
        
        
        try{
        
        //  var fs = require('fs');
        //dont use fs.renameSync(currentDestinationLine, currentSourceLine) 
        
        var containerType =currentDestinationLine.slice(currentDestinationLine.lastIndexOf('.'),currentDestinationLine.length );


       //outputPathArray.length

        
        var fileName =currentSourceLine.slice(0, currentSourceLine.lastIndexOf('.'));

        var newCurrentSourceLine = fileName+""+containerType

        // var message = [
        //     "New:"+newCurrentSourceLine,
        //     ];
        //     process.send(message);

        var fs = require('fs');

            fs.unlinkSync(currentSourceLine)

        
        var fs = require('fs-extra')
        fs.moveSync(currentDestinationLine, newCurrentSourceLine, { overwrite: true })
        

        
             
             
             var message = [
               workerNumber,
               "Original replaced",
               globalQueueNumber,
               preset,
               errorLogFull
               ];
               process.send(message);
        
        }catch(err){
        
            errorLogFull  += "\n HBBB ALERT: Error replacing original file";

            var message = [
                workerNumber,
                "error",
                globalQueueNumber,
                preset,
                errorLogFull
                ];
                process.send(message);
        
        }
             
        
           
           }else{
        
               var message = [
                   workerNumber,
                   "Original not replaced: New file is larger",
                   globalQueueNumber,
                   preset,
                   errorLogFull
                   ];
                   process.send(message);
        
        
        
           }
        
        
        
        
         }
        
        
         var message = [
           workerNumber,
           "appendRequest",
           homePath+"/HBBatchBeast/Logs/originalFileReplacedList.txt",
           currentSourceLine+"\n",
           ];
           process.send(message);
        
        
        
         
        }else{
        
        var message = [
           workerNumber,
           "success",
           globalQueueNumber,
           preset,
           errorLogFull
           ];
           process.send(message);
        
        
        }
        
        }else{
        
        var message = [
           workerNumber,
           "success",
           globalQueueNumber,
           preset,
           errorLogFull
           ];
           process.send(message);
        
        
        }
        
        
        
        
   
        } 
        
        
        
        
        
        
        
        
        
        var fs = require('fs');
        var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
        
        
        if (f == "1") {
        
        var message = [
        workerNumber,
        "queueRequest",
        ];
        process.send(message);
        
        } else if (f == "0"){
        
        
        }
        
        
        
        
        
        
        
        
        
        
        /// exit finish
        
        }
        
        
        
               });
        
           }
        
    



     

        }


        });

        }








 //////




}

} 


//


//if(m.charAt(0) == "c"){

    if(m[0] == "completed"){



var actionComplete=0
while(actionComplete==0){

 try{
//fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "FileName.txt", "Complete!", 'utf8');

// var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "FileName.txt"
// var tempMessage="Complete!"
// process.send(workerNumber+",writeRequest,"+tempPath+","+tempMessage);


var message = [
workerNumber,
"writeRequest",
homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "FileName.txt",
"Complete!",
];
process.send(message);


actionComplete=1;
}catch(err){
}
}



var actionComplete=0
while(actionComplete==0){

 try{
//fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "QueueNumber.txt", "Complete!", 'utf8');

// var tempPath=homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "QueueNumber.txt"
// var tempMessage="Complete!"
// process.send(workerNumber+",writeRequest,"+tempPath+","+tempMessage);


var message = [
workerNumber,
"writeRequest",
homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "QueueNumber.txt",
"Complete!",
];
process.send(message);


actionComplete=1;
}catch(err){
}
}




var message = [
    workerNumber,
    "exitRequest",
    ];
    
process.send(message);






}


if(m[0] == "exitApproved"){

    process.exit();

}



});



