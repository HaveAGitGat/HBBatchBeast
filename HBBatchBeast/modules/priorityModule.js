
//global variables
var shellWorker


var shell = require('shelljs');



var fs = require('fs');



process.on('message', (infoArray) => {



    if (infoArray[0] == "setPriority") {


        var workerCommand = infoArray[1];


        shellWorker = shell.exec(workerCommand, function (code, stdout, stderr, stdin) {


            process.exit()
        });
    }

});