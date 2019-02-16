
var shell = require('shelljs');

process.on('message', (infoArray) => {

console.log("shellThread")

var workerCommand = infoArray[0];


shell.exec(workerCommand, function(code, stdout, stderr) {
 //console.log('Exit code:', code);

process.send("Exit,"+code);


 // console.log('Program output:', stdout);


 //console.log('stderr:', stderr);




process.exit()
});




});