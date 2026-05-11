
const shell = require('shelljs');

process.on('message', (infoArray) => {
    if (infoArray[0] == "setPriority") {
        const workerCommand = infoArray[1];

        shell.exec(workerCommand, (code, stdout, stderr, stdin) => {
            process.exit()
        });
    }
});
