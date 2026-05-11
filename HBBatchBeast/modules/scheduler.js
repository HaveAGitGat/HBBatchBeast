
//ar windowRefresh = window.setInterval("runTimer();", 1000);

//global variables
let runTimerOn = 0;

let timer = 4;

const runTimer = () => {
    //timer--;
    console.log(timer)

    if (runTimerOn == 1) {
        timer--;

        if (timer == 0) {
            const messageOut = [
                "scanandconvert",
            ];
            process.send(messageOut);
            process.exit()
        }
    }
};

setInterval(runTimer, 1000);

process.on('message', (infoArray) => {
    if (infoArray[0] == "runTimer") {
        if (infoArray[1] == "dailyRunTime") {
            runTimerOn = 1;
        }
    }
});
