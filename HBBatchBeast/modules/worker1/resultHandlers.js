"use strict";

const {
  appendRequestMessage,
  deleteSourceFileMessage,
  fileSizesMessage,
  workerResultMessage,
} = require('./messages');

const moveCorruptedFile = (ctx) => {
  const { state, updateConsole } = ctx;
  let stringProcessingSlash;

  if (process.platform == 'win32') {
    stringProcessingSlash = "\\";
  }

  if (process.platform == 'linux' || process.platform == 'darwin') {
    stringProcessingSlash = "/";
  }

  const pointer = state.currentSourceLine.split(stringProcessingSlash);
  const filePathEnd = pointer[pointer.length - 1]

  state.corruptDestinationPath = state.corruptDestinationPath + stringProcessingSlash + filePathEnd;

  updateConsole(state.workerNumber, "Moving corrupt file:" + state.currentSourceLine + " to " + state.corruptDestinationPath)

  try {
    state.fsextra.moveSync(state.currentSourceLine, state.corruptDestinationPath, {
      overwrite: true
    })
    updateConsole(state.workerNumber, "Moving corrupt file successful:" + state.currentSourceLine + " to " + state.corruptDestinationPath)
  } catch (err) {
    updateConsole(state.workerNumber, "Moving corrupt file unsuccessful:" + state.currentSourceLine + " to " + state.corruptDestinationPath)
  }
};

const writeHealthCheckErrorLog = (ctx) => {
  const { state } = ctx;
  let errorLogWrite;

  if (state.saveWorkerLogs) {
    errorLogWrite = "[" + ctx.getDateNow() + "#" + ctx.getTimeNow() + "]" + state.currentSourceLine + "\r\n" + state.errorLogFull + "\r\n"
  } else {
    errorLogWrite = state.currentSourceLine + "\r\n"
  }

  const message = appendRequestMessage(
    state,
    state.homePath + "/Documents/HBBatchBeast/Logs/ErrorLog.txt",
    errorLogWrite
  );
  ctx.send(message);
};

