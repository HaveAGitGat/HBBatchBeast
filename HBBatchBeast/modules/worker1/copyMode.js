"use strict";

const {
  appendRequestMessage,
  deleteSourceFileMessage,
  workerResultMessage,
} = require('./messages');

const sendCopyFail = (ctx) => {
  const { state } = ctx;
  const message = workerResultMessage(state, "copiedFail", "Copy");
  ctx.send(message);
};

const sendCopySuccess = (ctx) => {
  const { state } = ctx;
  const message = workerResultMessage(state, "copied", "Copy");
  ctx.send(message);

  if (state.deleteSourceFilesOnOff == true) {
    const deleteMessage = deleteSourceFileMessage(state);
    ctx.send(deleteMessage);
  }
};

const getCopyDestination = (state) => {
  if (state.tempFolderSelected == true) {
    return state.currentDestinationFinalLine_unmodified;
  }

  return state.currentDestinationLine_unmodified;
};

const copyCurrentFile = (ctx) => {
  const { state, updateConsole } = ctx;
  const destinationPath = getCopyDestination(state);

  try {
    updateConsole(state.workerNumber, "Copying file:" + state.currentSourceLine + " to " + destinationPath)
    state.fs.copyFileSync(state.currentSourceLine, destinationPath);
    updateConsole(state.workerNumber, "Copy successful:" + state.currentSourceLine + " to " + destinationPath)
    sendCopySuccess(ctx);
  } catch (err) {
    updateConsole(state.workerNumber, "Copy failed:" + state.currentSourceLine + " to " + destinationPath)
    sendCopyFail(ctx);
  }
};

const handleUncheckedItem = (ctx) => {
  const { state, updateConsole } = ctx;
  const appendMessage = appendRequestMessage(
    state,
    state.homePath + "/Documents/HBBatchBeast/Logs/CommandList.txt",
    state.workerCommand + "\n"
  );
  ctx.send(appendMessage);

  const skippedMessage = workerResultMessage(state, "Skipped: Not selected", "Skip");
  ctx.send(skippedMessage);

  updateConsole(state.workerNumber, "Skipped: Not selected - " + state.currentSourceLine)

  ctx.checkifQueuePause();
};

const handleSkipOrCopy = (ctx) => {
  const { state, updateConsole } = ctx;

  if (state.copyOnOff == true || state.currentSourceLine.includes('.srt') || state.currentSourceLine.includes('.SRT')) {
    copyCurrentFile(ctx);
    ctx.checkifQueuePause();
  } else {
    const message = workerResultMessage(state, "Skipped: File title word filter", "Skip");
    ctx.send(message);

    updateConsole(state.workerNumber, "Skipped: File title word filter:" + state.currentSourceLine)

    ctx.checkifQueuePause();
  }
};

const handleFilteredOut = (ctx, filterReason) => {
  const { state } = ctx;

  if (state.copyOnOff == true) {
    copyCurrentFile(ctx);
    ctx.checkifQueuePause();
  } else {
    const message = workerResultMessage(state, "Skipped: File property filter:" + filterReason, "Skip");
    ctx.send(message);

    ctx.checkifQueuePause();
  }
};

module.exports = {
  handleUncheckedItem,
  handleSkipOrCopy,
  handleFilteredOut,
};
