
var shell = require('shelljs');

process.on('message', (infoArray) => {

console.log("shellThread")


if(infoArray[0]=="processFile"){


var workerCommand = infoArray[1];


shell.exec(workerCommand, function(code, stdout, stderr) {
 //console.log('Exit code:', code);

process.send("Exit,"+code);


 // console.log('Program output:', stdout);


 //console.log('stderr:', stderr);




process.exit()
});
}


if(infoArray[0]=="exitThread"){

process.send("Exit,"+"Cancelled");    

process.exit();

}



});