const handleHealthCheckError = (ctx) => {
  const { state, updateConsole } = ctx;

  if (state.FFmpegMode == true && state.repairFile == true) {
    if (state.source_file_length !== undefined) {
      ctx.attemptToRepair();
    } else {
      if (state.currentSourceLine.includes("'") && process.platform == 'linux') {
        state.errorLogFull += "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + state.currentSourceLine
        updateConsole(state.workerNumber, "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + state.currentSourceLine)
      }

      updateConsole(state.workerNumber, "Unable to repair file!:" + state.currentSourceLine)
      const message = workerResultMessage(state, "Unable to repair file");
      ctx.send(message);

      if (state.moveCorruptFileOnOff == true) {
        ctx.moveCorruptedFile();
      }

      ctx.checkifQueuePause();
    }

    writeHealthCheckErrorLog(ctx);
  } else {
    const errorMessage = workerResultMessage(state, "error");
    ctx.send(errorMessage);

    updateConsole(state.workerNumber, "Sub worker error when processing:" + state.currentSourceLine)

    if (state.moveCorruptFileOnOff == true) {
      ctx.moveCorruptedFile();
    }

    writeHealthCheckErrorLog(ctx);
    ctx.checkifQueuePause();
  }
};

const writeConversionErrorLog = (ctx) => {
  const { state } = ctx;

  if (state.tempFolderSelected == true) {
    const message = appendRequestMessage(
      state,
      state.homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
      "[" + ctx.getDateNow() + "#" + ctx.getTimeNow() + "]" + "--------ERROR----------" + state.currentSourceLine + "------------to----------" + state.currentDestinationFinalLine + "----------using preset----------:" + state.preset + "\r\n" + state.errorLogFull + "\r\n"
    );
    ctx.send(message);
  } else {
    const message = appendRequestMessage(
      state,
      state.homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
      "[" + ctx.getDateNow() + "#" + ctx.getTimeNow() + "]" + "--------ERROR----------" + state.currentSourceLine + "------------to----------" + state.currentDestinationLine + "----------using preset----------:" + state.preset + "\r\n" + state.errorLogFull + "\r\n"
    );
    ctx.send(message);
  }
};

const workerEncounteredError = (ctx, messageOne) => {
  const { state, updateConsole } = ctx;

  if (messageOne == "Cancelled") {
    const message = workerResultMessage(state, "cancelled");
    ctx.send(message);

    updateConsole(state.workerNumber, "Item cancelled:" + state.currentSourceLine)

    ctx.checkifQueuePause();
  } else {
    if (state.mode == "healthCheck") {
      handleHealthCheckError(ctx);
    } else {
      const message = workerResultMessage(state, "error");
      ctx.send(message);

      updateConsole(state.workerNumber, "Sub worker error when processing:" + state.currentSourceLine)

      writeConversionErrorLog(ctx);
      ctx.checkifQueuePause();
    }
  }
};

const appendProcessedLog = (ctx) => {
  const { state } = ctx;

  if (state.tempFolderSelected == true) {
    const message = appendRequestMessage(
      state,
      state.homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
      "[" + ctx.getDateNow() + "#" + ctx.getTimeNow() + "]" + "--------Processed----------" + state.currentSourceLine + "------------to----------" + state.currentDestinationFinalLine + "----------using preset----------:" + state.preset + "\r\n"
    );
    ctx.send(message);
  } else {
    const message = appendRequestMessage(
      state,
      state.homePath + "/Documents/HBBatchBeast/Logs/fileConversionLog.txt",
      "[" + ctx.getDateNow() + "#" + ctx.getTimeNow() + "]" + "--------Processed----------" + state.currentSourceLine + "------------to----------" + state.currentDestinationLine + "----------using preset----------:" + state.preset + "\r\n"
    );
    ctx.send(message);
  }
};

const maybeRunBatFile = (ctx) => {
  const { state, updateConsole } = ctx;

  if (state.batOnOff != "") {
    let pathBat = state.batOnOff;
    pathBat = "\"" + pathBat + "\""

    try {
      updateConsole(state.workerNumber, "Launching bat file:" + pathBat)
      require('child_process').execSync(pathBat);

      updateConsole(state.workerNumber, "Bat file launched succcesfully:" + pathBat)
    } catch (err) {
      updateConsole(state.workerNumber, "Launching bat file failed:" + pathBat)
    }
  }
};

const moveFromTempFolder = (ctx) => {
  const { state, updateConsole } = ctx;

  if (state.tempFolderSelected == true) {
    try {
      updateConsole(state.workerNumber, "Moving file:" + state.currentDestinationLine + " to " + state.currentDestinationFinalLine)

      state.fsextra.moveSync(state.currentDestinationLine, state.currentDestinationFinalLine, {
        overwrite: true
      })

      updateConsole(state.workerNumber, "File moved successfully:" + state.currentDestinationLine + " to " + state.currentDestinationFinalLine)
    } catch (err) {
      updateConsole(state.workerNumber, "Moving file failed:" + state.currentDestinationLine + " to " + state.currentDestinationFinalLine)
    }
  }
};

const maybeQueueSourceDeletion = (ctx) => {
  const { state, updateConsole } = ctx;

  if (state.deleteSourceFilesOnOff == true) {
    const message = deleteSourceFileMessage(state);
    ctx.send(message);

    updateConsole(state.workerNumber, "File queued for deletion:" + state.currentSourceLine)
  }
};

const replaceOriginalFileAtPath = (ctx, actualDestinationPath) => {
  const { state, updateConsole } = ctx;
  let newCurrentSourceLine;

  try {
    const newFilePath = state.currentSourceLine.slice(0, state.currentSourceLine.lastIndexOf(global.stringProcessingSlash));
    const newFileSubPath = actualDestinationPath.slice(actualDestinationPath.lastIndexOf(global.stringProcessingSlash), actualDestinationPath.length);
    newCurrentSourceLine = newFilePath + global.stringProcessingSlash + newFileSubPath
    state.errorLogFull += "\n Deleting original file: " + state.currentSourceLine

    state.fs.unlinkSync(state.currentSourceLine)

    state.errorLogFull += "\n Moving new file to original folder: " + actualDestinationPath + " to " + newCurrentSourceLine
    updateConsole(state.workerNumber, "Moving file:" + state.currentSourceLine + " to " + newCurrentSourceLine)

    state.fsextra.moveSync(actualDestinationPath, newCurrentSourceLine, {
      overwrite: true
    })

    const replacedMessage = workerResultMessage(state, "Original replaced");
    ctx.send(replacedMessage);
    updateConsole(state.workerNumber, "Original file replaced:" + state.currentSourceLine + " to " + newCurrentSourceLine)

    const appendMessage = appendRequestMessage(
      state,
      state.homePath + "/Documents/HBBatchBeast/Logs/originalFileReplacedList.txt",
      state.path.normalize(newCurrentSourceLine) + "\n"
    );
    ctx.send(appendMessage);
  } catch (err) {
    state.errorLogFull += "\n HBBatchBeast ALERT: Error replacing original file";

    const message = workerResultMessage(state, "error", state.preset, state.errorLogFull + "\n" + err.stack);
    ctx.send(message);

    updateConsole(state.workerNumber, "Error replacing original file:" + state.currentSourceLine + " to " + newCurrentSourceLine)
  }
};

const maybeReplaceOriginalFile = (ctx) => {
  const { state, updateConsole } = ctx;

  if (state.replaceOriginalFile == true || state.replaceOriginalFileAlways == true) {
    let originalFileSize;
    let newFileSize;
    let newFinalFileSize;

    if (state.fs.existsSync(state.currentSourceLine)) {
      originalFileSize = state.fs.statSync(state.currentSourceLine)
      originalFileSize = originalFileSize.size
    }

    if (state.fs.existsSync(state.currentDestinationLine)) {
      newFileSize = state.fs.statSync(state.currentDestinationLine)
      newFileSize = newFileSize.size
    }

    if (state.fs.existsSync(state.currentDestinationFinalLine)) {
      newFinalFileSize = state.fs.statSync(state.currentDestinationFinalLine)
      newFinalFileSize = newFinalFileSize.size
    }

    if (state.tempFolderSelected == true) {
      if (newFinalFileSize < originalFileSize || state.replaceOriginalFileAlways == true) {
        replaceOriginalFileAtPath(ctx, state.currentDestinationFinalLine)
      } else {
        const message = workerResultMessage(state, "Original not replaced: New file is larger");
        ctx.send(message);

        updateConsole(state.workerNumber, "Original not replaced: New file is larger:" + state.currentSourceLine)
      }
    } else {
      if (newFileSize < originalFileSize || state.replaceOriginalFileAlways == true) {
        replaceOriginalFileAtPath(ctx, state.currentDestinationLine)
      } else {
        const message = workerResultMessage(state, "Original not replaced: New file is larger");
        ctx.send(message);
        updateConsole(state.workerNumber, "Original not replaced: New file is larger:" + state.currentDestinationLine)
      }
    }
  } else {
    const message = workerResultMessage(state, "success");
    ctx.send(message);
  }
};

const workerNotEncounteredError = (ctx) => {
  const { state, updateConsole } = ctx;

  if (state.mode == "healthCheck") {
    const appendMessage = appendRequestMessage(
      state,
      state.homePath + "/Documents/HBBatchBeast/Logs/healthyFileList.txt",
      state.currentSourceLine + "\n"
    );
    ctx.send(appendMessage);

    updateConsole(state.workerNumber, "No errors found with this file:" + state.currentSourceLine)

    const successMessage = workerResultMessage(state, "success");
    ctx.send(successMessage);

    ctx.checkifQueuePause();
  } else {
    const sourcefileSizeInGbytes = (((state.fs.statSync(state.currentSourceLine)).size) / 1000000000.0);
    const destfileSizeInGbytes = (((state.fs.statSync(state.currentDestinationLine)).size) / 1000000000.0);

    const message = fileSizesMessage(state, sourcefileSizeInGbytes, destfileSizeInGbytes);
    ctx.send(message);

    maybeRunBatFile(ctx);
    moveFromTempFolder(ctx);
    appendProcessedLog(ctx);
    maybeQueueSourceDeletion(ctx);
    maybeReplaceOriginalFile(ctx);
    ctx.checkifQueuePause();
  }
};

module.exports = {
  moveCorruptedFile,
  workerEncounteredError,
  workerNotEncounteredError,
};
