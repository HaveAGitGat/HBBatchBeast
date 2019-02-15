// process.on('error', function (error) {
//     process.send({ error: error.message || error });
// });


process.on('uncaughtException', function(err){
   // console.error(err.stack);
    console.log(err.stack);

// var tempPath=homePath + '/HBBatchBeast/Logs/SystemErrorLog.txt'
// var tempMessage="Worker thread error: "+err.stack+"\r\n"
// process.send(workerNumber+",writeRequest,"+tempPath+","+tempMessage)


//  var message = [
// "writeRequest",
// homePath + '/HBBatchBeast/Logs/SystemErrorLog.txt',
// "Queue thread error: "+err.stack+"\r\n",
// ];
// process.send(message);


    process.exit();
});



//Global variables

var inputPathArrayCounter = 0;
var totalFileFoundCounter = 0;
var fileNotExistsCounter = 0;
var outputFolderPathold = "";
var sourceQueueArrayCounter = 0;
var writeNumber = 0;


        var inputPathArray = [];
        var outputPathArray = [];
        var sourceQueueArray = [];
        var errorArray = [];
        var sourceQueueFileSizeArray = []
        var outputPathArrayFinal = [];



     
        var outputFolderPathFinalold = "";

 
   
        var totalFileSize = 0;

        var errorCount = 0;
        var successfulCount = 0;

        var g;

        var outPutPathStem
        var outPutPathStemFinal

        var inputPathStem
        var inputPathStemSplit
        var topFolder
        var topFolderCharLength
        var programPath = ""

        var queueView = "enabled"
        var presetArray2 = [];
        var presetArray = [];


var sourceQueueArrayWrite="";
var destinationQueueArrayWrite="";
var destinationFinalQueueArrayWrite="";













