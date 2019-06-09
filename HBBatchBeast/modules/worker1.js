//Log errors

"use strict";



function updateConsole(workerNumber, text) {

    var message = [
        workerNumber,
        "consoleMessage",
        text,
    ];
    process.send(message);
}

process.on('uncaughtException', function (err) {
    console.error(err.stack);

    updateConsole(workerNumber, ":" + err.stack)





    process.exit();
});

//console.log(randomvariable)


//SET ENV
if (__dirname.includes('.asar')) { // If dev
    process.env.NODE_ENV = "production";
}


var shell = require('shelljs');
var home = require("os").homedir();



if (process.platform == 'win32' || process.platform == 'linux') {

    var homePath = home
    // var homePath = "."
}

if (process.platform == 'darwin') {

    var homePath = home
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}









if (process.platform == 'win32') {

    global.stringProcessingSlash = "\\";
}

if (process.platform == 'linux' || process.platform == 'darwin') {
    global.stringProcessingSlash = "/";
}






//Global variables
var fs = require('fs');
var fsextra = require('fs-extra')
var path = require("path");

var workerNumber;
var globalQueueNumber;
var skipOrCopy;
var copyOnOff;
var replaceOriginalFile;
var replaceOriginalFileAlways;

var itemChecked;



var fileFiltersIncludeArray
var fileFiltersExcludeArray

var includeAnyFilesWithProperties
var includeAllFilesWithProperties
var excludeAnyFilesWithProperties
var excludeAllFilesWithProperties

var handBrakeMode
var FFmpegMode


var moveCorruptFileOnOff;
var corruptDestinationPath;


var mode

var shellThreadModule;
var repair_worker

var infoExtractModule;

var frameCount
var deleteSourceFilesOnOff
var batOnOff

var tempFolderSelected
var currentDestinationLine
var currentDestinationFinalLine


var currentSourceLine
var preset


var minimumFileSizeOnOff
var minimumFileSize
var maximumFileSizeOnOff
var maximumFileSize

var runThoroughHealthCheck

var errorLogFull
var source_file_length

var sourceFileContainer
var currentDestinationLine_unmodified
var currentDestinationFinalLine_unmodified

var repairFile

var repairCRFValue

var handBrakeCLIPath
var ffmpegPath



// var message = [
//     "workerOnline",
// ];
// process.send(message);

workerNumber = process.argv[2]

//workerNumber =process.argv[2]
var message = [
    workerNumber,
    "queueRequest",
];
process.send(message);
updateConsole(workerNumber, "Worker online. Requesting item")



