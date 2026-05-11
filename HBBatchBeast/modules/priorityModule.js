
const shell = require('shelljs');

process.on('message', (infoArray) => {
  if (infoArray.type == "setPriority") {
    const workerCommand = infoArray.command;

    shell.exec(workerCommand, (code, stdout, stderr, stdin) => {
      process.exit()
    });
  }
});