process.on('message', (queueInfoBomb) => {






            inputPathStemArray=queueInfoBomb[0]
            outPutPathStemArray=queueInfoBomb[1]
            outPutPathStemFinalArray=queueInfoBomb[2]


//

         //   document.getElementById("selectTemporaryConversionFolder").checked=queueInfoBomb[3]

tempConversionFolderCheckedOnOff=queueInfoBomb[3]




//document.getElementById("includedFileTypes").value=queueInfoBomb[4]
            supportedFileTypeArrayImport=queueInfoBomb[4]


  //document.getElementById("container").options[document.getElementById("container").selectedIndex].text=queueInfoBomb[5]
            containerType=queueInfoBomb[5]



            mode=queueInfoBomb[6]

            presetArray = queueInfoBomb[7]


       


var home = require("os").homedir();


if (process.platform == 'win32'||process.platform == 'linux') {

var homePath = "."

    
}

if (process.platform == 'darwin'){

    var homePath = home

}







// folder loop begin 
for (var y = 0; y < inputPathStemArray.length; y++) {



inputPathStem = inputPathStemArray[y]
outPutPathStem = outPutPathStemArray[y]

if (tempConversionFolderCheckedOnOff == true) {
    outPutPathStemFinal = outPutPathStemFinalArray[y]
}

inputPathStemSplit = inputPathStem.split(',');



topFolder = inputPathStemSplit[inputPathStemSplit.length - 1]

topFolderCharLength = topFolder.length


var fs = require('fs');
var path = require('path');

try {
    traverseDir(inputPathStem);
} catch (err) {}

function traverseDir(inputPathStem) {


    fs.readdirSync(inputPathStem).forEach(file => {
        let fullPath = path.join(inputPathStem, file);

       try {
            if (fs.lstatSync(fullPath).isDirectory()) {

               try {
                    traverseDir(fullPath);
               } catch (err) {}
            } else {



                var thisFile = fullPath + ""

                fileTypeSplit = thisFile.split('.');
                fileType = fileTypeSplit[fileTypeSplit.length - 1]


                //Here we define supported file types
                var supportedFileTypeArray = supportedFileTypeArrayImport

                supportedFileTypeArray = supportedFileTypeArray.split(',');

                //Here we check to see if the current file being analysed contains a valid file type
                var supportedFileSwitch = 0;


                for (var j = 0; j < supportedFileTypeArray.length; j++) {

                    if (fileType == supportedFileTypeArray[j]) {
                        supportedFileSwitch = 1;
                    }

                }

                        

                //If the file type is valid, then process it

                if (supportedFileSwitch == 1) {

                  

                    //document.getElementById("files2").innerHTML += "<p>"+ thisFile+"<\p>";




                    //Here add the full file path to the inputPathArray
                    inputPathArray[inputPathArrayCounter] = thisFile + "";

   


                    //Write to file to state that file with valid format has been found

                   // fs.writeFileSync(homePath + '/HBBatchBeast/Config/totalFilesFound.txt', (totalFileFoundCounter + 1), 'utf8');

         






                    if((totalFileFoundCounter + 1)%100==0){

                   // scanWindow.webContents.send('item:count', (totalFileFoundCounter + 1));

var message = [
"totalFiles",
(totalFileFoundCounter + 1),
];
process.send(message);



                }


                   // ipcRenderer.send('item:count', (totalFileFoundCounter + 1));


                    totalFileFoundCounter++







                    var str = inputPathArray[inputPathArrayCounter];


                    str = str.substring(str.indexOf("topFolder") + topFolderCharLength + 1);


                    if (process.platform == 'win32') {

                        var stringProcessingSlash = "\\";
                    }

                    if (process.platform == 'linux' || process.platform == 'darwin') {
                        var stringProcessingSlash = "/";
                    }

                    pointer = str.split(stringProcessingSlash);

                    filePathEnd = pointer[pointer.length - 1]

                    filePathEndFileType = filePathEnd.slice(0, filePathEnd.lastIndexOf('.'));

                    subfilePath = filePathEndFileType + containerType;

                    LongsubfilePath = str.slice(0, str.lastIndexOf(stringProcessingSlash));

                    newsubfilePath = LongsubfilePath + stringProcessingSlash + subfilePath;


                    outputPathArray[inputPathArrayCounter] = outPutPathStem + newsubfilePath;
                    var outputFolderPath = outputPathArray[inputPathArrayCounter].substring(0, outputPathArray[inputPathArrayCounter].lastIndexOf(stringProcessingSlash));

                    //

                    presetArray2[inputPathArrayCounter] = presetArray[y]


                    
  

                    if (tempConversionFolderCheckedOnOff == true) {

                        outputPathArrayFinal[inputPathArrayCounter] = outPutPathStemFinal + newsubfilePath;
                        var outputFolderPathFinal = outputPathArrayFinal[inputPathArrayCounter].substring(0, outputPathArrayFinal[inputPathArrayCounter].lastIndexOf(stringProcessingSlash));

                    }


                    //if temp folder checked


                    if (tempConversionFolderCheckedOnOff == true) {




                        if (fs.existsSync(outputPathArrayFinal[inputPathArrayCounter])) {


                        } else {


                       //     fs.writeFileSync(homePath + '/HBBatchBeast/Config/unconvertedFilesFound.txt', (fileNotExistsCounter + 1), 'utf8');







                            fileNotExistsCounter++
                        }




                        //ELSE if temp folder unchecked
                    } else {

                       

                        //
                        if (fs.existsSync(outputPathArray[inputPathArrayCounter])) {


                        } else {

                        //    fs.writeFileSync(homePath + '/HBBatchBeast/Config/unconvertedFilesFound.txt', (fileNotExistsCounter + 1), 'utf8');



                            fileNotExistsCounter++

                        }
                        //

                    }


                    var shell = require('shelljs');



                    if (fs.existsSync(outputFolderPath)) {


                    } else {

                        if (outputFolderPath != outputFolderPathold) {
                            // fs.mkdirSync(outputFolderPath);


                            try {

                                if (mode == "scanandconvert") {
                                    shell.mkdir('-p', outputFolderPath);
                                }

                           } catch (err) {}

                            outputFolderPathold = outputFolderPath;
                        }

                    }


                    //AND if tempfolderchecked

                    if (tempConversionFolderCheckedOnOff == true) {


                        if (fs.existsSync(outputFolderPathFinal)) {

                        } else {

                            if (outputFolderPathFinal != outputFolderPathFinalold) {

                                //fs.mkdirSync(outputFolderPathFinal);

                                try {

                                    if (mode == "scanandconvert") {
                                        shell.mkdir('-p', outputFolderPathFinal);

                                    }

                                } catch (err) {}


                                outputFolderPathFinalold = outputFolderPathFinal;

                            }
                        }
                    }


                    inputPathArrayCounter++;





                } //end supported file switch




            }  //end current file, go to next

       } catch (err) {}
    });
}
}//end source folder loop




            //var currentWindowPath = window.location.pathname;
            //var currentFolderPath = currentWindowPath.substring(0, currentWindowPath.lastIndexOf('/'));

            var currentWindowPath = __filename;
            var currentFolderPath = __dirname;



            // var handBrakeCLIPath = fso.GetAbsolutePathName(homePath+'/HandBrakeCLI.exe');

            //var handBrakeCLIPath = fso.GetAbsolutePathName(homePath+'/HandBrakeCLI.exe');









            if (tempConversionFolderCheckedOnOff == true) {

                for (var i = 0; i < outputPathArray.length; i++) {

                    try {




                        if (fs.existsSync(outputPathArrayFinal[i])) {

                        } else {


                            //fs.appendFileSync(homePath + '/HBBatchBeast/Config/Processes/sourceQueue.txt', inputPathArray[i] + ",,," + presetArray2[i] + "\n", 'utf8');

 sourceQueueArrayWrite += inputPathArray[i] + ",,," + presetArray2[i] + "\n";





                            sourceQueueArray[sourceQueueArrayCounter] = inputPathArray[i]

                          //  fs.writeFileSync(homePath + '/HBBatchBeast/Config/totalFilesFoundSize.txt', "Building queue:" + (sourceQueueArrayCounter + 1), 'utf8');



                          if((sourceQueueArrayCounter + 1)%100==0){



                         // scanWindow.webContents.send('item:queueBuild', (sourceQueueArrayCounter + 1));

var message = [
"buildQueue",
(sourceQueueArrayCounter + 1),
];
process.send(message);
                
                        }


                            sourceQueueArrayCounter++




                       //     fs.appendFileSync(homePath + '/HBBatchBeast/Config/Processes/destinationQueue.txt', outputPathArray[i] + "\n", 'utf8');



destinationQueueArrayWrite += outputPathArray[i] + "\n";


                         //   fs.appendFileSync(homePath + '/HBBatchBeast/Config/Processes/destinationFinalQueue.txt', outputPathArrayFinal[i] + "\n", 'utf8');


 destinationFinalQueueArrayWrite +=outputPathArrayFinal[i] + "\n";




                            writeNumber++;

                        }

                   } catch (err) {}
                }//



            } else {


                for (var i = 0; i < outputPathArray.length; i++) {

                    try {

                        if (fs.existsSync(outputPathArray[i])) {

                        } else {

                           // fs.appendFileSync(homePath + '/HBBatchBeast/Config/Processes/sourceQueue.txt', inputPathArray[i] + ",,," + presetArray2[i] + "\n", 'utf8');



 sourceQueueArrayWrite += inputPathArray[i] + ",,," + presetArray2[i] + "\n";


                            sourceQueueArray[sourceQueueArrayCounter] = inputPathArray[i]

                          //  fs.writeFileSync(homePath + '/HBBatchBeast/Config/totalFilesFoundSize.txt', "Building queue:" + (sourceQueueArrayCounter + 1), 'utf8');

                   
                          if((sourceQueueArrayCounter + 1)%100==0){
//scanWindow.webContents.send('item:queueBuild', (sourceQueueArrayCounter + 1));

var message = [
"buildQueue",
(sourceQueueArrayCounter + 1),
];
process.send(message);

}



                            sourceQueueArrayCounter++

                         //   fs.appendFileSync(homePath + '/HBBatchBeast/Config/Processes/destinationQueue.txt', outputPathArray[i] + "\n", 'utf8');


destinationQueueArrayWrite +=outputPathArray[i] + "\n";

                         //   fs.appendFileSync(homePath + '/HBBatchBeast/Config/Processes/destinationFinalQueue.txt', outputPathArrayFinal[i] + "\n", 'utf8');



 destinationFinalQueueArrayWrite += outputPathArrayFinal[i] + "\n";



                            writeNumber++;

                        }

                   } catch (err) {}
                }//



            }



var message = [
"appendRequest",
homePath + '/HBBatchBeast/Config/Processes/sourceQueue.txt',
sourceQueueArrayWrite,
];
process.send(message);



var message = [
"appendRequest",
homePath + '/HBBatchBeast/Config/Processes/destinationQueue.txt',
destinationQueueArrayWrite,
];
process.send(message);


var message = [
"appendRequest",
homePath + '/HBBatchBeast/Config/Processes/destinationFinalQueue.txt',
destinationFinalQueueArrayWrite,
];
process.send(message);











////




 var message = [
"writeRequest",
homePath + '/HBBatchBeast/Config/totalFilesFound.txt',
(totalFileFoundCounter + 1),

];
process.send(message);


var message = [
"writeRequest",
homePath + '/HBBatchBeast/Config/unconvertedFilesFound.txt',
(fileNotExistsCounter),
];
process.send(message);






var message = [
"complete",
totalFileFoundCounter,
sourceQueueArray,
presetArray2,

];
process.send(message);


        });


