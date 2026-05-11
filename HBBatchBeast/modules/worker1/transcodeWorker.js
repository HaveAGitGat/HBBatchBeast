"use strict";

const childProcess = require("child_process");
const { appendWorkerLog, sendProgressFromOutput } = require('./progress');
const { workerResultMessage } = require('./messages');

const handleWorkerExit = (ctx, message) => {
  const { state, updateConsole } = ctx;

  updateConsole(state.workerNumber, "Sub-worker exit status received")

  state.shellThreadModule = "";

  console.log('shellThreadExited:', message.code);

  if (state.mode != "healthCheck" && !state.fs.existsSync(state.currentDestinationLine)) {
    updateConsole(state.workerNumber, "HBBatchBeast ALERT: NO OUTPUT FILE PRODUCED" + state.currentDestinationLine)

    state.errorLogFull += "\n HBBatchBeast ALERT: NO OUTPUT FILE PRODUCED";
    if (state.currentSourceLine.includes("'") && process.platform == 'linux') {
      state.errorLogFull += "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + state.currentSourceLine
      updateConsole(state.workerNumber, "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + state.currentSourceLine)
    }

    const errorMessage = workerResultMessage(state, "error");
    ctx.send(errorMessage);

    ctx.checkifQueuePause();
  } else if (message.code != 0) {
    ctx.workerEncounteredError(message.code)
  } else {
    ctx.workerNotEncounteredError();
  }
};

const startTranscodeWorker = (ctx) => {
  const { state, updateConsole } = ctx;
  const shellThreadPath = "worker2.js"

  updateConsole(state.workerNumber, "Launching sub-worker:")

  state.shellThreadModule = childProcess.fork(state.path.join(state.moduleDir, shellThreadPath), [], {
    silent: true
  });
  updateConsole(state.workerNumber, "Launching sub-worker successful:")

  const processFileMessage = {
    type: "processFile",
    command: state.workerCommand,
  };

  updateConsole(state.workerNumber, "Sending command to sub-worker:" + state.workerCommand)
  state.shellThreadModule.send(processFileMessage);

  state.shellThreadModule.stdout.on('data', (data) => {
    const str = "" + data;

    appendWorkerLog(ctx, str, false);
    sendProgressFromOutput(ctx, str, "percentage", true);
  });

  state.shellThreadModule.stderr.on('data', (data) => {
    const str = "" + data;

    appendWorkerLog(ctx, str, true);

    state.errorLogFull += data;
    sendProgressFromOutput(ctx, str, "percentage", true);
  });

  state.shellThreadModule.on("exit", () => {
    updateConsole(state.workerNumber, "Sub-worker exited")
  });

  state.shellThreadModule.on('message', (message) => {
    if (message.type == "consoleMessage") {
      updateConsole(state.workerNumber, message.text);
    }

    if (message.error) {
      console.error(message.error);
    }

    if (message.type == "Exit") {
      handleWorkerExit(ctx, message);
    }
  });
};

module.exports = {
  startTranscodeWorker,
};
