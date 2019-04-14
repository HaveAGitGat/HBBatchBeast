
//global variables


var windowRefresh = window.setInterval("runTimer();", 1000);

var runTimerOn= 0;

var timer =2;


function runTimer(){


if(runTimerOn== 1){

 timer--;  
 
 if(timer== 0){

    var messageOut = [
        "scanandconvert",
                ];  
process.send(messageOut);
process.exit()

 }
}
}

process.on('message', (infoArray) => {

if(infoArray[0]=="runTimer"){


    if(infoArray[1]=="dailyRunTime"){

        runTimerOn= 1;

    }
}

});