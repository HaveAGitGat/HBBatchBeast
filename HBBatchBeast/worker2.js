//SET ENV
//process.env.NODE_ENV = "production";

var shell = require('shelljs');



var home = require("os").homedir();


if (process.platform == 'win32'||process.platform == 'linux') {

var homePath = "."

    
}

if (process.platform == 'darwin'){

    var homePath = home

}

var fs = require('fs');

//Global variables

var workerNumber ;
var  globalQueueNumber;




process.on('message', (m) => {


   // consoleLog("Here")


if(m.charAt(0) == "w"){
workerNumber =m.substring(m.indexOf(":")+1);
//workerNumber =process.argv[2]

console.log(workerNumber)

process.send(workerNumber);

}




//workerNumber =m.substring(m.indexOf(":")+1);

if(m.charAt(0) == "q"){



globalQueueNumber=m.substring(m.indexOf(":")+1);




function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}






 consoleLog("Here")

 //var home = require("os").homedir();
//var homePath = "."



//var workerNumber = fs.readFileSync(homePath+"/HBBatchBeast/Config/workerLaunch.txt", 'utf8');



//Log errors

function LogError(lineProcess){

fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/ErrorLogs/Worker"+workerNumber+"ErrorLog.txt", lineProcess, 'utf8');   

}


function consoleLog(lineProcess){
fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Console/Worker"+workerNumber+"ConsoleLog.txt", lineProcess, 'utf8');   
}

//LogError("Init")

//var preset = fs.readFileSync(homePath+"/HBBatchBeast/Config/presetString.txt", 'utf8');

var preset="";

var customPresets = fs.readFileSync(homePath+"/HBBatchBeast/Config/customPreset.txt", 'utf8');


queueNumberPath = homePath+"/HBBatchBeast/Config/Processes/queueNumberPath.txt";
sourcePath = homePath+"/HBBatchBeast/Config/Processes/sourceQueue.txt";
destinationPath = homePath+"/HBBatchBeast/Config/Processes/destinationQueue.txt"
destinationPathFinal = homePath+"/HBBatchBeast/Config/Processes/destinationFinalQueue.txt"


//var handBrakeCLIPath = __dirname + "\\HandBrakeCLI.exe";



if(process.platform=='win32'){

    var stringProcessingSlash ="\\";
            }
    
            if(process.platform == 'linux' || process.platform == 'darwin'){
                var stringProcessingSlash ="/";
            }
    


var fullPath=__dirname;



//fullPath = fullPath.slice(0,fullPath.lastIndexOf('\\'));
//fullPath = fullPath.slice(0,fullPath.lastIndexOf('\\'));
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



var currentLineNumber = globalQueueNumber;




var iStreamSource = fs.readFileSync(sourcePath, 'utf8')
iStreamSource = iStreamSource.toString().split("\n");
var iStreamDestination = fs.readFileSync(destinationPath, 'utf8')
iStreamDestination = iStreamDestination.toString().split("\n");

var tempFolderSected = fs.readFileSync(homePath+"/HBBatchBeast/Config/tempDestinationOnOff.txt", 'utf8');



if (tempFolderSected == "1") {

var iStreamDestinationFinal = fs.readFileSync(destinationPathFinal, 'utf8');
iStreamDestinationFinal = iStreamDestinationFinal.toString().split("\n");
}



for (var i = 0; i <= globalQueueNumber; i++) {


var currentSourceLine = iStreamSource[i].split(",,,");
currentSourceLine=currentSourceLine[0];
preset=iStreamSource[i].split(",,,");
preset = preset[1];


var currentDestinationLine = iStreamDestination[i];

if (tempFolderSected == "1") {
var currentDestinationFinalLine = iStreamDestinationFinal[i];
}


}//end for istreamsource length

// 




//

// try{

// var  globalQueueNumber=  fs.readFileSync(queueNumberPath, 'utf8');

// }catch(err){
// LogError("Worker"+workerNumber+" error reading from "+queueNumberPath +"\r\n")
// }





consoleLog(currentLineNumber)
consoleLog(globalQueueNumber)

if (currentLineNumber == globalQueueNumber) {



// globalQueueNumber++;



// try{
// fs.writeFileSync(queueNumberPath, globalQueueNumber, 'utf8');
// }catch(err){
// LogError("Worker"+workerNumber+" error writing to "+queueNumberPath +"\r\n")
// }


try{
fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"FileName.txt", currentDestinationLine, 'utf8');
}catch(err){
    LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"FileName.txt"+"\r\n")
 }


try{
fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"QueueNumber.txt", globalQueueNumber, 'utf8');
}catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"QueueNumber.txt"+"\r\n")
}




