
var shell = require('shelljs');

process.on('message', (infoArray) => {

console.log("shellThread")

var workerCommand = infoArray[0];



// shell.exec(workerCommand).code

shell.exec(workerCommand, function(code, stdout, stderr) {
 //console.log('Exit code:', code);

process.send("Exit,"+code);


 // console.log('Program output:', stdout);


 //console.log('stderr:', stderr);

// var str =""+stdout;

//       if(str.includes("%")){
//         if(str.length>=7){

//         n = str.indexOf("%");
// //console.log(str.substring(n-6,n+1));

// var output = str.substring(n-6,n+1)

// console.log('stdout:',output)


      //  }
      // }


process.exit()
});




});