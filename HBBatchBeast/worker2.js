function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}


//SET ENV
//process.env.NODE_ENV = "production";


var home = require("os").homedir();

if (process.platform == 'win32'||process.platform == 'linux') {

var homePath = "."

    
}

if (process.platform == 'darwin'){

    var homePath = home

}






var fs = require('fs');
var workerNumber = "2";

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

console.log(fullPath)

//fullPath = fullPath.slice(0,fullPath.lastIndexOf('\\'));
//fullPath = fullPath.slice(0,fullPath.lastIndexOf('\\'));
fullPath = fullPath.slice(0,fullPath.lastIndexOf(stringProcessingSlash));
fullPath = fullPath.slice(0,fullPath.lastIndexOf(stringProcessingSlash));

var fullPath2 = fullPath+ "\\HandBrakeCLI.exe"


console.log(fullPath2)

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


var globalQueueNumber;
var currentLineNumber = 0;




var iStreamSource = fs.readFileSync(sourcePath, 'utf8')
iStreamSource = iStreamSource.toString().split("\n");
var iStreamDestination = fs.readFileSync(destinationPath, 'utf8')
iStreamDestination = iStreamDestination.toString().split("\n");

var tempFolderSected = fs.readFileSync(homePath+"/HBBatchBeast/Config/tempDestinationOnOff.txt", 'utf8');



if (tempFolderSected == "1") {

var iStreamDestinationFinal = fs.readFileSync(destinationPathFinal, 'utf8');
iStreamDestinationFinal = iStreamDestinationFinal.toString().split("\n");
}

console.log(iStreamSource.length)

for (var i = 0; i < iStreamSource.length - 1; i++) {

// sleep(((2000 * Math.random())));


// 

var currentSourceLine = iStreamSource[i].split(",,,");
currentSourceLine=currentSourceLine[0];
preset=iStreamSource[i].split(",,,");
preset = preset[1];


var currentDestinationLine = iStreamDestination[i];

if (tempFolderSected == "1") {
var currentDestinationFinalLine = iStreamDestinationFinal[i];
}

var  globalQueueNumber=  fs.readFileSync(queueNumberPath, 'utf8');

//   console.log("Currentline:"+currentLineNumber)
//  console.log("Global queue:"+globalQueueNumber)
if (currentLineNumber == globalQueueNumber) {

// console.log(globalQueueNumber)

globalQueueNumber++;

fs.writeFileSync(queueNumberPath, globalQueueNumber, 'utf8');

fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"FileName.txt", currentDestinationLine, 'utf8');


fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker"+workerNumber+"QueueNumber.txt", globalQueueNumber, 'utf8');




if(process.platform=='win32'){

    fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".bat",  handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');

    }
    
    if(process.platform == 'linux' ){

        fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".sh", "HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');        

    }


      if( process.platform == 'darwin'){



      

 fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".sh", "/usr/local/bin/HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');        



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

 fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/temp.txt",workerpath+" \n", 'utf8');  


try{
require('child_process').execSync( workerpath , function (err, stdout, stderr) {
if (err) {
// Ooops.
//console.log(stderr);
//console.log("Error with worker number:"+workerNumber);
return console.log(err);
}

// Done.
//runEndSection();
//runScan();
console.log(stdout);
});


}catch(err){

    fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",currentSourceLine+" ConversionError\n", 'utf8');

     fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/temp.txt",err+" \n", 'utf8');


    if (tempFolderSected == "1") {
        fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n", 'utf8');
      

    }else{

        fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n", 'utf8');
        



    }

    errorSwitch=1;


}


//fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",globalQueueNumber+"\n", 'utf8');


if(errorSwitch==0){

    fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/completedQueue.txt",currentSourceLine+" Success\n", 'utf8');
}







console.log(workerpath)



console.log(batOnOff)
    if(batOnOff != ""){

      var path = batOnOff;
      path = "\""+path+"\""


      try{
      require('child_process').execSync( path , function (err, stdout, stderr) {
        if (err) {
        // Ooops.
        //console.log(stderr);
        //console.log("Error with worker number:"+workerNumber);
        return console.log(err);
        }
        
        // Done.
        //runEndSection();
        //runScan();
        console.log(stdout);
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

            fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------Converted----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n", 'utf8');
      
            }
           

        }else{

            if(errorSwitch==0){
            fs.appendFileSync(homePath+"/HBBatchBeast/Logs/fileConversionLog.txt",today2 + "-" + timenow + "--------Converted----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n", 'utf8');
            }
        }


 
  if (deleteSourceFilesOnOff == "1") {
                
if(errorSwitch==0){
           if (fs.existsSync(currentSourceLine)) {

fs.unlinkSync(currentSourceLine)


                        }
}
  } 


        currentLineNumber++;

//  if (currentLineNumber == globalQueueNumber) {


} else{

currentLineNumber++;
}


}//end for istreamsource length


fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "FileName.txt", "Complete!", 'utf8');
fs.writeFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Worker" + workerNumber + "QueueNumber.txt", "Complete!", 'utf8');