process.on('message', (m) => {



    if (m[0] == "suicide") {

        updateConsole(workerNumber, "Stop command received. Closing sub-processes")

        if (process.platform == 'win32') {
            var killCommand = 'taskkill /PID ' + process.pid + ' /T /F'
        } else if (process.platform == 'linux') {
            var killCommand = 'pkill -P ' + process.pid
        } else if (process.platform == 'darwin') {
            var killCommand = 'pkill -P ' + process.pid
        }

        if (shell.exec(killCommand).code !== 0) {
            shell.exit(1);
        }

    }




    if (m[0] == "exitThread") {

        updateConsole(workerNumber, "Cancelling")

        var infoArray = [
            "exitThread",
            "itemCancelled",
        ];

        try {


            if (shellThreadModule != "") {
                shellThreadModule.send(infoArray);
            }


        } catch (err) { }

        try {


            if (repair_worker != "") {
                repair_worker.send(infoArray);
            }


        } catch (err) { }

        repair_worker


    }


    // if (m[0] == "workerNumber") {


    //     workerNumber = m[1];

    //     //workerNumber =process.argv[2]
    //     var message = [
    //         workerNumber,
    //         "queueRequest",
    //     ];
    //     process.send(message);
    //     updateConsole(workerNumber, "Requesting item")
    // }


    if (m[0] == "queueNumber") {






        //globalQueueNumber=m.substring(m.indexOf(":")+1);

        globalQueueNumber = m[1];
        skipOrCopy = m[2];
        copyOnOff = m[3];
        replaceOriginalFile = m[4];
        moveCorruptFileOnOff = m[5];
        corruptDestinationPath = m[6];
        mode = m[7];
        itemChecked = m[9];
        fileFiltersIncludeArray = m[10] + "";
        fileFiltersExcludeArray = m[11] + "";
        replaceOriginalFileAlways = m[12];
        includeAnyFilesWithProperties = m[13];
        includeAllFilesWithProperties = m[14];
        excludeAnyFilesWithProperties = m[15];
        excludeAllFilesWithProperties = m[16];
        handBrakeMode = m[17];
        FFmpegMode = m[18];
        deleteSourceFilesOnOff = m[19];
        batOnOff = m[20];
        tempFolderSelected = m[21];
        currentSourceLine = m[22];
        preset = m[23];
        currentDestinationLine = m[24];
        currentDestinationFinalLine = m[25];

        minimumFileSizeOnOff = m[26]
        minimumFileSize = m[27]
        maximumFileSizeOnOff = m[28]
        maximumFileSize = m[29]
        runThoroughHealthCheck = m[30]
        repairFile = m[31]
        repairCRFValue = m[32]
        handBrakeCLIPath = m[33]
        ffmpegPath = m[34]




        updateConsole(workerNumber, "Received item:" + currentSourceLine)




        sourceFileContainer = currentSourceLine.split('.')
        sourceFileContainer = sourceFileContainer[sourceFileContainer.length - 1]

        currentDestinationLine_unmodified = currentDestinationLine.split('.')
        currentDestinationLine_unmodified[currentDestinationLine_unmodified.length - 1] = sourceFileContainer
        currentDestinationLine_unmodified = currentDestinationLine_unmodified.join('.')


        try {
            currentDestinationFinalLine_unmodified = currentDestinationFinalLine.split('.')
            currentDestinationFinalLine_unmodified[currentDestinationFinalLine_unmodified.length - 1] = sourceFileContainer
            currentDestinationFinalLine_unmodified = currentDestinationFinalLine_unmodified.join('.')

        } catch (err) { }


        //






        if (mode == "healthCheck") {
            deleteSourceFilesOnOff = false
        }




        if (mode == "healthCheck") {


            if (runThoroughHealthCheck) {
                handBrakeMode = false;
                FFmpegMode = true;

            } else {
                handBrakeMode = true;
                FFmpegMode = false;
            }
        }

        var presetSplit
        presetSplit = preset.split(',')
        var workerCommand = "";

        if (process.platform == 'win32' && handBrakeMode == true) {
            workerCommand = handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;
        } else if (process.platform == 'win32' && FFmpegMode == true) {
            workerCommand = ffmpegPath + " " + presetSplit[0] + " -i \"" + currentSourceLine + "\" " + presetSplit[1] + " \"" + currentDestinationLine + "\" "

        }

        if (process.platform == 'linux' && handBrakeMode == true) {
            workerCommand = "HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;
        } else if (process.platform == 'linux' && FFmpegMode == true) {
            workerCommand = ffmpegPath + " " + presetSplit[0] + " -i '" + currentSourceLine + "' " + presetSplit[1] + " '" + currentDestinationLine + "' "

        }

        if (process.platform == 'darwin' && handBrakeMode == true) {
            workerCommand = "/usr/local/bin/HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;
        } else if (process.platform == 'darwin' && FFmpegMode == true) {
            workerCommand = ffmpegPath + " " + presetSplit[0] + " -i '" + currentSourceLine + "' " + presetSplit[1] + " '" + currentDestinationLine + "' "
        }







        errorLogFull = ""
        errorLogFull += "Command: \n\n"
        errorLogFull += workerCommand + "\n\n"

        var childProcess = require("child_process");

        // Send ipc to state shell processing is starting
        var message = [
            workerNumber,
            "processing",
            globalQueueNumber,
            "Running"
        ];
        process.send(message);

        if (itemChecked == false) {

            var message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/CommandList.txt",
                workerCommand + "\n",
                //currentSourceLine+" ConversionError\n",
            ];
            process.send(message);

            var message = [
                workerNumber,
                "Skipped: Not selected",
                globalQueueNumber,
                "Skip",
                errorLogFull
            ];
            process.send(message);

            updateConsole(workerNumber, "Skipped: Not selected - " + currentSourceLine)

            checkifQueuePause();


        } else if (skipOrCopy == 1) {

            if (copyOnOff == true || currentSourceLine.includes('.srt') || currentSourceLine.includes('.SRT')) {
                // currentSourceLine + "\" -o \"" + currentDestinationLine
                if (tempFolderSelected == true) {

                    try {

                        updateConsole(workerNumber, "Copying file:" + currentSourceLine + " to " + currentDestinationFinalLine_unmodified)

                        fs.copyFileSync(currentSourceLine, currentDestinationFinalLine_unmodified);
                        updateConsole(workerNumber, "Copy successful:" + currentSourceLine + " to " + currentDestinationFinalLine_unmodified)
                        copySuccess();
                    } catch (err) {
                        updateConsole(workerNumber, "Copy failed:" + currentSourceLine + " to " + currentDestinationFinalLine_unmodified)
                        copyFail();
                    }
                } else {
                    try {

                        updateConsole(workerNumber, "Copying file:" + currentSourceLine + " to " + currentDestinationLine_unmodified)

                        fs.copyFileSync(currentSourceLine, currentDestinationLine_unmodified);
                        updateConsole(workerNumber, "Copy successful:" + currentSourceLine + " to " + currentDestinationLine_unmodified)
                        copySuccess();

                    } catch (err) {
                        updateConsole(workerNumber, "Copy failed:" + currentSourceLine + " to " + currentDestinationLine_unmodified)
                        copyFail();
                    }
                }

                function copySuccess() {
                    var message = [
                        workerNumber,
                        "copied",
                        globalQueueNumber,
                        "Copy",
                        errorLogFull
                    ];
                    process.send(message);

                    if (deleteSourceFilesOnOff == true) {


                        var message = [
                            workerNumber,
                            "deleteThisFile",
                            globalQueueNumber,

                        ];
                        process.send(message);

                        // if (fs.existsSync(currentSourceLine)) {
                        //     fs.unlinkSync(currentSourceLine)
                        // }
                    }
                }


                function copyFail() {
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

            } else {

                var message = [
                    workerNumber,
                    "Skipped: File title word filter",
                    globalQueueNumber,
                    "Skip",
                    errorLogFull
                ];
                process.send(message);

                updateConsole(workerNumber, "Skipped: File title word filter:" + currentSourceLine)




                endCyle();

            }

            function endCyle() {

                checkifQueuePause();
            }
        } else {

            updateConsole(workerNumber, "Launching FFprobe:" + currentSourceLine)

            infoExtractModule = childProcess.fork(path.join(__dirname, 'mediaAnalyser.js'), [], {
                silent: true
            });

            updateConsole(workerNumber, "FFprobe launched successfully:" + currentSourceLine)

            var extractCommand = [
                "analyseThis",
                currentSourceLine,
            ];



            infoExtractModule.send(extractCommand);

            updateConsole(workerNumber, "Sent to FFprobe:" + currentSourceLine)


            infoExtractModule.on('message', function (message) {

                if (message[0] == "consoleMessage") {
                    updateConsole("Worker " + workerNumber + ":" + message[1] + "");
                }





                if (message[0] == "fileInfo") {

                    updateConsole(workerNumber, "FFprobe response received:" + currentSourceLine)

                    var jsonInfo = message[1]

                    try {
                        frameCount = jsonInfo.streams[0]["nb_frames"]
                        updateConsole(workerNumber, "Source file frame count extract:Success:" + currentSourceLine)


                    } catch (err) {
                        updateConsole(workerNumber, "Source file frame count extract:Fail:" + currentSourceLine)
                    }

                    try {
                        source_file_length = jsonInfo.streams[0]["duration"]
                        updateConsole(workerNumber, "Source file length extract:Success:" + currentSourceLine)

                    } catch (err) {
                        updateConsole(workerNumber, "Source file length extract:Fail:" + currentSourceLine)
                    }

                    var filterReason = "";


                    var JSONBomb = "";
                    if (mode == "healthCheck") {

                        try {

                            for (var i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {
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
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)

                        } catch (err) {

                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe Fail:" + currentSourceLine)
                        }

                        var processFileY = true

                    } else if (includeAnyFilesWithProperties == true || includeAllFilesWithProperties == true) {

                        try {

                            var processFileY = false
                            var validateArray = []
                            filterReason = "Excluded, does not meet 'Include' conditions"



                            fileFiltersIncludeArray = fileFiltersIncludeArray.split(',');

                            for (var i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {

                                    for (var j = 0; j < fileFiltersIncludeArray.length; j++) {


                                        if (fileFiltersIncludeArray[j].includes(key + ": '" + jsonInfo.streams[i][key] + "'")) {

                                            processFileY = true
                                            filterReason = "Include: " + key + ": '" + jsonInfo.streams[i][key] + "' "
                                            validateArray.push(true)

                                        }
                                    }

                                });
                            }

                            if (includeAllFilesWithProperties == true) {
                                if ((validateArray.length + 1) == fileFiltersIncludeArray.length) {
                                    processFileY = true
                                } else {
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
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)


                        } catch (err) {

                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe Fail:" + currentSourceLine)

                            var processFileY = true
                        }

                    } else if (excludeAnyFilesWithProperties == true || excludeAllFilesWithProperties == true) {

                        try {

                            var processFileY = true
                            var validateArray = []
                            //   fileFiltersExcludeArray = "codec_name: 'h264',codec_name: 'aac'"
                            // codec_name: 'h264',codec_name: 'aac',channel_layout: 'stereo',codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10'
                            fileFiltersExcludeArray = fileFiltersExcludeArray.split(',');


                            for (var i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {

                                    for (var j = 0; j < fileFiltersExcludeArray.length; j++) {
                                        if (fileFiltersExcludeArray[j].includes(key + ": '" + jsonInfo.streams[i][key] + "'")) {

                                            processFileY = false
                                            filterReason += "Exclude: " + key + ": '" + jsonInfo.streams[i][key] + "' "
                                            validateArray.push(true)

                                        }
                                    }

                                });
                            }

                            if (excludeAllFilesWithProperties == true) {
                                if ((validateArray.length + 1) == fileFiltersExcludeArray.length) {
                                    processFileY = false
                                } else {
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
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)

                        } catch (err) {

                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,

                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe Fail:" + currentSourceLine)

                            var processFileY = true
                        }

                    } else {

                        try {

                            for (var i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {

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
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)

                        } catch (err) {
                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,

                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe Fail:" + currentSourceLine)
                        }
                        processFileY = true

                        if (minimumFileSizeOnOff == true || maximumFileSizeOnOff == true) {

                            var singleFileSize = fs.statSync(currentSourceLine)
                            var singleFileSize = singleFileSize.size
                            var fileSizeInMbytes = singleFileSize / 1000000.0;

                            if (minimumFileSizeOnOff == true) {
                                if (fileSizeInMbytes < minimumFileSize) {
                                    processFileY = false
                                    filterReason += "File below minimum MB size "
                                }
                            }

                            if (maximumFileSizeOnOff == true) {
                                if (fileSizeInMbytes > maximumFileSize) {
                                    processFileY = false
                                    filterReason += "File above maximum MB size "
                                }
                            }



                        }

                    }
                    //jsonInfo.streams[0]["codec_name"] == "h264"
                    if (processFileY == true) {
                        processFile();
                    } else {
                        if (copyOnOff == true) {
                            // currentSourceLine + "\" -o \"" + currentDestinationLine
                            if (tempFolderSelected == true) {

                                try {

                                    updateConsole(workerNumber, "Copying file:" + currentSourceLine + " to " + currentDestinationFinalLine_unmodified)
                                    fs.copyFileSync(currentSourceLine, currentDestinationFinalLine_unmodified);
                                    updateConsole(workerNumber, "Copy successful:" + currentSourceLine + " to " + currentDestinationFinalLine_unmodified)
                                    copySuccess();

                                } catch (err) {
                                    updateConsole(workerNumber, "Copy failed:" + currentSourceLine + " to " + currentDestinationFinalLine_unmodified)
                                    copyFail();


                                }

                            } else {

                                try {


                                    updateConsole(workerNumber, "Copying file:" + currentSourceLine + " to " + currentDestinationLine_unmodified)
                                    fs.copyFileSync(currentSourceLine, currentDestinationLine_unmodified);
                                    updateConsole(workerNumber, "Copy successful:" + currentSourceLine + " to " + currentDestinationLine_unmodified)
                                    copySuccess();

                                } catch (err) {
                                    updateConsole(workerNumber, "Copy failed:" + currentSourceLine + " to " + currentDestinationLine_unmodified)
                                    copyFail();
                                }
                            }

                            function copySuccess() {
                                var message = [
                                    workerNumber,
                                    "copied",
                                    globalQueueNumber,
                                    "Copy",
                                    errorLogFull
                                ];
                                process.send(message);

                                if (deleteSourceFilesOnOff == true) {

                                    var message = [
                                        workerNumber,
                                        "deleteThisFile",
                                        globalQueueNumber,

                                    ];
                                    process.send(message);

                                    // if (fs.existsSync(currentSourceLine)) {
                                    //     fs.unlinkSync(currentSourceLine)
                                    // }

                                }
                            }

                            function copyFail() {
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

                        } else {

                            var message = [
                                workerNumber,
                                "Skipped: File property filter:" + filterReason,
                                globalQueueNumber,
                                "Skip",
                                errorLogFull
                            ];
                            process.send(message);

                            endCyle();
                        }

                        function endCyle() {

                            checkifQueuePause();

                        }
                    }

                    function processFile() {
                        //

                        var childProcess = require("child_process");
                        var shellThreadPath = "worker2.js"

                        //
                        updateConsole(workerNumber, "Launching sub-worker:")

                        shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath), [], {
                            silent: true
                        });
                        // var shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath ));
                        updateConsole(workerNumber, "Launching sub-worker successful:")

                        var infoArray = [
                            "processFile",
                            workerCommand
                        ];

                        updateConsole(workerNumber, "Sending command to sub-worker:" + workerCommand)
                        shellThreadModule.send(infoArray);


                        shellThreadModule.stdout.on('data', function (data) {
                            //  console.log('stdoutWorker: ' + data);
                            //log console output to text file

                            var str = "" + data;

                            var message = [
                                workerNumber,
                                "appendRequest",
                                homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutput.txt",
                                str,
                                //currentSourceLine+" ConversionError\n",
                            ];
                            process.send(message);

                            // send percentage update to GUI

                            if (handBrakeMode == true) {

                                var numbers = "0123456789"
                                var n = str.indexOf("%")

                                if (str.length >= 6 && str.indexOf("%") >= 6 && numbers.includes(str.charAt(n - 5))) {

                                    var output = str.substring(n - 6, n + 1)




                                    console.log(output)
                                    var message = [
                                        workerNumber,
                                        "percentage",
                                        globalQueueNumber,
                                        output
                                    ];
                                    process.send(message);




                                }
                            } else if (FFmpegMode == true) {

                                if (str.includes("frame=")) {
                                    if (str.length >= 6) {
                                        var n = str.indexOf("fps");

                                        if (n >= 6) {

                                            var output = str.substring(6, n)

                                            try {
                                                output = ((output / frameCount) * 100).toFixed(2) + "%"
                                            } catch (err) { }

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
                            }
                            if (str.includes("Exit code:")) {
                                //console.log(str)
                            }

                            if (str.includes("stderr:")) {

                            }
                        });

                        shellThreadModule.stderr.on('data', function (data) {

                            // console.log('stderrorWorker: ' + data);
                            var str = "" + data;

                            var message = [
                                workerNumber,
                                "appendRequest",
                                homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutputError.txt",
                                str,
                                //currentSourceLine+" ConversionError\n",
                            ];
                            process.send(message);

                            errorLogFull += data;
                            // send percentage update to GUI

                            if (handBrakeMode == true) {

                                var numbers = "0123456789"
                                var n = str.indexOf("%")
                                if (str.length >= 6 && str.indexOf("%") >= 6 && numbers.includes(str.charAt(n - 5))) {

                                    var output = str.substring(n - 6, n + 1)


                                    console.log(output)
                                    var message = [
                                        workerNumber,
                                        "percentage",
                                        globalQueueNumber,
                                        output
                                    ];
                                    process.send(message);





                                }



                            } else if (FFmpegMode == true) {

                                if (str.includes("frame=")) {
                                    if (str.length >= 6) {
                                        var n = str.indexOf("fps");

                                        if (n >= 6) {

                                            var output = str.substring(6, n)

                                            try {
                                                output = ((output / frameCount) * 100).toFixed(2) + "%"
                                            } catch (err) { }

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

                            }




                        });




                        shellThreadModule.on("exit", function (code, ) {
                            //  console.log('shellThreadExited:', code,);
                            updateConsole(workerNumber, "Sub-worker exited")

                        });


                        shellThreadModule.on('message', function (message) {


                            if (message[0] == "consoleMessage") {
                                updateConsole("Worker " + workerNumber + ":" + message[1] + "");
                            }



                            if (message.error) {
                                console.error(message.error);
                            }

                            //var message2 = message.split(",");



                            if (message[0] == "Exit") {


                                updateConsole(workerNumber, "Sub-worker exit status received")

                                shellThreadModule = "";

                                console.log('shellThreadExited:', message[1]);




                                //// exit code begin




                                if (mode != "healthCheck" && !fs.existsSync(currentDestinationLine)) {

                                    updateConsole(workerNumber, "HBBatchBeast ALERT: NO OUTPUT FILE PRODUCED" + currentDestinationLine)




                                    errorLogFull += "\n HBBatchBeast ALERT: NO OUTPUT FILE PRODUCED";
                                    if (currentSourceLine.includes("'") && process.platform == 'linux') {
                                        errorLogFull += "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + currentSourceLine
                                        updateConsole(workerNumber, "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + currentSourceLine)
                                    }

                                    var message = [
                                        workerNumber,
                                        "error",
                                        globalQueueNumber,
                                        preset,
                                        errorLogFull
                                    ];
                                    process.send(message);

                                    checkifQueuePause();


                                } else if (message[1] != 0) {

                                    workerEncounteredError(message[1])

                                } else {
                                    // workerEncounteredError(message[1])
                                    workerNotEncounteredError();


                                }










                                /// exit finish

                            }
                        });
                    }
                }
            });
        }
    }


    //


    if (m[0] == "completed") {








        var message = [
            workerNumber,
            "exitRequest",
        ];

        process.send(message);

        updateConsole(workerNumber, "Exit request")




    }


    if (m[0] == "exitApproved") {

        updateConsole(workerNumber, "Exiting")

        process.exit();



    }



});



function moveCorruptedFile() {


    //  currentSourceLine  corruptDestinationPath

    if (process.platform == 'win32') {

        var stringProcessingSlash = "\\";
    }

    if (process.platform == 'linux' || process.platform == 'darwin') {
        var stringProcessingSlash = "/";
    }

    var pointer = currentSourceLine.split(stringProcessingSlash);
    var filePathEnd = pointer[pointer.length - 1] //     test.mp4

    corruptDestinationPath = corruptDestinationPath + stringProcessingSlash + filePathEnd;


    updateConsole(workerNumber, "Moving corrupt file:" + currentSourceLine + " to " + corruptDestinationPath)

    fsextra.moveSync(currentSourceLine, corruptDestinationPath, {
        overwrite: true
    })

    updateConsole(workerNumber, "Moving corrupt file successful:" + currentSourceLine + " to " + corruptDestinationPath)




}





function workerEncounteredError(messageOne) {


    if (messageOne == "Cancelled") {

        var message = [
            workerNumber,
            "cancelled",
            globalQueueNumber,
            preset,
            errorLogFull
        ];
        process.send(message);

        updateConsole(workerNumber, "Item cancelled:" + currentSourceLine)

        checkifQueuePause();


    } else {







        if (mode == "healthCheck") {
            //function everything else waits

            //if repair file == true



            if (FFmpegMode == true && repairFile == true) {

                //  updateConsole(workerNumber, "Source file length2:" + source_file_length)

                if (source_file_length !== undefined) {
                    attemptToRepair();


                } else {

                    if (currentSourceLine.includes("'") && process.platform == 'linux') {
                        errorLogFull += "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + currentSourceLine
                        updateConsole(workerNumber, "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + currentSourceLine)
                    }

                    updateConsole(workerNumber, "Unable to repair file!:" + currentSourceLine)
                    var message = [
                        workerNumber,
                        "Unable to repair file",
                        globalQueueNumber,
                        preset,
                        errorLogFull
                    ];
                    process.send(message);


                    if (moveCorruptFileOnOff == true) {
                        moveCorruptedFile();

                    }


                    checkifQueuePause();


                }



                var message = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/ErrorLog.txt",
                    getDateNow() + "-" + getTimeNow() + "---Health---check--ERROR----------" + currentSourceLine + "\r\n" + errorLogFull + "\r\n",
                ];
                process.send(message);


            } else {

                var message = [
                    workerNumber,
                    "error",
                    globalQueueNumber,
                    preset,
                    errorLogFull
                ];
                process.send(message);

                updateConsole(workerNumber, "Sub worker error when processing:" + currentSourceLine)

                if (moveCorruptFileOnOff == true) {
                    moveCorruptedFile();
                }

                var message = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/ErrorLog.txt",
                    getDateNow() + "-" + getTimeNow() + "---Health---check--ERROR----------" + currentSourceLine + "\r\n" + errorLogFull + "\r\n",
                ];
                process.send(message);
                checkifQueuePause();

            }


        } else {


            var message = [
                workerNumber,
                "error",
                globalQueueNumber,
                preset,
                errorLogFull
            ];
            process.send(message);

            updateConsole(workerNumber, "Sub worker error when processing:" + currentSourceLine)

            if (tempFolderSelected == true) {
                var message = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                    getDateNow() + "-" + getTimeNow() + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n" + errorLogFull + "\r\n",
                ];
                process.send(message);
            } else {
                var message = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                    getDateNow() + "-" + getTimeNow() + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset + "\r\n" + errorLogFull + "\r\n",
                ];
                process.send(message);
            }

            checkifQueuePause();

        }
    }
}


function workerNotEncounteredError() {


    if (mode == "healthCheck") {


        var message = [
            workerNumber,
            "appendRequest",
            homePath + "/Documents/HBBatchBeast/Logs/healthyFileList.txt",
            currentSourceLine + "\n",
        ];
        process.send(message);

        updateConsole(workerNumber, "No errors found with this file:" + currentSourceLine)

        var message = [
            workerNumber,
            "success",
            globalQueueNumber,
            preset,
            errorLogFull
        ];
        process.send(message);

        checkifQueuePause();

    } else {



        var sourcefileSizeInGbytes = (((fs.statSync(currentSourceLine)).size) / 1000000000.0);
        var destfileSizeInGbytes = (((fs.statSync(currentDestinationLine)).size) / 1000000000.0);

        var message = [
            workerNumber,
            "fileSizes",
            globalQueueNumber,
            sourcefileSizeInGbytes,
            destfileSizeInGbytes

        ];
        process.send(message);







        // }
        if (batOnOff != "") {

            var pathBat = batOnOff;
            pathBat = "\"" + pathBat + "\""


            try {
                updateConsole(workerNumber, "Launching bat file:" + pathBat)
                require('child_process').execSync(pathBat, function (err, stdout, stderr) {
                    if (err) {
                        // Ooops.

                        return console.log(err);
                    }

                    // Done.


                });

                updateConsole(workerNumber, "Bat file launched succcesfully:" + pathBat)
            } catch (err) {

                updateConsole(workerNumber, "Launching bat file failed:" + pathBat)

            }

        }




        if (tempFolderSelected == true) {
            try {
                // dont use fs.renameSync(
                updateConsole(workerNumber, "Moving file:" + currentDestinationLine + " to " + currentDestinationFinalLine)

                fsextra.moveSync(currentDestinationLine, currentDestinationFinalLine, {
                    overwrite: true
                })

                updateConsole(workerNumber, "File moved successfully:" + currentDestinationLine + " to " + currentDestinationFinalLine)

            } catch (err) {
                updateConsole(workerNumber, "Moving file failed:" + currentDestinationLine + " to " + currentDestinationFinalLine)
            }


            var message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                getDateNow() + "-" + getTimeNow() + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n",
            ];
            process.send(message);

        } else {


            var message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                getDateNow() + "-" + getTimeNow() + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset + "\r\n",
            ];
            process.send(message);


        }


        // check to see if should delete source files
        if (deleteSourceFilesOnOff == true) {


            var message = [
                workerNumber,
                "deleteThisFile",
                globalQueueNumber,

            ];
            process.send(message);


            updateConsole(workerNumber, "File queued for deletion:" + currentSourceLine)

        }



        if (replaceOriginalFile == true || replaceOriginalFileAlways == true) {

            if (fs.existsSync(currentSourceLine)) {
                var originalFileSize = fs.statSync(currentSourceLine)
                originalFileSize = originalFileSize.size
            }

            if (fs.existsSync(currentDestinationLine)) {
                var newFileSize = fs.statSync(currentDestinationLine)
                newFileSize = newFileSize.size
            }

            if (fs.existsSync(currentDestinationFinalLine)) {
                var newFinalFileSize = fs.statSync(currentDestinationFinalLine)
                newFinalFileSize = newFinalFileSize.size
            }

            function replaceOriginalFile(actualDestinationPath) {

                try {

                    var newFilePath = currentSourceLine.slice(0, currentSourceLine.lastIndexOf(global.stringProcessingSlash));
                    var newFileSubPath = actualDestinationPath.slice(actualDestinationPath.lastIndexOf(global.stringProcessingSlash), actualDestinationPath.length);
                    var newCurrentSourceLine = newFilePath + global.stringProcessingSlash + newFileSubPath
                    errorLogFull += "\n Deleting original file: " + currentSourceLine

                    fs.unlinkSync(currentSourceLine)

                    errorLogFull += "\n Moving new file to original folder: " + actualDestinationPath + " to " + newCurrentSourceLine
                    updateConsole(workerNumber, "Moving file:" + currentSourceLine + " to " + newCurrentSourceLine)

                    fsextra.moveSync(actualDestinationPath, newCurrentSourceLine, {
                        overwrite: true
                    })

                    var message = [
                        workerNumber,
                        "Original replaced",
                        globalQueueNumber,
                        preset,
                        errorLogFull
                    ];
                    process.send(message);
                    updateConsole(workerNumber, "Original file replaced:" + currentSourceLine + " to " + newCurrentSourceLine)

                } catch (err) {

                    errorLogFull += "\n HBBatchBeast ALERT: Error replacing original file";

                    var message = [
                        workerNumber,
                        "error",
                        globalQueueNumber,
                        preset,
                        errorLogFull + "\n" + err.stack
                    ];
                    process.send(message);

                    updateConsole(workerNumber, "Error replacing original file:" + currentSourceLine + " to " + newCurrentSourceLine)

                }

            }




            if (tempFolderSelected == true) {

                if (newFinalFileSize < originalFileSize || replaceOriginalFileAlways == true) {

                    replaceOriginalFile(currentDestinationFinalLine)

                } else {

                    var message = [
                        workerNumber,
                        "Original not replaced: New file is larger",
                        globalQueueNumber,
                        preset,
                        errorLogFull
                    ];
                    process.send(message);

                    updateConsole(workerNumber, "Original not replaced: New file is larger:" + currentSourceLine)
                }
            } else {

                if (newFileSize < originalFileSize || replaceOriginalFileAlways == true) {

                    replaceOriginalFile(currentDestinationLine)

                } else {

                    var message = [
                        workerNumber,
                        "Original not replaced: New file is larger",
                        globalQueueNumber,
                        preset,
                        errorLogFull
                    ];
                    process.send(message);
                    updateConsole(workerNumber, "Original not replaced: New file is larger:" + currentDestinationLine)


                }
            }


            var message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/originalFileReplacedList.txt",
                currentSourceLine + "\n",
            ];
            process.send(message);


        } else {

            var message = [
                workerNumber,
                "success",
                globalQueueNumber,
                preset,
                errorLogFull
            ];
            process.send(message);


        }



        checkifQueuePause();

    }
}


function checkifQueuePause() {
    var f = fs.readFileSync(homePath + '/Documents/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
    if (f == "1") {
        var message = [
            workerNumber,
            "queueRequest",
        ];
        process.send(message);

    }
}

function getDateNow() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    // if (mm < 10) {
    //     mm = '0' + mm
    // }
    var months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    mm = months[mm - 1];
    today = dd + '/' + mm + '/' + yyyy;
    var today2 = dd + '-' + mm + '-' + yyyy;
    return today2
}

function getTimeNow() {
    var d = new Date(),
        h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    var s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
    var timenow = h + ':' + m + ':' + s;

    return timenow
}


function attemptToRepair() {



    var childProcess = require("child_process");
    var repair_worker_path = "worker2.js"

    //
    updateConsole(workerNumber, "Launching repair worker:")

    repair_worker = childProcess.fork(path.join(__dirname, repair_worker_path), [], {
        silent: true
    });
    // var shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath ));
    updateConsole(workerNumber, "Launching repair worker successful:")



    var preset = "-y,-c:v libx264 -crf " + repairCRFValue + " -c:a aac -q:a 100 -strict -2 -movflags faststart -level 41"
    var presetSplit = preset.split(',')
    var workerCommand = "";

    var repair_file_path = currentSourceLine.split('.')
    repair_file_path[repair_file_path.length - 2] = repair_file_path[repair_file_path.length - 2] + "_repaired_file"

    repair_file_path = repair_file_path.join('.')

    if (process.platform == 'win32' && FFmpegMode == true) {
        workerCommand = ffmpegPath + " " + presetSplit[0] + " -i \"" + currentSourceLine + "\" " + presetSplit[1] + " \"" + repair_file_path + "\" "
    }

    if (process.platform == 'linux' && FFmpegMode == true) {
        workerCommand = ffmpegPath + " " + presetSplit[0] + " -i '" + currentSourceLine + "' " + presetSplit[1] + " '" + repair_file_path + "' "

    }

    if (process.platform == 'darwin' && FFmpegMode == true) {
        workerCommand = ffmpegPath + " " + presetSplit[0] + " -i '" + currentSourceLine + "' " + presetSplit[1] + " '" + repair_file_path + "' "
    }

    var infoArray = [
        "processFile",
        workerCommand
    ];

    updateConsole(workerNumber, "Sending command to repair worker:" + workerCommand)
    repair_worker.send(infoArray);

    repair_worker.stdout.on('data', function (data) {
        //  console.log('stdoutWorker: ' + data);
        //log console output to text file
        var str = "" + data;
        var message = [
            workerNumber,
            "appendRequest",
            homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutput.txt",
            str,
            //currentSourceLine+" ConversionError\n",
        ];
        process.send(message);

        // send percentage update to GUI

        if (FFmpegMode == true) {

            if (str.includes("frame=")) {
                if (str.length >= 6) {
                    var n = str.indexOf("fps");

                    if (n >= 6) {

                        var output = str.substring(6, n)

                        try {
                            output = ((output / frameCount) * 100).toFixed(2) + "%"
                        } catch (err) { }

                        console.log(output)
                        var message = [
                            workerNumber,
                            "repair_worker_percentage",
                            globalQueueNumber,
                            output
                        ];
                        process.send(message);


                    }
                }
            }
        }
        if (str.includes("Exit code:")) {
            //console.log(str)
        }

        if (str.includes("stderr:")) {

        }
    });


    repair_worker.stderr.on('data', function (data) {

        // console.log('stderrorWorker: ' + data);
        var str = "" + data;

        var message = [
            workerNumber,
            "appendRequest",
            homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutputError.txt",
            str,
            //currentSourceLine+" ConversionError\n",
        ];
        process.send(message);

        errorLogFull += data;
        // send percentage update to GUI

        if (FFmpegMode == true) {

            if (str.includes("frame=")) {
                if (str.length >= 6) {
                    var n = str.indexOf("fps");

                    if (n >= 6) {

                        var output = str.substring(6, n)

                        try {
                            output = ((output / frameCount) * 100).toFixed(2) + "%"
                        } catch (err) { }

                        console.log(output)
                        var message = [
                            workerNumber,
                            "repair_worker_percentage",
                            globalQueueNumber,
                            output
                        ];
                        process.send(message);


                    }
                }
            }
        }




    });

    repair_worker.on("exit", function (code, ) {
        //  console.log('shellThreadExited:', code,);
        updateConsole(workerNumber, "Repair worker exited")

    });

    repair_worker.on('message', function (message) {


        if (message[0] == "consoleMessage") {
            updateConsole("Worker " + workerNumber + ":" + message[1] + "");
        }



        if (message.error) {
            console.error(message.error);
        }

        //var message2 = message.split(",");


        if (message[0] == "Exit") {


            updateConsole(workerNumber, "Repair worker exit status received")

            repair_worker = "";

            console.log('shellThreadExited:', message[1]);



            if (message[1] == "Cancelled") {

                var message = [
                    workerNumber,
                    "cancelled",
                    globalQueueNumber,
                    preset,
                    errorLogFull
                ];
                process.send(message);

                updateConsole(workerNumber, "Repair cancelled:" + currentSourceLine)

                try {
                    fs.unlinkSync(repair_file_path)
                } catch (err) { }


                updateConsole(workerNumber, "File deleted:" + repair_file_path)

                checkifQueuePause();

                //// exit code begin
            } else {

                if (message[1] != 0) {

                    if (currentSourceLine.includes("'") && process.platform == 'linux') {
                        errorLogFull += "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + currentSourceLine
                        updateConsole(workerNumber, "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + currentSourceLine)
                    }

                    updateConsole(workerNumber, "Unable to repair file!:" + currentSourceLine + " to " + repair_file_path)
                    var message = [
                        workerNumber,
                        "Unable to repair file",
                        globalQueueNumber,
                        preset,
                        errorLogFull
                    ];
                    process.send(message);

                    moveCorruptedFile();

                    checkifQueuePause();
                    // workerEncounteredError(message[1])

                } else {

                    //check if output file is same length as input file


                    updateConsole(workerNumber, "Checking repaired file length!:" + repair_file_path)

                    // updateConsole(workerNumber, "File repaired successfully!:" + currentSourceLine)



                    if (__dirname.includes('.asar')) {
                        process.env.NODE_ENV = "production";
                    }

                    var ffprobe = require('ffprobe'),
                        ffprobeStatic = require('ffprobe-static');
                    var path = require("path");
                    var ffprobeStaticPath = ''

                    if (process.env.NODE_ENV == 'production') {

                        ffprobeStaticPath = require('ffprobe-static').path.replace('app.asar', 'app.asar.unpacked')

                    } else {
                        ffprobeStaticPath = require('ffprobe-static').path
                    }

                    var thisval

                    ffprobe(repair_file_path, { path: ffprobeStaticPath }, function (err, info) {
                        if (err) return done(err);
                        //console.log(info);

                        console.log(info);

                        thisval = info;


                        console.log(thisval.streams[0]["duration"]);


                        var repaired_file_length = thisval.streams[0]["duration"]

                        updateConsole(workerNumber, "File source length:" + parseInt(source_file_length))
                        updateConsole(workerNumber, "File repaired length:" + parseInt(repaired_file_length))

                        if (parseInt(source_file_length) === parseInt(repaired_file_length)) {

                            updateConsole(workerNumber, "File repaired successfully!:" + currentSourceLine + " to " + repair_file_path)

                            var message = [
                                workerNumber,
                                "File repaired. Please inspect files.",
                                globalQueueNumber,
                                preset,
                                errorLogFull
                            ];
                            process.send(message);

                            if (moveCorruptFileOnOff == true) {
                                moveCorruptedFile();
                            }
                            checkifQueuePause();

                        } else {

                            updateConsole(workerNumber, "Unable to repair file!:" + currentSourceLine + " to " + repair_file_path)
                            try {
                                fs.unlinkSync(repair_file_path)
                            } catch (err) { }


                            var message = [
                                workerNumber,
                                "Unable to repair file",
                                globalQueueNumber,
                                preset,
                                errorLogFull
                            ];
                            process.send(message);

                            if (moveCorruptFileOnOff == true) {
                                moveCorruptedFile();
                            }



                            checkifQueuePause();


                        }
                    });
                }
                /// exit finish
            }
        }
    });
}