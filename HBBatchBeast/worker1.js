//SET ENV
//process.env.NODE_ENV = "production";

var shell = require('shelljs');

var mv = require('mv');



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


var  moveCorruptFileOnOff;
var  corruptDestinationPath;

var mode

var shellThreadModule;



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
 "exitThread"               
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





var workerCommand="";

if(process.platform=='win32'){

  
workerCommand =handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;

//workerCommand =" /Low"+handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;



    }
    
    if(process.platform == 'linux' ){
    //workerCommand ="HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

   // workerCommand ='nice -n 20 HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" ' + preset;


    workerCommand ="nice -n 20 HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

    //20 low priority, 0 = default = highest priority (without sudo)

    //nice -n -20

//workerCommand ='HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" ' + preset;
    }


      if( process.platform == 'darwin'){


 //workerCommand ="/usr/local/bin/HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

 workerCommand ="/usr/local/bin/HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;


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

            var shellThreadExitCode

            var errorLogFull =""


            var path = require("path");
            var childProcess = require("child_process");
            var shellThreadPath = "worker2.js"


 
// Send ipc to state shell processing is starting
var message = [
workerNumber,
"processing",
globalQueueNumber,
"Running"
];
process.send(message);
//



if(skipOrCopy==1){


   if(copyOnOff==true){



    // currentSourceLine + "\" -o \"" + currentDestinationLine
    //mv(currentDestinationLine, currentDestinationFinalLine


    if (tempFolderSected == "1") {

        try {
         
           const fs = require('fs');
           fs.copyFileSync(currentSourceLine,currentDestinationFinalLine);

           copySuccess();

         } catch (err) { 
             copyFail();

        
         }

        }else{

           try {

                const fs = require('fs');
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
        "skipped",
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
    homePath+"/HBBatchBeast/Logs/Worker"+workerNumber+"ConsoleOutput.txt",
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

var mesage2 = message.split(",");

if (mesage2[0] == "Exit") {

    shellThreadModule="";

console.log('shellThreadExited:', mesage2[1]);

shellThreadExitCode = mesage2[1];


//// exit code begin


if (shellThreadExitCode != 0) {


if (shellThreadExitCode == "Cancelled") {

   var message = [
workerNumber,
"cancelled",
globalQueueNumber,
preset,
errorLogFull
];
process.send(message);


}else{

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

    
    var mv = require('mv');
    mv(currentSourceLine, corruptDestinationPath, function(err) {
    
        });
    
    
    
    
    
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


var message = [
workerNumber,
"appendRequest",
homePath+"/HBBatchBeast/Logs/healthyFileList.txt",
currentSourceLine+"\n",
];
process.send(message);


}






if(errorSwitch==0){














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
          

            //  fs.renameSync(currentDestinationLine, currentDestinationFinalLine)


mv(currentDestinationLine, currentDestinationFinalLine, function(err) {
// done. it tried fs.rename first, and then falls back to
// piping the source file to the dest file and then unlinking
// the source file.
});



          } catch (err) {
      
      
           try{
         
      mv(currentDestinationLine, currentDestinationFinalLine, function(err) {
// done. it tried fs.rename first, and then falls back to
// piping the source file to the dest file and then unlinking
// the source file.
});   


      
     }catch(err){}


         }

          if(errorSwitch==0){



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

          
   


         
          }
         

      }else{

          if(errorSwitch==0){

            
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


    
         

           }
      }


// check to see if should delete source files
if (deleteSourceFilesOnOff == "1") {
              
if(errorSwitch==0){
         if (fs.existsSync(currentSourceLine)) {

fs.unlinkSync(currentSourceLine)


                      }
}
} 

//check to see if original file should be replaced if new file is smaller

if (replaceOriginalFile == true) {


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

if(newFinalFileSize < originalFileSize){

    var mv = require('mv');
  mv(currentDestinationFinalLine, currentSourceLine, function(err) {});

  var message = [
    workerNumber,
    "originalReplaced",
    globalQueueNumber,
    preset,
    errorLogFull
    ];
    process.send(message);

}{

    var message = [
        workerNumber,
        "originalNotReplaced",
        globalQueueNumber,
        preset,
        errorLogFull
        ];
        process.send(message);



}


  }else{

    var mv = require('mv');

      if(newFileSize < originalFileSize){
          mv(currentDestinationLine, currentSourceLine, function(err) {

          });  


          
          
          var message = [
            workerNumber,
            "originalReplaced",
            globalQueueNumber,
            preset,
            errorLogFull
            ];
            process.send(message);
        
        }else{

            var message = [
                workerNumber,
                "originalNotReplaced",
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








process.exit();

}

});

