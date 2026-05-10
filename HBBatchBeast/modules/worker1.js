//Log errors

"use strict";

const workerNumber = process.argv[2]

function updateConsole(workerNumber, text) {

    const message = [
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

const shell = require('shelljs');
const homePath = require("os").homedir();

if (process.platform == 'win32') {

    global.stringProcessingSlash = "\\";
}

if (process.platform == 'linux' || process.platform == 'darwin') {
    global.stringProcessingSlash = "/";
}

//Global variables
const fs = require('fs');
const fsextra = require('fs-extra')
const path = require("path");

let globalQueueNumber;
let skipOrCopy;
let copyOnOff;
let replaceOriginalFile;
let replaceOriginalFileAlways;

let itemChecked;

let fileFiltersIncludeArray
let fileFiltersExcludeArray

let includeAnyFilesWithProperties
let includeAllFilesWithProperties
let excludeAnyFilesWithProperties
let excludeAllFilesWithProperties

let handBrakeMode
let FFmpegMode

let moveCorruptFileOnOff;
let corruptDestinationPath;

let mode

let shellThreadModule;
let repair_worker

let infoExtractModule;

let frameCount
let deleteSourceFilesOnOff
let batOnOff

let tempFolderSelected
let currentDestinationLine
let currentDestinationFinalLine

let currentSourceLine
let preset

let minimumFileSizeOnOff
let minimumFileSize
let maximumFileSizeOnOff
let maximumFileSize

let runThoroughHealthCheck

let errorLogFull
let source_file_length

let sourceFileContainer
let currentDestinationLine_unmodified
let currentDestinationFinalLine_unmodified

let repairFile

let repairCRFValue

let handBrakeCLIPath
let ffmpegPath

let saveWorkerLogs

// var message = [
//     "workerOnline",
// ];
// process.send(message);

//workerNumber =process.argv[2]
const message = [
    workerNumber,
    "queueRequest",
];
process.send(message);
updateConsole(workerNumber, "Worker online. Requesting item")

process.on('message', (m) => {

    if (m[0] == "continueWork") {

        checkifQueuePause()

    }

    if (m[0] == "suicide") {

        updateConsole(workerNumber, "Stop command received. Closing sub-processes")

        let killCommand;

        if (process.platform == 'win32') {
            killCommand = 'taskkill /PID ' + process.pid + ' /T /F'
        } else if (process.platform == 'linux') {
            killCommand = 'pkill -P ' + process.pid
        } else if (process.platform == 'darwin') {
            killCommand = 'pkill -P ' + process.pid
        }

        if (shell.exec(killCommand).code !== 0) {
            shell.exit(1);
        }

    }

    if (m[0] == "exitThread") {

        updateConsole(workerNumber, "Cancelling")

        const infoArray = [
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
        saveWorkerLogs = m[35]

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

        const presetSplit = preset.split(',')
        let workerCommand = "";

        if (process.platform == 'win32' && handBrakeMode == true) {
            workerCommand = handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;
        } else if (process.platform == 'win32' && FFmpegMode == true) {
            workerCommand = ffmpegPath + " " + presetSplit[0] + " -i \"" + currentSourceLine + "\" " + presetSplit[1] + " \"" + currentDestinationLine + "\" "

        }

        //

        const currentSourceLineUnix = currentSourceLine.replace(/'/g, '\'\"\'\"\'');
        const currentDestinationLineUnix = currentDestinationLine.replace(/'/g, '\'\"\'\"\'');
        const presetUnix = preset.replace(/'/g, '\'\"\'\"\'');
       
        const ffmpegPathUnix = ffmpegPath.replace(/'/g, '\'\"\'\"\'');
        let preset0Unix;
        let preset1Unix;
        try {
            preset0Unix = presetSplit[0].replace(/'/g, '\'\"\'\"\'');
        } catch (err) { }
        try {
            preset1Unix = presetSplit[1].replace(/'/g, '\'\"\'\"\'');
        } catch (err) { }

        if (process.platform == 'linux' && handBrakeMode == true) {

            workerCommand = "HandBrakeCLI -i '" + currentSourceLineUnix + "' -o '" + currentDestinationLineUnix + "' " + presetUnix;

        } else if (process.platform == 'linux' && FFmpegMode == true) {

            workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + currentDestinationLineUnix + "' "

        }

        //

        if (process.platform == 'darwin' && handBrakeMode == true) {
            workerCommand = "/usr/local/bin/HandBrakeCLI -i '"  + currentSourceLineUnix + "' -o '" + currentDestinationLineUnix + "' " + presetUnix;
        } else if (process.platform == 'darwin' && FFmpegMode == true) {
            workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + currentDestinationLineUnix + "' "
        }

        errorLogFull = ""
        errorLogFull += "Command: \n\n"
        errorLogFull += workerCommand + "\n\n"

        const childProcess = require("child_process");

        // Send ipc to state shell processing is starting
        const processingMessage = [
            workerNumber,
            "processing",
            globalQueueNumber,
            "Running"
        ];
        process.send(processingMessage);

        if (itemChecked == false) {

            const appendMessage = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/CommandList.txt",
                workerCommand + "\n",
                //currentSourceLine+" ConversionError\n",
            ];
            process.send(appendMessage);

            const skippedMessage = [
                workerNumber,
                "Skipped: Not selected",
                globalQueueNumber,
                "Skip",
                errorLogFull
            ];
            process.send(skippedMessage);

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
                    const message = [
                        workerNumber,
                        "copied",
                        globalQueueNumber,
                        "Copy",
                        errorLogFull
                    ];
                    process.send(message);

                    if (deleteSourceFilesOnOff == true) {

                        const message = [
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
                    const message = [
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

                const message = [
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

            const extractCommand = [
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

                    const jsonInfo = message[1]

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

                    let filterReason = "";
                    let processFileY;
                    let validateArray;

                    if (mode == "healthCheck") {

                        try {

                            for (let i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {
                                    // JSONBomb += key+": '"+jsonInfo.streams[i][key]+"' \n"
                                });
                            }

                            const message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "OK",
                                currentSourceLine,

                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)

                        } catch (err) {

                            const message = [
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

                    } else if (includeAnyFilesWithProperties == true || includeAllFilesWithProperties == true) {

                        try {

                            processFileY = false
                            validateArray = []
                            filterReason = "Excluded, does not meet 'Include' conditions"

                            fileFiltersIncludeArray = fileFiltersIncludeArray.split(',');

                            for (let i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {

                                    for (let j = 0; j < fileFiltersIncludeArray.length; j++) {

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

                            const message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "OK",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)

                        } catch (err) {

                            const message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe Fail:" + currentSourceLine)

                            processFileY = true
                        }

                        minmaxThreshold();

                    } else if (excludeAnyFilesWithProperties == true || excludeAllFilesWithProperties == true) {

                        try {

                            processFileY = true
                            validateArray = []
                            //   fileFiltersExcludeArray = "codec_name: 'h264',codec_name: 'aac'"
                            // codec_name: 'h264',codec_name: 'aac',channel_layout: 'stereo',codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10'
                            fileFiltersExcludeArray = fileFiltersExcludeArray.split(',');

                            for (let i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {

                                    for (let j = 0; j < fileFiltersExcludeArray.length; j++) {
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

                            const message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "OK",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)

                        } catch (err) {

                            const message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,

                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe Fail:" + currentSourceLine)

                            processFileY = true
                        }

                        minmaxThreshold();

                    } else {

                        try {

                            for (let i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {

                                });
                            }

                            const message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "OK",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber, "FFprobe OK:" + currentSourceLine)

                        } catch (err) {
                            const message = [
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

                        minmaxThreshold();

                    }

                    function minmaxThreshold() {

                        if (minimumFileSizeOnOff == true || maximumFileSizeOnOff == true) {

                            //

                            try {
                                let singleFileSize = fs.statSync(currentSourceLine)
                                singleFileSize = singleFileSize.size
                                const fileSizeInMbytes = singleFileSize / 1000000.0;

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
                            } catch (err) { }

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
                                const message = [
                                    workerNumber,
                                    "copied",
                                    globalQueueNumber,
                                    "Copy",
                                    errorLogFull
                                ];
                                process.send(message);

                                if (deleteSourceFilesOnOff == true) {

                                    const message = [
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
                                const message = [
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

                            const message = [
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

                        const childProcess = require("child_process");
                        const shellThreadPath = "worker2.js"

                        //
                        updateConsole(workerNumber, "Launching sub-worker:")

                        shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath), [], {
                            silent: true
                        });
                        // var shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath ));
                        updateConsole(workerNumber, "Launching sub-worker successful:")

                        const infoArray = [
                            "processFile",
                            workerCommand
                        ];

                        updateConsole(workerNumber, "Sending command to sub-worker:" + workerCommand)
                        shellThreadModule.send(infoArray);

                        shellThreadModule.stdout.on('data', function (data) {
                            //  console.log('stdoutWorker: ' + data);
                            //log console output to text file

                            const str = "" + data;

                            if (saveWorkerLogs) {
                                const message = [
                                    workerNumber,
                                    "appendRequest",
                                    homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutput.txt",
                                    str,
                                    //currentSourceLine+" ConversionError\n",
                                ];
                                process.send(message);
                            }

                            // send percentage update to GUI

                            if (handBrakeMode == true) {

                                const numbers = "0123456789"
                                const n = str.indexOf("%")

                                if (str.length >= 6 && str.indexOf("%") >= 6 && numbers.includes(str.charAt(n - 5))) {

                                    const output = str.substring(n - 6, n + 1)

                                    console.log(output)
                                    const message = [
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
                                        const n = str.indexOf("fps");

                                        if (n >= 6) {

                                            let output = str.substring(6, n)

                                            try {
                                                output = ((output / frameCount) * 100).toFixed(2) + "%"
                                            } catch (err) { }

                                            console.log(output)
                                            const message = [
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
                            const str = "" + data;

                            if (saveWorkerLogs) {
                                const message = [
                                    workerNumber,
                                    "appendRequest",
                                    homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutputError.txt",
                                    str,
                                    //currentSourceLine+" ConversionError\n",
                                ];
                                process.send(message);
                            }

                            errorLogFull += data;
                            // send percentage update to GUI

                            if (handBrakeMode == true) {

                                const numbers = "0123456789"
                                const n = str.indexOf("%")
                                if (str.length >= 6 && str.indexOf("%") >= 6 && numbers.includes(str.charAt(n - 5))) {

                                    const output = str.substring(n - 6, n + 1)

                                    console.log(output)
                                    const message = [
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
                                        const n = str.indexOf("fps");

                                        if (n >= 6) {

                                            let output = str.substring(6, n)

                                            try {
                                                output = ((output / frameCount) * 100).toFixed(2) + "%"
                                            } catch (err) { }

                                            console.log(output)
                                            const message = [
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

                                    const message = [
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

        const message = [
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

    let stringProcessingSlash;

    if (process.platform == 'win32') {

        stringProcessingSlash = "\\";
    }

    if (process.platform == 'linux' || process.platform == 'darwin') {
        stringProcessingSlash = "/";
    }

    const pointer = currentSourceLine.split(stringProcessingSlash);
    const filePathEnd = pointer[pointer.length - 1] //     test.mp4

    corruptDestinationPath = corruptDestinationPath + stringProcessingSlash + filePathEnd;

    updateConsole(workerNumber, "Moving corrupt file:" + currentSourceLine + " to " + corruptDestinationPath)

    try {

        fsextra.moveSync(currentSourceLine, corruptDestinationPath, {
            overwrite: true
        })
        updateConsole(workerNumber, "Moving corrupt file successful:" + currentSourceLine + " to " + corruptDestinationPath)

    } catch (err) {
        updateConsole(workerNumber, "Moving corrupt file unsuccessful:" + currentSourceLine + " to " + corruptDestinationPath)
    }

}

function workerEncounteredError(messageOne) {

    if (messageOne == "Cancelled") {

        const message = [
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
                    const message = [
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

                let errorLogWrite;

                if (saveWorkerLogs) {
                    errorLogWrite = "[" + getDateNow() + "#" + getTimeNow() + "]" + currentSourceLine + "\r\n" + errorLogFull + "\r\n"

                } else {
                    errorLogWrite = currentSourceLine + "\r\n"

                }

                const message = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/ErrorLog.txt",
                    errorLogWrite,
                ];
                process.send(message);

            } else {

                const errorMessage = [
                    workerNumber,
                    "error",
                    globalQueueNumber,
                    preset,
                    errorLogFull
                ];
                process.send(errorMessage);

                updateConsole(workerNumber, "Sub worker error when processing:" + currentSourceLine)

                if (moveCorruptFileOnOff == true) {
                    moveCorruptedFile();
                }

                let errorLogWrite;

                if (saveWorkerLogs) {
                    errorLogWrite = "[" + getDateNow() + "#" + getTimeNow() + "]" + currentSourceLine + "\r\n" + errorLogFull + "\r\n"

                } else {
                    errorLogWrite = currentSourceLine + "\r\n"

                }

                const appendMessage = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/ErrorLog.txt",
                    errorLogWrite,
                ];
                process.send(appendMessage);
                checkifQueuePause();

            }

        } else {

            const message = [
                workerNumber,
                "error",
                globalQueueNumber,
                preset,
                errorLogFull
            ];
            process.send(message);

            updateConsole(workerNumber, "Sub worker error when processing:" + currentSourceLine)

            if (tempFolderSelected == true) {
                const message = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                    "[" + getDateNow() + "#" + getTimeNow() + "]"+ "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n" + errorLogFull + "\r\n",
                ];
                process.send(message);
            } else {
                const message = [
                    workerNumber,
                    "appendRequest",
                    homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                    "[" + getDateNow() + "#" + getTimeNow() + "]" + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset + "\r\n" + errorLogFull + "\r\n",
                ];
                process.send(message);
            }

            checkifQueuePause();

        }
    }
}

function workerNotEncounteredError() {

    if (mode == "healthCheck") {

        const appendMessage = [
            workerNumber,
            "appendRequest",
            homePath + "/Documents/HBBatchBeast/Logs/healthyFileList.txt",
            currentSourceLine + "\n",
        ];
        process.send(appendMessage);

        updateConsole(workerNumber, "No errors found with this file:" + currentSourceLine)

        const successMessage = [
            workerNumber,
            "success",
            globalQueueNumber,
            preset,
            errorLogFull
        ];
        process.send(successMessage);

        checkifQueuePause();

    } else {

        const sourcefileSizeInGbytes = (((fs.statSync(currentSourceLine)).size) / 1000000000.0);
        const destfileSizeInGbytes = (((fs.statSync(currentDestinationLine)).size) / 1000000000.0);

        const message = [
            workerNumber,
            "fileSizes",
            globalQueueNumber,
            sourcefileSizeInGbytes,
            destfileSizeInGbytes

        ];
        process.send(message);

        // }
        if (batOnOff != "") {

            let pathBat = batOnOff;
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

            const message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                "[" + getDateNow() + "#" + getTimeNow() + "]" + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n",
            ];
            process.send(message);

        } else {

            const message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
                "[" + getDateNow() + "#" + getTimeNow() + "]" + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset + "\r\n",
            ];
            process.send(message);

        }

        // check to see if should delete source files
        if (deleteSourceFilesOnOff == true) {

            const message = [
                workerNumber,
                "deleteThisFile",
                globalQueueNumber,

            ];
            process.send(message);

            updateConsole(workerNumber, "File queued for deletion:" + currentSourceLine)

        }

        if (replaceOriginalFile == true || replaceOriginalFileAlways == true) {

            let originalFileSize;
            let newFileSize;
            let newFinalFileSize;

            if (fs.existsSync(currentSourceLine)) {
                originalFileSize = fs.statSync(currentSourceLine)
                originalFileSize = originalFileSize.size
            }

            if (fs.existsSync(currentDestinationLine)) {
                newFileSize = fs.statSync(currentDestinationLine)
                newFileSize = newFileSize.size
            }

            if (fs.existsSync(currentDestinationFinalLine)) {
                newFinalFileSize = fs.statSync(currentDestinationFinalLine)
                newFinalFileSize = newFinalFileSize.size
            }

            function replaceOriginalFile(actualDestinationPath) {

                let newCurrentSourceLine;

                try {

                    const newFilePath = currentSourceLine.slice(0, currentSourceLine.lastIndexOf(global.stringProcessingSlash));
                    const newFileSubPath = actualDestinationPath.slice(actualDestinationPath.lastIndexOf(global.stringProcessingSlash), actualDestinationPath.length);
                    newCurrentSourceLine = newFilePath + global.stringProcessingSlash + newFileSubPath
                    errorLogFull += "\n Deleting original file: " + currentSourceLine

                    fs.unlinkSync(currentSourceLine)

                    errorLogFull += "\n Moving new file to original folder: " + actualDestinationPath + " to " + newCurrentSourceLine
                    updateConsole(workerNumber, "Moving file:" + currentSourceLine + " to " + newCurrentSourceLine)

                    fsextra.moveSync(actualDestinationPath, newCurrentSourceLine, {
                        overwrite: true
                    })

                    const replacedMessage = [
                        workerNumber,
                        "Original replaced",
                        globalQueueNumber,
                        preset,
                        errorLogFull
                    ];
                    process.send(replacedMessage);
                    updateConsole(workerNumber, "Original file replaced:" + currentSourceLine + " to " + newCurrentSourceLine)

                    const appendMessage = [
                        workerNumber,
                        "appendRequest",
                        homePath + "/Documents/HBBatchBeast/Logs/originalFileReplacedList.txt",
                        path.normalize(newCurrentSourceLine) + "\n",
                    ];
                    process.send(appendMessage);

                } catch (err) {

                    errorLogFull += "\n HBBatchBeast ALERT: Error replacing original file";

                    const message = [
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

                    const message = [
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

                    const message = [
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

            //

        } else {

            const message = [
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
    const f = fs.readFileSync(homePath + '/Documents/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
    if (f == "1") {
        const message = [
            workerNumber,
            "queueRequest",
        ];
        process.send(message);

    }
}

function getDateNow() {

    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    // if (mm < 10) {
    //     mm = '0' + mm
    // }

    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    mm = months[mm - 1];
    const today2 = dd + '-' + mm + '-' + yyyy;
    return today2
}

function getTimeNow() {

    const d = new Date(),
        h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    const s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
    const timenow = h + ':' + m + ':' + s;

    return timenow
}

function attemptToRepair() {

    const childProcess = require("child_process");
    const repair_worker_path = "worker2.js"

    //
    updateConsole(workerNumber, "Launching repair worker:")

    repair_worker = childProcess.fork(path.join(__dirname, repair_worker_path), [], {
        silent: true
    });
    // var shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath ));
    updateConsole(workerNumber, "Launching repair worker successful:")

    const preset = "-y,-c:v libx264 -crf " + repairCRFValue + " -c:a aac -q:a 100 -strict -2 -movflags faststart -level 41"
    const presetSplit = preset.split(',')
    let workerCommand = "";

    let repair_file_path = currentSourceLine.split('.')
    repair_file_path[repair_file_path.length - 2] = repair_file_path[repair_file_path.length - 2] + "_repaired_file"

    repair_file_path = repair_file_path.join('.')

    if (process.platform == 'win32' && FFmpegMode == true) {
        workerCommand = ffmpegPath + " " + presetSplit[0] + " -i \"" + currentSourceLine + "\" " + presetSplit[1] + " \"" + repair_file_path + "\" "
    }

    if (process.platform == 'linux' && FFmpegMode == true) {

        const ffmpegPathUnix = ffmpegPath.replace(/'/g, '\'\"\'\"\'');

        const currentSourceLineUnix = currentSourceLine.replace(/'/g, '\'\"\'\"\'');
        const repair_file_pathUnix = repair_file_path.replace(/'/g, '\'\"\'\"\'');
   
        const preset0Unix = presetSplit[0].replace(/'/g, '\'\"\'\"\'');
        const preset1Unix = presetSplit[1].replace(/'/g, '\'\"\'\"\'');

        workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + repair_file_pathUnix + "' "

    }

    if (process.platform == 'darwin' && FFmpegMode == true) {
       
        const ffmpegPathUnix = ffmpegPath.replace(/'/g, '\'\"\'\"\'');

        const currentSourceLineUnix = currentSourceLine.replace(/'/g, '\'\"\'\"\'');
        const repair_file_pathUnix = repair_file_path.replace(/'/g, '\'\"\'\"\'');
   
        const preset0Unix = presetSplit[0].replace(/'/g, '\'\"\'\"\'');
        const preset1Unix = presetSplit[1].replace(/'/g, '\'\"\'\"\'');

        workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + repair_file_pathUnix + "' "
    }

    const infoArray = [
        "processFile",
        workerCommand
    ];

    updateConsole(workerNumber, "Sending command to repair worker:" + workerCommand)
    repair_worker.send(infoArray);

    repair_worker.stdout.on('data', function (data) {
        //  console.log('stdoutWorker: ' + data);
        //log console output to text file
        const str = "" + data;

        if (saveWorkerLogs) {

            const message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutput.txt",
                str,
                //currentSourceLine+" ConversionError\n",
            ];
            process.send(message);
        }

        // send percentage update to GUI

        if (FFmpegMode == true) {

            if (str.includes("frame=")) {
                if (str.length >= 6) {
                    const n = str.indexOf("fps");

                    if (n >= 6) {

                        let output = str.substring(6, n)

                        try {
                            output = ((output / frameCount) * 100).toFixed(2) + "%"
                        } catch (err) { }

                        console.log(output)
                        const message = [
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
        const str = "" + data;

        if (saveWorkerLogs) {
            const message = [
                workerNumber,
                "appendRequest",
                homePath + "/Documents/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutputError.txt",
                str,
                //currentSourceLine+" ConversionError\n",
            ];
            process.send(message);
        }

        errorLogFull += data;
        // send percentage update to GUI

        if (FFmpegMode == true) {

            if (str.includes("frame=")) {
                if (str.length >= 6) {
                    const n = str.indexOf("fps");

                    if (n >= 6) {

                        let output = str.substring(6, n)

                        try {
                            output = ((output / frameCount) * 100).toFixed(2) + "%"
                        } catch (err) { }

                        console.log(output)
                        const message = [
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

                const message = [
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
                    const message = [
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
                    // workerEncounteredError(message[1])

                } else {

                    //check if output file is same length as input file

                    updateConsole(workerNumber, "Checking repaired file length!:" + repair_file_path)

                    // updateConsole(workerNumber, "File repaired successfully!:" + currentSourceLine)

                    if (__dirname.includes('.asar')) {
                        process.env.NODE_ENV = "production";
                    }

                    const ffprobe = require('ffprobe');
                    let ffprobeStaticPath;

                    if (process.env.NODE_ENV == 'production') {

                        ffprobeStaticPath = require('ffprobe-static').path.replace('app.asar', 'app.asar.unpacked')

                    } else {
                        ffprobeStaticPath = require('ffprobe-static').path
                    }

                    let thisval

                    ffprobe(repair_file_path, { path: ffprobeStaticPath }, function (err, info) {
                        if (err) return done(err);
                        //console.log(info);

                        console.log(info);

                        thisval = info;

                        console.log(thisval.streams[0]["duration"]);

                        const repaired_file_length = thisval.streams[0]["duration"]

                        updateConsole(workerNumber, "File source length:" + parseInt(source_file_length))
                        updateConsole(workerNumber, "File repaired length:" + parseInt(repaired_file_length))

                        if (parseInt(source_file_length) === parseInt(repaired_file_length)) {

                            updateConsole(workerNumber, "File repaired successfully!:" + currentSourceLine + " to " + repair_file_path)

                            const message = [
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

                            const message = [
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
