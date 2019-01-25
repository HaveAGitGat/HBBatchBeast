function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}


//SET ENV
process.env.NODE_ENV = "production";





var fs = require('fs');
var workerNumber = "1";

var preset = fs.readFileSync("./Config/presetString.txt", 'utf8');

var customPresets = fs.readFileSync("./Config/customPreset.txt", 'utf8');


queueNumberPath = "./Config/Processes/queueNumberPath.txt";
sourcePath = "./Config/Processes/sourceQueue.txt";
destinationPath = "./Config/Processes/destinationQueue.txt"
destinationPathFinal = "./Config/Processes/destinationFinalQueue.txt"


//var handBrakeCLIPath = __dirname + "\\HandBrakeCLI.exe";



if(process.platform=='win32'){

    var stringProcessingSlash ="\\";
            }
    
            if(process.platform=='linux'){
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






if(process.platform=='win32'){

    if(process.env.NODE_ENV == 'production'){

        //production
var handBrakeCLIPath = "\"" +fullPath2+"\"" ;

    }else{

        //development
var handBrakeCLIPath = "\"" +  __dirname + "/HandBrakeCLI.exe\"";

    }

}

if(process.platform=='linux'){
    //development && //production
var handBrakeCLIPath = "HandBrakeCLI -i \""


}


//check to see if bat option enabled
if(fs.existsSync("./Config/customBatPath.txt")){

    var batOnOff  = fs.readFileSync("./Config/customBatPath.txt", 'utf8');

}


var globalQueueNumber;
var currentLineNumber = 0;




var iStreamSource = fs.readFileSync(sourcePath, 'utf8')
iStreamSource = iStreamSource.toString().split("\n");
var iStreamDestination = fs.readFileSync(destinationPath, 'utf8')
iStreamDestination = iStreamDestination.toString().split("\n");

var tempFolderSected = fs.readFileSync("./Config/tempDestinationOnOff.txt", 'utf8');



if (tempFolderSected == "1") {

var iStreamDestinationFinal = fs.readFileSync(destinationPathFinal, 'utf8');
iStreamDestinationFinal = iStreamDestinationFinal.toString().split("\n");
}

console.log(iStreamSource.length)

for (var i = 0; i < iStreamSource.length - 1; i++) {

// sleep(((2000 * Math.random())));


// 

var currentSourceLine = iStreamSource[i];
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

fs.writeFileSync("./Config/Processes/WorkerStatus/Worker"+workerNumber+"FileName.txt", currentDestinationLine, 'utf8');


fs.writeFileSync("./Config/Processes/WorkerStatus/Worker"+workerNumber+"QueueNumber.txt", globalQueueNumber, 'utf8');




if(process.platform=='win32'){

    fs.writeFileSync("./Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".bat",  handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');

    }
    
    if(process.platform=='linux'){

        fs.writeFileSync("./Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber +".sh", "HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset, 'utf8');        

    }
    



//run bat file

if(process.platform=='win32'){

    if(process.env.NODE_ENV == 'production'){

        //production
var workerpath = fullPath+ "/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".bat";



 }else{

            //development
var workerpath = __dirname + "/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".bat";

  }


    }
    
    if(process.platform=='linux'){

        if(process.env.NODE_ENV == 'production'){

                    //production
//var workerpath = fullPath+ "/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".sh";
var workerpath = "./Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".sh";

        }else{

            //development
        var workerpath = __dirname + "/Config/Processes/BatchFiles/HandbrakeCLIBatchTemp" + workerNumber + ".sh";


        }
    }


  //  workerpath=  workerpath.replace(/ /g, '\\');

  if(process.platform=='win32'){

  workerpath= "\""+ workerpath+"\"";

  }




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

console.log(workerpath)



console.log(batOnOff)
    if(batOnOff != ""){

      var path = batOnOff;
      path = "\""+path+"\""

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

    }






fs.appendFileSync("./Config/Processes/WorkerStatus/completedQueue.txt",globalQueueNumber+"\n", 'utf8');



///
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





        if (tempFolderSected == "1") {

            try {
            

                fs.renameSync(currentDestinationLine, currentDestinationFinalLine)


            } catch (err) {
                //     fso.DeleteFile(currentDestinationLine)
              //  sleep(((1000 * Math.random()) + 1000));
        

                fs.renameSync(currentDestinationLine, currentDestinationFinalLine)


            }

            fs.appendFileSync("./Logs/fileConversionLog.txt", today2 + "-" + timenow + "--------Converted----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n", 'utf8');
      

           

        }else{
            fs.appendFileSync("./Logs/fileConversionLog.txt", today2 + "-" + timenow + "--------Converted----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset+"\r\n", 'utf8');
        }


        currentLineNumber++;

//  if (currentLineNumber == globalQueueNumber) {


} else{

currentLineNumber++;
}


}//end for istreamsource length


fs.writeFileSync("./Config/Processes/WorkerStatus/Worker" + workerNumber + "FileName.txt", "Complete!", 'utf8');
fs.writeFileSync("./Config/Processes/WorkerStatus/Worker" + workerNumber + "QueueNumber.txt", "Complete!", 'utf8');

