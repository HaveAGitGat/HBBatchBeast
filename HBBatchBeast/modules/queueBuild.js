// process.on('error', function (error) {
//     process.send({ error: error.message || error });
// });


process.on('uncaughtException', function (err) {
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

var minimumFileSizeOnOff
var minimumFileSize
var maximumFileSizeOnOff
var maximumFileSize

var fsextra = require('fs-extra')
var fs = require('fs');



var inputPathArray = [];
var outputPathArray = [];
var sourceQueueArray = [];

var skipOrCopyArray = [];

var replaceOriginalFile;


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
var presetArray3 = [];
var presetArray = [];


var destinationQueueArray = [];
var destinationFinalQueueArray = [];













process.on('message', (queueInfoBomb) => {






    if (queueInfoBomb[0] == "queueInfoBomb") {


        var message = [
            "consoleMessage",
            "File scanner received info",
        ];
        process.send(message);
    




        inputPathStemArray = queueInfoBomb[1]
        outPutPathStemArray = queueInfoBomb[2]
        outPutPathStemFinalArray = queueInfoBomb[3]


        //

        //   document.getElementById("selectTemporaryConversionFolder").checked=queueInfoBomb[3]

        tempConversionFolderCheckedOnOff = queueInfoBomb[4]




        //document.getElementById("includedFileTypes").value=queueInfoBomb[4]
        supportedFileTypeArrayImport = queueInfoBomb[5]


        //document.getElementById("container").options[document.getElementById("container").selectedIndex].text=queueInfoBomb[5]
        containerType = queueInfoBomb[6]



        mode = queueInfoBomb[7]

        presetArray = queueInfoBomb[8]

        titleWordFilterArrayImport = queueInfoBomb[9]

        replaceOriginalFile = queueInfoBomb[10]

        minimumFileSizeOnOff = queueInfoBomb[11]
        minimumFileSize = queueInfoBomb[12]

        maximumFileSizeOnOff = queueInfoBomb[13]
        maximumFileSize = queueInfoBomb[14]





        var home = require("os").homedir();


        if (process.platform == 'win32' || process.platform == 'linux') {

            var homePath = "."


        }

        if (process.platform == 'darwin') {

            var homePath = home

        }





        if (mode == "healthCheck") {


            var healthyFileArray = "";
            healthyFileArray = fs.readFileSync(homePath + "/HBBatchBeast/Logs/healthyFileList.txt", 'utf8');
            healthyFileArray = healthyFileArray.toString().split("\n");

        }


        if (mode != "healthCheck") {


            var replacedFileArray = "";
            replacedFileArray = fs.readFileSync(homePath + "/HBBatchBeast/Logs/originalFileReplacedList.txt", 'utf8');
            replacedFileArray = replacedFileArray.toString().split("\n");

        }









        // folder loop begin 
        for (var y = 0; y < inputPathStemArray.length; y++) {



            inputPathStem = inputPathStemArray[y]   // input folder path with comma:  /path/to/folder,
            outPutPathStem = outPutPathStemArray[y]

            if (tempConversionFolderCheckedOnOff == true) {
                outPutPathStemFinal = outPutPathStemFinalArray[y]
            }

            inputPathStemSplit = inputPathStem.split(','); // comma removed step 1:  /path/to/folder



            topFolder = inputPathStemSplit[inputPathStemSplit.length - 1] // comma removed step 2:  /path/to/folder

            topFolderCharLength = topFolder.length   //



            var path = require('path');

            try {
                traverseDir(inputPathStem);
            } catch (err) { }

            function traverseDir(inputPathStem) {


                fs.readdirSync(inputPathStem).forEach(file => {
                    let fullPath = path.join(inputPathStem, file);

                    try {
                        if (fs.lstatSync(fullPath).isDirectory()) {

                            try {
                                traverseDir(fullPath);
                            } catch (err) { }
                        } else {



                            var thisFile = fullPath + "" // path/to/folder/test.mp4

                            fileTypeSplit = thisFile.split('.');    // 
                            fileType = fileTypeSplit[fileTypeSplit.length - 1]   // mp4


                            //Here we define supported file types
                            var supportedFileTypeArray = supportedFileTypeArrayImport

                            supportedFileTypeArray = supportedFileTypeArray.split(',');

                            //Here we check to see if the current file being analysed contains a valid file type
                            var supportedFileSwitch = 0;


                            for (var j = 0; j < supportedFileTypeArray.length; j++) {

                                if (fileType.toLowerCase() == supportedFileTypeArray[j].toLowerCase()) {
                                    supportedFileSwitch = 1;
                                }

                            }





                            // compare against healthy file list


                            if (mode == "healthCheck") {
                                for (var j = 0; j < healthyFileArray.length; j++) {

                                    if (thisFile == healthyFileArray[j]) {
                                        supportedFileSwitch = 0;
                                    }
                                }
                            }

                            // compare against files already replaced list

                            if (mode != "healthCheck") {

                                if (replaceOriginalFile == true) {
                                    for (var j = 0; j < replacedFileArray.length; j++) {

                                        if (thisFile == replacedFileArray[j]) {
                                            supportedFileSwitch = 0;
                                        }
                                    }
                                }
                            }



                            // check if min/max file size is reached

                            if (mode != "healthCheck") {

                                if (minimumFileSizeOnOff == true || maximumFileSizeOnOff == true) {

                                    var singleFileSize = fs.statSync(thisFile)
                                    var singleFileSize = singleFileSize.size
                                    var fileSizeInGbytes = singleFileSize / 1000000.0;

                                    if (minimumFileSizeOnOff == true) {
                                        if (fileSizeInGbytes < minimumFileSize) {
                                            supportedFileSwitch = 0;
                                        }
                                    }

                                    if (maximumFileSizeOnOff == true) {
                                        if (fileSizeInGbytes > maximumFileSize) {
                                            supportedFileSwitch = 0;
                                        }
                                    }



                                }



                            }




                            //If the file type is valid, then process it

                            if (supportedFileSwitch == 1) {



                                //document.getElementById("files2").innerHTML += "<p>"+ thisFile+"<\p>";




                                //Here add the full file path to the inputPathArray
                                inputPathArray[inputPathArrayCounter] = thisFile + "";


                                // var message = [
                                //     "consoleMessage",
                                //     "Valid file found: "+thisFile+"",
                                // ];
                                // process.send(message);




                            

                                






                                if ((totalFileFoundCounter + 1) % 100 == 0) {

                                    // scanWindow.webContents.send('item:count', (totalFileFoundCounter + 1));

                                    var message = [
                                        "totalFiles",
                                        (totalFileFoundCounter + 1),
                                    ];
                                    process.send(message);

                                    var message = [
                                        "consoleMessage",
                                        "Valid files found:"+(totalFileFoundCounter + 1),
                                    ];
                                    process.send(message);



                                }


                                // ipcRenderer.send('item:count', (totalFileFoundCounter + 1));


                                totalFileFoundCounter++


                                var str = inputPathArray[inputPathArrayCounter];   // path/to/topfolder/subfolder/test.mp4


                                //str = str.substring(str.indexOf("topFolder") + topFolderCharLength + 1);

                                // str = str.substring(str.indexOf(topFolder));

                                str = str.substring(topFolderCharLength);       // /subfolder/test.mp4


                                if (process.platform == 'win32') {

                                    var stringProcessingSlash = "\\";
                                }

                                if (process.platform == 'linux' || process.platform == 'darwin') {
                                    var stringProcessingSlash = "/";
                                }

                                pointer = str.split(stringProcessingSlash);

                                filePathEnd = pointer[pointer.length - 1]   //     test.mp4

                                filePathEndFileType = filePathEnd.slice(0, filePathEnd.lastIndexOf('.'));   // test

                                if (filePathEnd.includes('.srt') || filePathEnd.includes('.SRT')) {

                                    subfilePath = filePathEndFileType + ".srt";   // "test" +".srt"

                                } else {

                                    subfilePath = filePathEndFileType + containerType;   // "test" +".mp4"


                                }



                                LongsubfilePath = str.slice(0, str.lastIndexOf(stringProcessingSlash)); //  path/to/folder

                                newsubfilePath = LongsubfilePath + stringProcessingSlash + subfilePath; // path/to/folder + "/" + "test.mp4"


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

                                        // var message = [
                                        //     "consoleMessage",
                                        //     "File does not exist: "+outputPathArrayFinal[inputPathArrayCounter] +"",
                                        // ];
                                        // process.send(message);
                                       

                                        fileNotExistsCounter++
                                    }
                                    //ELSE if temp folder unchecked
                                } else {



                                    //
                                    if (fs.existsSync(outputPathArray[inputPathArrayCounter])) {


                                    } else {

                                       
                                        // var message = [
                                        //     "consoleMessage",
                                        //     "File does not exist: "+outputPathArray[inputPathArrayCounter]+"",
                                        // ];
                                        // process.send(message);


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

                                            if (mode != "healthCheck") {


                                                shell.mkdir('-p', outputFolderPath);



                                            }

                                        } catch (err) { }

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

                                                if (mode != "healthCheck") {
                                                    shell.mkdir('-p', outputFolderPathFinal);

                                                }

                                            } catch (err) { }


                                            outputFolderPathFinalold = outputFolderPathFinal;

                                        }
                                    }
                                }


                                inputPathArrayCounter++;





                            } //end supported file switch




                        }  //end current file, go to next

                    } catch (err) { }
                });
            }
        }//end source folder loop




        //var currentWindowPath = window.location.pathname;
        //var currentFolderPath = currentWindowPath.substring(0, currentWindowPath.lastIndexOf('/'));

        var currentWindowPath = __filename;
        var currentFolderPath = __dirname;



        // var handBrakeCLIPath = fso.GetAbsolutePathName(homePath+'/HandBrakeCLI.exe');

        //var handBrakeCLIPath = fso.GetAbsolutePathName(homePath+'/HandBrakeCLI.exe');





        var message = [
            "consoleMessage",
            "Building queue",
        ];
        process.send(message);



        if (tempConversionFolderCheckedOnOff == true) {

            for (var i = 0; i < outputPathArray.length; i++) {

                try {

                    if (fs.existsSync(outputPathArrayFinal[i])) {

                    } else {

                       
                        presetArray3.push(presetArray2[i])
                        sourceQueueArray[sourceQueueArrayCounter] = inputPathArray[i]

                        if ((sourceQueueArrayCounter + 1) % 100 == 0) {
                            var message = [
                                "buildQueue",
                                (sourceQueueArrayCounter + 1),
                            ];
                            process.send(message);

                            var message = [
                                "consoleMessage",
                                "Building queue:"+(sourceQueueArrayCounter + 1),
                            ];
                            process.send(message);

                        }




                        if (mode != "healthCheck") {
                            // check if file should be filtered out
                            if (process.platform == 'win32') {

                                var stringProcessingSlash = "\\";
                            }

                            if (process.platform == 'linux' || process.platform == 'darwin') {
                                var stringProcessingSlash = "/";
                            }

                            if (inputPathArray[i].includes('.srt') || inputPathArray[i].includes('.SRT')) {

                                skipOrCopyArray[sourceQueueArrayCounter] = 1;

                            } else {
                                pointer = inputPathArray[i].split(stringProcessingSlash);

                                filePathEnd = pointer[pointer.length - 1]   //     test.mp4

                                filePathEndFileType = filePathEnd.slice(0, filePathEnd.lastIndexOf('.'));   // test


                                var titleWordFilterArray = titleWordFilterArrayImport

                                titleWordFilterArray = titleWordFilterArray.split(',');

                                for (var j = 0; j < titleWordFilterArray.length; j++) {

                                    if (titleWordFilterArray[j] != "") {
                                        if (filePathEndFileType.indexOf(titleWordFilterArray[j]) >= 0) {
                                            // supportedFileSwitch = 0;

                                            skipOrCopyArray[sourceQueueArrayCounter] = 1;

                                        }
                                    }
                                }

                            }


                        }












                        sourceQueueArrayCounter++
                        destinationQueueArray.push(outputPathArray[i])
                        destinationFinalQueueArray.push(outputPathArrayFinal[i])
                        writeNumber++;









                    }

                } catch (err) { }
            }//



        } else {


            for (var i = 0; i < outputPathArray.length; i++) {

                try {

                    if (fs.existsSync(outputPathArray[i])) {

                    } else {


                       

                        presetArray3.push(presetArray2[i])


                        sourceQueueArray[sourceQueueArrayCounter] = inputPathArray[i]



                        if ((sourceQueueArrayCounter + 1) % 100 == 0) {

                            var message = [
                                "buildQueue",
                                (sourceQueueArrayCounter + 1),
                            ];
                            process.send(message);
                            var message = [
                                "consoleMessage",
                                "Building queue:"+(sourceQueueArrayCounter + 1),
                            ];
                            process.send(message);

                        }

                        if (mode != "healthCheck") {

                            // check if file should be filtered out
                            if (process.platform == 'win32') {

                                var stringProcessingSlash = "\\";
                            }

                            if (process.platform == 'linux' || process.platform == 'darwin') {
                                var stringProcessingSlash = "/";
                            }

                            if (inputPathArray[i].includes('.srt') || inputPathArray[i].includes('.SRT')) {

                                skipOrCopyArray[sourceQueueArrayCounter] = 1;

                            } else {

                                pointer = inputPathArray[i].split(stringProcessingSlash);

                                filePathEnd = pointer[pointer.length - 1]   //     test.mp4

                                filePathEndFileType = filePathEnd.slice(0, filePathEnd.lastIndexOf('.'));   // test


                                var titleWordFilterArray = titleWordFilterArrayImport

                                titleWordFilterArray = titleWordFilterArray.split(',');

                                for (var j = 0; j < titleWordFilterArray.length; j++) {

                                    if (titleWordFilterArray[j] != "") {
                                        if (filePathEndFileType.indexOf(titleWordFilterArray[j]) >= 0) {
                                            // supportedFileSwitch = 0;

                                            skipOrCopyArray[sourceQueueArrayCounter] = 1;

                                        }
                                    }
                                }
                            }
                        }



                        sourceQueueArrayCounter++
                        destinationQueueArray.push(outputPathArray[i])
                        destinationFinalQueueArray.push(outputPathArrayFinal[i])
                        writeNumber++;

                    }

                } catch (err) { }
            }//



        }







       












        ////





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
            presetArray3,
            skipOrCopyArray,
            destinationQueueArray,
            destinationFinalQueueArray,
        ];
        process.send(message);



        var message = [
            "exitRequest",
        ];

        process.send(message);


        //process.exit();

    }

    if (queueInfoBomb[0] == "exitApproved") {
        process.exit();
    }


});





