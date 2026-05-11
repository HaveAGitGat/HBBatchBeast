//Log errors

"use strict";

const workerNumber = process.argv[2]

const shell = require('shelljs');
const homePath = require("os").homedir();
const fs = require('fs');
const fsextra = require('fs-extra')
const path = require("path");

const {
  configureEnvironment,
  createWorkerState,
  updateConsole,
  checkifQueuePause,
  getDateNow,
  getTimeNow,
} = require('./worker1/context');
const { prepareQueueItem } = require('./worker1/queueItem');
const {
  handleUncheckedItem,
  handleSkipOrCopy,
} = require('./worker1/copyMode');
const { startMediaWorkflow } = require('./worker1/mediaWorkflow');
const {
  moveCorruptedFile,
  workerEncounteredError,
  workerNotEncounteredError,
} = require('./worker1/resultHandlers');
const { attemptToRepair } = require('./worker1/repair');

configureEnvironment(__dirname);

const state = createWorkerState({
  workerNumber,
  homePath,
  shell,
  fs,
  fsextra,
  path,
  moduleDir: __dirname,
});

const ctx = {
  state,
  updateConsole,
  send: (message) => process.send(message),
  checkifQueuePause: () => checkifQueuePause(ctx),
  getDateNow,
  getTimeNow,
};

ctx.moveCorruptedFile = () => moveCorruptedFile(ctx);
ctx.workerEncounteredError = (messageOne) => workerEncounteredError(ctx, messageOne);
ctx.workerNotEncounteredError = () => workerNotEncounteredError(ctx);
ctx.attemptToRepair = () => attemptToRepair(ctx);

process.on('uncaughtException', (err) => {
  console.error(err.stack);

  updateConsole(workerNumber, ":" + err.stack)

  process.exit();
});

const requestMessage = {
  workerNumber,
  type: "queueRequest",
};
process.send(requestMessage);
updateConsole(workerNumber, "Worker online. Requesting item")

const stopWorkerTree = () => {
  updateConsole(workerNumber, "Stop command received. Closing sub-processes")

  let killCommand;

  if (process.platform == 'win32') {
    killCommand = 'taskkill /PID ' + process.pid + ' /T /F'
  } else if (process.platform == 'linux') {
    killCommand = 'pkill -P ' + process.pid
  } else if (process.platform == 'darwin') {
    killCommand = 'pkill -P ' + process.pid
  }

  if (shell.exec(killCommand).code !== 0) {
    shell.exit(1);
  }
};

const cancelCurrentItem = () => {
  updateConsole(workerNumber, "Cancelling")

  const cancelMessage = {
    type: "exitThread",
    reason: "itemCancelled",
  };

  try {
    if (state.shellThreadModule != "") {
      state.shellThreadModule.send(cancelMessage);
    }
  } catch (err) { }

  try {
    if (state.repair_worker != "") {
      state.repair_worker.send(cancelMessage);
    }
  } catch (err) { }
};

const handleQueueNumber = (m) => {
  prepareQueueItem(ctx, m);

  if (state.itemChecked == false) {
    handleUncheckedItem(ctx);
  } else if (state.skipOrCopy == 1) {
    handleSkipOrCopy(ctx);
  } else {
    startMediaWorkflow(ctx);
  }
};

process.on('message', (m) => {
  if (m.type == "continueWork") {
    checkifQueuePause(ctx)
  }

  if (m.type == "suicide") {
    stopWorkerTree();
  }

  if (m.type == "exitThread") {
    cancelCurrentItem();
  }

  if (m.type == "queueNumber") {
    handleQueueNumber(m);
  }

  if (m.type == "completed") {
    const message = {
      workerNumber,
      type: "exitRequest",
    };

    process.send(message);

    updateConsole(workerNumber, "Exit request")
  }

  if (m.type == "exitApproved") {
    updateConsole(workerNumber, "Exiting")

    process.exit();
  }
});
