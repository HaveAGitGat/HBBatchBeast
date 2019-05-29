//SET ENV
if (__dirname.includes('.asar')) { // If dev
    process.env.NODE_ENV = "production";
}


var shell = require('shelljs');
var home = require("os").homedir();



if (process.platform == 'win32' || process.platform == 'linux') {

    var homePath = "."
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



//Log errors




function updateConsole(workerNumber, text) {

    var message = [
        workerNumber,
        "consoleMessage",
        text,
    ];
    process.send(message);




}





if (process.platform == 'win32') {

    var stringProcessingSlash = "\\";
}

if (process.platform == 'linux' || process.platform == 'darwin') {
    var stringProcessingSlash = "/";
}



var fullPath = __dirname;
fullPath = fullPath.slice(0, fullPath.lastIndexOf(stringProcessingSlash));
fullPath = fullPath.slice(0, fullPath.lastIndexOf(stringProcessingSlash));
var fullPath2 = fullPath + "\\HandBrakeCLI.exe"




//handbrake CLI path
if (process.platform == 'win32') {

    if (process.env.NODE_ENV == 'production') {

        //production
        var handBrakeCLIPath = "\"" + fullPath2 + "\"";

    } else {

        //development
        var handBrakeCLIPath = "\"" + __dirname + "/HandBrakeCLI.exe\"";

    }

}

if (process.platform == 'linux' || process.platform == 'darwin') {
    //development && //production
    var handBrakeCLIPath = "HandBrakeCLI -i \""


}


// //check to see if bat option enabled
// if (fs.existsSync(homePath + "/HBBatchBeast/Config/customBatPath.txt")) {

//     var batOnOff = fs.readFileSync(homePath + "/HBBatchBeast/Config/customBatPath.txt", 'utf8');

// }



//Global variables
var fs = require('fs');
var fsextra = require('fs-extra')

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

var infoExtractModule;

var frameCount
var deleteSourceFilesOnOff
var batOnOff

var tempFolderSelected
var currentDestinationLine
var currentDestinationFinalLine


var currentSourceLine
var preset



process.on('uncaughtException', function (err) {
    console.error(err.stack);




    var message = [
        workerNumber,
        "appendRequest",
        homePath + '/HBBatchBeast/Logs/SystemErrorLog.txt',
        "Worker thread error: " + err.stack + "\r\n",
    ];
    process.send(message);


    process.exit();
});







process.on('message', (m) => {

    // if(m.charAt(0) == "s"){

    if (m[0] == "suicide") {

        if (process.platform == 'win32') {
            var killCommand = 'taskkill /PID ' + process.pid + ' /T /F'
        }

        if (process.platform == 'linux') {
            var killCommand = 'pkill -P ' + process.pid
        }
        if (process.platform == 'darwin') {
            var killCommand = 'pkill -P ' + process.pid
        }


        if (shell.exec(killCommand).code !== 0) {

            shell.exit(1);
        }

    }


    // if(m.charAt(0) == "e"){

    if (m[0] == "exitThread") {

        var infoArray = [
            "exitThread",
            "itemCancelled",
        ];

        try {


            if (shellThreadModule != "") {
                shellThreadModule.send(infoArray);
            }


        } catch (err) { }


    }


    //if(m.charAt(0) == "w"){

    if (m[0] == "workerNumber") {


        workerNumber = m[1];

        //workerNumber =process.argv[2]


        var message = [
            workerNumber,
            "queueRequest",
        ];
        process.send(message);



        updateConsole(workerNumber, "Requesting item")
    }


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




        updateConsole(workerNumber, "Received item:" + currentSourceLine)


        //






        if (mode == "healthCheck") {
            deleteSourceFilesOnOff = false
        }








        var path = require("path");




        if (process.env.NODE_ENV == 'production') {


            //var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');
            //var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

            if (process.platform == 'win32') {

                var ffmpegPath = (path.join(__dirname, '\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe')).replace('app.asar', 'app.asar.unpacked')
            } else {
                var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');
                //var ffmpegPath = (path.join(__dirname, '\\node_modules\\@ffmpeg-installer\\linux-x64/ffmpeg' )).replace('app.asar', 'app.asar.unpacked')
            }

        } else {
            var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        }


        //var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');

        if (mode == "healthCheck") {
            handBrakeMode = true;
            FFmpegMode = false;
        }

        var presetSplit
        presetSplit = preset.split(',')
        var workerCommand = "";

        if (process.platform == 'win32') {

            if (handBrakeMode == true) {

                workerCommand = handBrakeCLIPath + " -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" " + preset;

            } else if (FFmpegMode == true) {

                // workerCommand =ffmpegPath + " -i \"" + currentSourceLine + "\" "+preset+" \"" + currentDestinationLine + "\" " ;
                workerCommand = ffmpegPath + " " + presetSplit[0] + " -i \"" + currentSourceLine + "\" " + presetSplit[1] + " \"" + currentDestinationLine + "\" "

            }
        }

        if (process.platform == 'linux') {
            //workerCommand ="HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;
            // workerCommand ='nice -n 20 HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" ' + preset;

            if (handBrakeMode == true) {

                workerCommand = "HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

            } else if (FFmpegMode == true) {

                //  workerCommand =ffmpegPath + " -i '" + currentSourceLine + "' "+preset+" '" + currentDestinationLine + "' " ;
                workerCommand = ffmpegPath + " " + presetSplit[0] + " -i '" + currentSourceLine + "' " + presetSplit[1] + " '" + currentDestinationLine + "' "

            }

            //20 low priority, 0 = default = highest priority (without sudo)
            //nice -n -20
            //workerCommand ='HandBrakeCLI -i \"" + currentSourceLine + "\" -o \"" + currentDestinationLine + "\" ' + preset;
        }


        if (process.platform == 'darwin') {

            //workerCommand ="/usr/local/bin/HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;

            if (handBrakeMode == true) {
                workerCommand = "/usr/local/bin/HandBrakeCLI -i '" + currentSourceLine + "' -o '" + currentDestinationLine + "' " + preset;
            } else if (FFmpegMode == true) {

                //workerCommand =ffmpegPath + " -i '" + currentSourceLine + "' "+preset+" '" + currentDestinationLine + "' " ;

                workerCommand = ffmpegPath + " " + presetSplit[0] + " -i '" + currentSourceLine + "' " + presetSplit[1] + " '" + currentDestinationLine + "' "
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


        var errorSwitch = 0;

        var errorLogFull = ""
        errorLogFull += "Command: \n\n"
        errorLogFull += workerCommand + "\n\n"
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

        if (itemChecked == false) {

            var message = [
                workerNumber,
                "appendRequest",
                homePath + "/HBBatchBeast/Logs/CommandList.txt",
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

            updateConsole(workerNumber,"Skipped: Not selected - "+currentSourceLine)

            var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
            if (f == "1") {

                var message = [
                    workerNumber,
                    "queueRequest",
                ];
                process.send(message);
            } else if (f == "0") { }

        } else if (skipOrCopy == 1) {

            if (copyOnOff == true || currentSourceLine.includes('.srt') || currentSourceLine.includes('.SRT')) {
                // currentSourceLine + "\" -o \"" + currentDestinationLine
                if (tempFolderSelected == true) {

                    try {

                        updateConsole(workerNumber,"Copying file:"+currentSourceLine +" to "+currentDestinationFinalLine)

                        fs.copyFileSync(currentSourceLine, currentDestinationFinalLine);
                        updateConsole(workerNumber,"Copy successful:"+currentSourceLine +" to "+currentDestinationFinalLine)
                        copySuccess();
                    } catch (err) {
                        updateConsole(workerNumber,"Copy failed:"+currentSourceLine +" to "+currentDestinationFinalLine)
                        copyFail();
                    }
                } else {
                    try {

                        updateConsole(workerNumber,"Copying file:"+currentSourceLine +" to "+currentDestinationLine)

                        fs.copyFileSync(currentSourceLine, currentDestinationLine);
                        updateConsole(workerNumber,"Copy successful:"+currentSourceLine +" to "+currentDestinationLine)
                        copySuccess();

                    } catch (err) {
                        updateConsole(workerNumber,"Copy failed:"+currentSourceLine +" to "+currentDestinationLine)
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

                updateConsole(workerNumber,"Skipped: File title word filter:"+currentSourceLine)

              


                endCyle();

            }

            function endCyle() {



                //process.send(workerNumber+",queueRequest");

                var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
                if (f == "1") {

                    var message = [
                        workerNumber,
                        "queueRequest",
                    ];
                    process.send(message);
                } else if (f == "0") { }
            }
        } else {

            updateConsole(workerNumber,"Launching FFprobe:"+currentSourceLine)

            infoExtractModule = childProcess.fork(path.join(__dirname, 'mediaAnalyser.js'), [], {
                silent: true
            });

            updateConsole(workerNumber,"FFprobe launched successfully:"+currentSourceLine)

            var extractCommand = [
                "analyseThis",
                currentSourceLine,
            ];

            

            infoExtractModule.send(extractCommand);

            updateConsole(workerNumber,"Sent to FFprobe:"+currentSourceLine)


            infoExtractModule.on('message', function (message) {

                if (message[0] == "fileInfo") {

                    updateConsole(workerNumber,"FFprobe response received:"+currentSourceLine)

                    var jsonInfo = message[1]

                    //jsonInfo.streams[0]["codec_name"]

                    // var messageJSON = [
                    //     "jsonInfo",
                    //     jsonInfo,
                    //     jsonInfo.streams[0]["codec_name"],

                    //     ];
                    //     process.send(messageJSON);
                    try {
                        frameCount = jsonInfo.streams[0]["nb_frames"]


                    } catch (err) { }

                    var filterReason = "";

                    // var messageJSON = [
                    //     "fileFiltersIncludeArray",
                    //     fileFiltersIncludeArray,
                    //     ];
                    //     process.send(messageJSON);

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
                            updateConsole(workerNumber,"FFprobe OK:"+currentSourceLine)

                        } catch (err) {

                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber,"FFprobe Fail:"+currentSourceLine)
                        }

                        var processFileY = true

                    } else if (includeAnyFilesWithProperties == true || includeAllFilesWithProperties == true) {

                        try {

                            var processFileY = false
                            var validateArray = []
                            filterReason = "Excluded, does not meet 'Include' conditions"

                            //   fileFiltersIncludeArray = "codec_name: 'h264',"

                            fileFiltersIncludeArray = fileFiltersIncludeArray.split(',');

                            for (var i = 0; i < jsonInfo.streams.length; i++) {
                                Object.keys(jsonInfo.streams[i]).forEach(function (key) {

                                    for (var j = 0; j < fileFiltersIncludeArray.length; j++) {

                                        // var messageJSON = [
                                        //     "jsonInfo",
                                        //     key+": '"+jsonInfo.streams[i][key]+"'",
                                        //     "filter",
                                        //     fileFiltersIncludeArray[j],
                                        //     ];
                                        //     process.send(messageJSON);

                                        if (fileFiltersIncludeArray[j].includes(key + ": '" + jsonInfo.streams[i][key] + "'")) {

                                            processFileY = true
                                            filterReason = "Include: " + key + ": '" + jsonInfo.streams[i][key] + "' "
                                            validateArray.push(true)

                                        }
                                    }
                                    //   console.log(key, obj[key]);
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
                            updateConsole(workerNumber,"FFprobe OK:"+currentSourceLine)


                        } catch (err) {

                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,
                            ];
                            process.send(message);
                            updateConsole(workerNumber,"FFprobe Fail:"+currentSourceLine)

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
                            updateConsole(workerNumber,"FFprobe OK:"+currentSourceLine)

                        } catch (err) {

                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,

                            ];
                            process.send(message);
                            updateConsole(workerNumber,"FFprobe Fail:"+currentSourceLine)

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
                            updateConsole(workerNumber,"FFprobe OK:"+currentSourceLine)

                        } catch (err) {
                            var message = [
                                workerNumber,
                                "FFPROBE",
                                globalQueueNumber,
                                "Fail",
                                currentSourceLine,

                            ];
                            process.send(message);
                            updateConsole(workerNumber,"FFprobe Fail:"+currentSourceLine)
                        }
                        processFileY = true
                    }
                    //jsonInfo.streams[0]["codec_name"] == "h264"
                    if (processFileY == true) {
                        processFile();
                    } else {
                        if (copyOnOff == true) {
                            // currentSourceLine + "\" -o \"" + currentDestinationLine
                            if (tempFolderSelected == true) {

                                try {

                                    updateConsole(workerNumber,"Copying file:"+currentSourceLine +" to "+currentDestinationFinalLine)
                                    fs.copyFileSync(currentSourceLine, currentDestinationFinalLine);
                                    updateConsole(workerNumber,"Copy successful:"+currentSourceLine +" to "+currentDestinationFinalLine)
                                    copySuccess();

                                } catch (err) {
                                    updateConsole(workerNumber,"Copy failed:"+currentSourceLine +" to "+currentDestinationFinalLine)
                                    copyFail();


                                }

                            } else {

                                try {


                                    updateConsole(workerNumber,"Copying file:"+currentSourceLine +" to "+currentDestinationLine)
                                    fs.copyFileSync(currentSourceLine, currentDestinationLine);
                                    updateConsole(workerNumber,"Copy successful:"+currentSourceLine +" to "+currentDestinationLine)
                                    copySuccess();

                                } catch (err) {
                                    updateConsole(workerNumber,"Copy failed:"+currentSourceLine +" to "+currentDestinationLine)
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

                            //process.send(workerNumber+",queueRequest");


                            var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
                            if (f == "1") {

                                var message = [
                                    workerNumber,
                                    "queueRequest",
                                ];
                                process.send(message);
                            } else if (f == "0") { }

                        }
                    }

                    function processFile() {
                        //
                        var path = require("path");
                        var childProcess = require("child_process");
                        var shellThreadPath = "worker2.js"

                        //
                        updateConsole(workerNumber,"Launching sub-worker:")

                        shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath), [], {
                            silent: true
                        });
                        // var shellThreadModule = childProcess.fork(path.join(__dirname, shellThreadPath ));
                        updateConsole(workerNumber,"Launching sub-worker launched successfully:")

                        var infoArray = [
                            "processFile",
                            workerCommand
                        ];

                        updateConsole(workerNumber,"Sending command to sub-worker:"+workerCommand)
                        shellThreadModule.send(infoArray);
                        shellThreadModule.stdout.on('data', function (data) {
                            //  console.log('stdoutWorker: ' + data);
                            //log console output to text file

                            var str = "" + data;

                            var message = [
                                workerNumber,
                                "appendRequest",
                                homePath + "/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutput.txt",
                                str,
                                //currentSourceLine+" ConversionError\n",
                            ];
                            process.send(message);

                            // send percentage update to GUI

                            if (handBrakeMode == true) {

                                if (str.includes("%")) {
                                    if (str.length >= 7) {
                                        n = str.indexOf("%");

                                        if (n >= 6) {

                                            var numbers = "0123456789"

                                            if (numbers.includes(str.charAt(n - 5))) {
                                                var output = str.substring(n - 5, n + 1)

                                            }else if (numbers.includes(str.charAt(n - 4))) {
                                                var output = str.substring(n - 4, n + 1)

                                            }else if (numbers.includes(str.charAt(n - 3))) {
                                                var output = str.substring(n - 3, n + 1)

                                            }else if (numbers.includes(str.charAt(n - 2))) {
                                                var output = str.substring(n - 2, n + 1)

                                            }

                                            

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
                            } else if (FFmpegMode == true) {

                                if (str.includes("frame=")) {
                                    if (str.length >= 6) {
                                        n = str.indexOf("fps");

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
                                homePath + "/HBBatchBeast/Logs/Worker" + workerNumber + "ConsoleOutputError.txt",
                                str,
                                //currentSourceLine+" ConversionError\n",
                            ];
                            process.send(message);

                            errorLogFull += data;
                            // send percentage update to GUI

                            if (handBrakeMode == true) {

                                if (str.includes("%")) {
                                    if (str.length >= 7) {
                                        n = str.indexOf("%");



                                        if (n >= 6) {

                                            
                                            var numbers = "0123456789"

                                            if (numbers.includes(str.charAt(n - 5))) {
                                                var output = str.substring(n - 5, n + 1)

                                            }else if (numbers.includes(str.charAt(n - 4))) {
                                                var output = str.substring(n - 4, n + 1)

                                            }else if (numbers.includes(str.charAt(n - 3))) {
                                                var output = str.substring(n - 3, n + 1)

                                            }else if (numbers.includes(str.charAt(n - 2))) {
                                                var output = str.substring(n - 2, n + 1)

                                            }


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



                            } else if (FFmpegMode == true) {

                                if (str.includes("frame=")) {
                                    if (str.length >= 6) {
                                        n = str.indexOf("fps");

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
                            updateConsole(workerNumber,"Sub-worker exited")

                        });


                        shellThreadModule.on('message', function (message) {



                            if (message.error) {
                                console.error(message.error);
                            }

                            //var message2 = message.split(",");



                            if (message[0] == "Exit") {


                                updateConsole(workerNumber,"Sub-worker exit status received")

                                shellThreadModule = "";

                                console.log('shellThreadExited:', message[1]);




                                //// exit code begin




                                if (mode != "healthCheck" && !fs.existsSync(currentDestinationLine)) {

                                    updateConsole(workerNumber,"HBBB ALERT: NO OUTPUT FILE PRODUCED"+currentDestinationLine)

                         

                                    errorLogFull += "\n HBBB ALERT: NO OUTPUT FILE PRODUCED";

                                    var message = [
                                        workerNumber,
                                        "error",
                                        globalQueueNumber,
                                        preset,
                                        errorLogFull
                                    ];
                                    process.send(message);



                                } else if (message[1] != 0) {




                                    if (message[1] == "Cancelled") {

                                        var message = [
                                            workerNumber,
                                            "cancelled",
                                            globalQueueNumber,
                                            preset,
                                            errorLogFull
                                        ];
                                        process.send(message);

                                    updateConsole(workerNumber,"Item cancelled:"+currentSourceLine)


                                    } else {

                                        if (mode == "healthCheck") {

                                            if (moveCorruptFileOnOff == true) {


                                                //  currentSourceLine  corruptDestinationPath

                                                if (process.platform == 'win32') {

                                                    var stringProcessingSlash = "\\";
                                                }

                                                if (process.platform == 'linux' || process.platform == 'darwin') {
                                                    var stringProcessingSlash = "/";
                                                }

                                                pointer = currentSourceLine.split(stringProcessingSlash);
                                                filePathEnd = pointer[pointer.length - 1] //     test.mp4


                                                        updateConsole(workerNumber,"Item cancelled:"+currentSourceLine)
                                                corruptDestinationPath = corruptDestinationPath + stringProcessingSlash + filePathEnd;


                                                updateConsole(workerNumber,"Moving corrupt file:"+currentSourceLine +" to "+corruptDestinationPath)

                                                fsextra.moveSync(currentSourceLine, corruptDestinationPath, {
                                                    overwrite: true
                                                })

                                                updateConsole(workerNumber,"Moving corrupt file successful:"+currentSourceLine +" to "+corruptDestinationPath)
                                              


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

                                        updateConsole(workerNumber,"Sub worker error when processing:"+currentSourceLine)


                                    }











                                    var actionComplete = 0
                                    while (actionComplete == 0) {

                                        try {


                                            var message = [
                                                workerNumber,
                                                "appendRequest",
                                                homePath + "/HBBatchBeast/Logs/ErrorLog.txt",
                                                today2 + "-" + timenow + "---Health---check--ERROR----------" + currentSourceLine + "\r\n" + errorLogFull + "\r\n",
                                            ];
                                            process.send(message);

                                            actionComplete = 1;
                                        } catch (err) { }
                                    }




                                    if (tempFolderSelected == true) {


                                        var actionComplete = 0
                                        while (actionComplete == 0) {

                                            try {


                                                var message = [
                                                    workerNumber,
                                                    "appendRequest",
                                                    homePath + "/HBBatchBeast/Logs/fileConversionLog.txt",
                                                    today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n" + errorLogFull + "\r\n",
                                                ];
                                                process.send(message);


                                                actionComplete = 1;
                                            } catch (err) { }
                                        }




                                    } else {


                                        var actionComplete = 0
                                        while (actionComplete == 0) {

                                            try {

                                                var message = [
                                                    workerNumber,
                                                    "appendRequest",
                                                    homePath + "/HBBatchBeast/Logs/fileConversionLog.txt",
                                                    today2 + "-" + timenow + "--------ERROR----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset + "\r\n" + errorLogFull + "\r\n",
                                                ];
                                                process.send(message);

                                                actionComplete = 1;
                                            } catch (err) { }
                                        }




                                    }

                                    errorSwitch = 1;



                                } else {

                                    if (mode == "healthCheck") {


                                        var message = [
                                            workerNumber,
                                            "appendRequest",
                                            homePath + "/HBBatchBeast/Logs/healthyFileList.txt",
                                            currentSourceLine + "\n",
                                        ];
                                        process.send(message);

                                    }


                                    // }




                                    // if(errorSwitch==0){






                                    if (batOnOff != "") {

                                        var path = batOnOff;
                                        path = "\"" + path + "\""


                                        try {
                                            updateConsole(workerNumber,"Launching bat file:"+path)
                                            require('child_process').execSync(path, function (err, stdout, stderr) {
                                                if (err) {
                                                    // Ooops.

                                                    return console.log(err);
                                                }

                                                // Done.


                                            });

                                            updateConsole(workerNumber,"Bat file launched succcesfully:"+path)
                                        } catch (err) {

                                            updateConsole(workerNumber,"Launching bat file failed:"+path)

                                         }

                                    }




                                    if (tempFolderSelected == true) {

                                        try {


                                            // dont use fs.renameSync(
                                                updateConsole(workerNumber,"Moving file:"+currentDestinationLine+" to "+currentDestinationFinalLine)

                                            fsextra.moveSync(currentDestinationLine, currentDestinationFinalLine, {
                                                overwrite: true
                                            })

                                            updateConsole(workerNumber,"File moved successfully:"+currentDestinationLine+" to "+currentDestinationFinalLine)




                                        } catch (err) {


                                            try {

                                                updateConsole(workerNumber,"Moving file:"+currentDestinationLine+" to "+currentDestinationFinalLine)
                                                fsextra.moveSync(currentDestinationLine, currentDestinationFinalLine, {
                                                    overwrite: true
                                                })

                                                updateConsole(workerNumber,"File moved successfully:"+currentDestinationLine+" to "+currentDestinationFinalLine)




                                            } catch (err) {
                                                updateConsole(workerNumber,"Moving file failed:"+currentDestinationLine+" to "+currentDestinationFinalLine)

                                             }


                                        }

                                        //   if(errorSwitch==0){



                                        var actionComplete = 0
                                        while (actionComplete == 0) {

                                            try {


                                                var message = [
                                                    workerNumber,
                                                    "appendRequest",
                                                    homePath + "/HBBatchBeast/Logs/fileConversionLog.txt",
                                                    today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationFinalLine + "----------using preset----------:" + preset + "\r\n",
                                                ];
                                                process.send(message);



                                                actionComplete = 1;
                                            } catch (err) { }
                                        }




                                        //     }


                                    } else {

                                        //if(errorSwitch==0){


                                        var actionComplete = 0
                                        while (actionComplete == 0) {

                                            try {



                                                var message = [
                                                    workerNumber,
                                                    "appendRequest",
                                                    homePath + "/HBBatchBeast/Logs/fileConversionLog.txt",
                                                    today2 + "-" + timenow + "--------Processed----------" + currentSourceLine + "------------to----------" + currentDestinationLine + "----------using preset----------:" + preset + "\r\n",
                                                ];
                                                process.send(message);



                                                actionComplete = 1;
                                            } catch (err) { }
                                        }




                                        // }
                                    }


                                    // check to see if should delete source files
                                    if (deleteSourceFilesOnOff == true) {


                                        var message = [
                                            workerNumber,
                                            "deleteThisFile",
                                            globalQueueNumber,

                                        ];
                                        process.send(message);


                                        updateConsole(workerNumber,"File queued for deletion:"+currentSourceLine)




                                    }






                                    if (mode != "healthCheck") {




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




                                            if (tempFolderSelected == true) {

                                                if (newFinalFileSize < originalFileSize || replaceOriginalFileAlways == true) {


                                                    try {
                                                        //

                                                        var containerType = currentDestinationFinalLine.slice(currentDestinationFinalLine.lastIndexOf('.'), currentDestinationFinalLine.length);

                                                        var fileName = currentSourceLine.slice(0, currentSourceLine.lastIndexOf('.'));

                                                        var newCurrentSourceLine = fileName + "" + containerType





                                                        errorLogFull += "\n Deleting original file: " + currentSourceLine

                                                        fs.unlinkSync(currentSourceLine)


                                                        errorLogFull += "\n Moving new file to original folder: " + currentDestinationFinalLine + " to " + newCurrentSourceLine

                                                        updateConsole(workerNumber,"Moving file:"+currentSourceLine +" to "+newCurrentSourceLine)

                                                        fsextra.moveSync(currentDestinationFinalLine, newCurrentSourceLine, {
                                                            overwrite: true
                                                        })



                                                        //






                                                        var message = [
                                                            workerNumber,
                                                            "Original replaced",
                                                            globalQueueNumber,
                                                            preset,
                                                            errorLogFull
                                                        ];
                                                        process.send(message);
                                                        updateConsole(workerNumber,"Original file replaced:"+currentSourceLine +" to "+newCurrentSourceLine)

                                                    } catch (err) {



                                                        errorLogFull += "\n HBBB ALERT: Error replacing original file";

                                                        var message = [
                                                            workerNumber,
                                                            "error",
                                                            globalQueueNumber,
                                                            preset,
                                                            errorLogFull + "\n" + err.stack
                                                        ];
                                                        process.send(message);

                                                        updateConsole(workerNumber,"Error replacing original file:"+currentSourceLine +" to "+newCurrentSourceLine)


                                                    }




                                                } else {

                                                    var message = [
                                                        workerNumber,
                                                        "Original not replaced: New file is larger",
                                                        globalQueueNumber,
                                                        preset,
                                                        errorLogFull
                                                    ];
                                                    process.send(message);

                                                    updateConsole(workerNumber,"Original not replaced: New file is larger:"+currentSourceLine +" to "+newCurrentSourceLine)



                                                }


                                            } else {



                                                if (newFileSize < originalFileSize || replaceOriginalFileAlways == true) {


                                                    try {

                                                        //  
                                                        //dont use fs.renameSync(currentDestinationLine, currentSourceLine) 

                                                        var containerType = currentDestinationLine.slice(currentDestinationLine.lastIndexOf('.'), currentDestinationLine.length);





                                                        var fileName = currentSourceLine.slice(0, currentSourceLine.lastIndexOf('.'));

                                                        var newCurrentSourceLine = fileName + "" + containerType






                                                        errorLogFull += "\n Deleting original file: " + currentSourceLine
                                                        fs.unlinkSync(currentSourceLine)


                                                        errorLogFull += "\n Moving new file to original folder: " + currentDestinationLine + " to " + newCurrentSourceLine

                                                        updateConsole(workerNumber,"Moving file:"+currentDestinationLine +" to "+newCurrentSourceLine)
                                                        fsextra.moveSync(currentDestinationLine, newCurrentSourceLine, {
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
                                                        updateConsole(workerNumber,"Original file replaced:"+currentDestinationLine +" to "+newCurrentSourceLine)

                                                    } catch (err) {

                                                        errorLogFull += "\n HBBB ALERT: Error replacing original file";

                                                        var message = [
                                                            workerNumber,
                                                            "error",
                                                            globalQueueNumber,
                                                            preset,
                                                            errorLogFull + "\n" + err.stack
                                                        ];
                                                        process.send(message);
                                                        updateConsole(workerNumber,"Error replacing original file:"+currentDestinationLine +" to "+newCurrentSourceLine)

                                                    }



                                                } else {

                                                    var message = [
                                                        workerNumber,
                                                        "Original not replaced: New file is larger",
                                                        globalQueueNumber,
                                                        preset,
                                                        errorLogFull
                                                    ];
                                                    process.send(message);
                                                    updateConsole(workerNumber,"Original not replaced: New file is larger:"+currentDestinationLine +" to "+newCurrentSourceLine)


                                                }




                                            }


                                            var message = [
                                                workerNumber,
                                                "appendRequest",
                                                homePath + "/HBBatchBeast/Logs/originalFileReplacedList.txt",
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




                                }





                                var f = fs.readFileSync(homePath + '/HBBatchBeast/Config/queueStartStop.txt', 'utf8');


                                if (f == "1") {

                                    var message = [
                                        workerNumber,
                                        "queueRequest",
                                    ];
                                    process.send(message);

                                } else if (f == "0") {


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


    //


    if (m[0] == "completed") {








        var message = [
            workerNumber,
            "exitRequest",
        ];

        process.send(message);

        updateConsole(workerNumber,"Exit request")




    }


    if (m[0] == "exitApproved") {

        updateConsole(workerNumber,"Exiting")

        process.exit();

        

    }



});