var workerCommand="";

if(process.platform=='win32'){

   // fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".bat",  handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');
workerCommand =handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;


    }
    
    if(process.platform == 'linux' ){

    //    fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".sh", "HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');        

workerCommand ="HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;

    }


      if( process.platform == 'darwin'){



      

 // fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".sh", "/usr/local/bin/HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');        
workerCommand ="/usr/local/bin/HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset


      }
    



//run bat file

if(process.platform=='win32'){

    if(process.env.NODE_ENV == 'production'){

        //production
var workerpath = fullPath+ "/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".bat";



 }else{

            //development
var workerpath = __dirname + "/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".bat";

  }


    }
    
    if(process.platform == 'linux' || process.platform == 'darwin'){

        if(process.env.NODE_ENV == 'production'){

                    //production
//var workerpath = fullPath+ "/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".sh";
var workerpath = homePath+"/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".sh";

        }else{

            //development
        var workerpath = __dirname + "/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".sh";


        }
    }


  //  workerpath=  workerpath.replace(/ /g, '\\');

  if(process.platform=='win32'  || process.platform == 'darwin'){

  workerpath= "\""+ workerpath+"\"";

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
  

try{
 fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/temp.txt",workerpath+" \n", 'utf8'); 
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/temp.txt"+"\r\n")
  }

 

//const { stdout, stderr, code } = sh.exec(workerCommand, { silent: true }

//if (shell.exec(workerCommand).code !== 0) {

if (shell.exec(workerCommand).code !== 0) {


    LogError("Worker"+workerNumber+" error executing shell"+"\r\n")

  
    try{
 fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",currentSourceLine+" ConversionError\n", 'utf8');
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt"+"\r\n")
  }
    try{
    fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueError.txt","Error\n", 'utf8');
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueError.txt"+"\r\n")
  }
    try{
     fs.appendFileSync(homePath+"/HBBatchBeast/Logs/ErrorLog.txt",today2 + "-" + timenow + "---Health---check--ERROR----------" + currentSourceLine + "\r\n", 'utf8');
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Logs/ErrorLog.txt"+"\r\n")
  }

   





    if (tempFolderSected == "1") {

          try{
  fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n", 'utf8');
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"+"\r\n")
  }
      

    }else{

          try{
   fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n", 'utf8');  
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"+"\r\n")
  }

       



    }

    errorSwitch=1;


  shell.echo('Failed');
  //shell.exit(1);
}





if(errorSwitch==0){

      try{
    fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",currentSourceLine+" Success\n", 'utf8');
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt"+"\r\n")
  }

    try{
   fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueSuccess.txt","Success\n", 'utf8');
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueueSuccess.txt"+"\r\n")
  }


 
}












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












///





        if (tempFolderSected == "1") {

            try {
            

                fs.renameSync(currentDestinationLine, currentDestinationFinalLine)


            } catch (err) {
                //     fso.DeleteFile(currentDestinationLine)
              //  sleep(((1000 * Math.random()) + 1000));
        
              try{
                fs.renameSync(currentDestinationLine, currentDestinationFinalLine)
            }catch(err){}


            }

            if(errorSwitch==0){

                  try{
 fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n", 'utf8');
      
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"+"\r\n")
  }

           
            }
           

        }else{

            if(errorSwitch==0){

                  try{
fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n", 'utf8');
           
  }catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Logs/fileConversionLog.txt"+"\r\n")
  }
             }
        }


 
  if (deleteSourceFilesOnOff == "1") {
                
if(errorSwitch==0){
           if (fs.existsSync(currentSourceLine)) {

fs.unlinkSync(currentSourceLine)


                        }
}
  } 





} 


process.send(workerNumber);

}

});

try{
fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "FileName.txt", "Complete!", 'utf8');
}catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "FileName.txt"+"\r\n")
}



try{
fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "QueueNumber.txt", "Complete!", 'utf8');
}catch(err){
LogError("Worker"+workerNumber+" error writing to "+homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "QueueNumber.txt"+"\r\n")
}
