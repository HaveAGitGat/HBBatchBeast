
const updateConsole = (text) => {
  const message = {
    type: "consoleMessage",
    text,
  };
  process.send(message);
};

process.on('uncaughtException', (err) => {
  //console.error(err.stack);
  updateConsole("Shell thread module: " + err.stack)
  process.exit();
});

//global variables
let shellWorker
const shell = require('shelljs');

//console.log(randomvariable)

process.on('message', (infoArray) => {
  console.log("shellThread")

  if (infoArray.type == "processFile") {
    const workerCommand = infoArray.command;

    shellWorker = shell.exec(workerCommand, (code, stdout, stderr, stdin) => {
      //console.log('Exit code:', code);

      const message = {
        type: "Exit",
        code,
      };
      process.send(message);

      //console.log('Program output:', stdout+"    PID:"+shellWorker.pid);
      //console.log('stderr:', stderr);
      //fs.appendFileSync(homePath+"/HBBatchBeast/Config/Processes/WorkerStatus/Console/ShellLog.txt", "exit", 'utf8');

      process.exit()
    });
  }

  if (infoArray.type == "exitThread") {
    if (infoArray.reason == "itemCancelled") {
      const message = {
        type: "Exit",
        code: "Cancelled",
      };
      process.send(message);
    }

    try {
      let killCommand;

      if (process.platform == 'win32') {
        killCommand = 'taskkill /PID ' + shellWorker.pid + ' /T /F'
      }
      if (process.platform == 'linux') {
        //var killCommand = 'vps -o pid --no-headers --ppid ' + shellWorker.pid
        killCommand = 'pkill -P ' + shellWorker.pid
      }
      if (process.platform == 'darwin') {
        //var killCommand = 'pgrep -P ' + shellWorker.pid
        killCommand = 'pkill -P ' + shellWorker.pid
      }
      if (shell.exec(killCommand).code !== 0) {
        shell.exit(1);
      }
    } catch (err) { }

    //process.send("Exit,"+"Cancelled");
    process.exit();
  }
});
