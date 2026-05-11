"use strict";

const workerMessage = (state, type, fields) => Object.assign({
  workerNumber: state.workerNumber,
  type,
}, fields);

const workerResultMessage = (state, type, preset = state.preset, errorLog = state.errorLogFull) => workerMessage(state, type, {
  queueNumber: state.globalQueueNumber,
  preset,
  errorLog,
});

const appendRequestMessage = (state, filePath, contents) => workerMessage(state, "appendRequest", {
  filePath,
  contents,
});

const deleteSourceFileMessage = (state) => workerMessage(state, "deleteThisFile", {
  queueNumber: state.globalQueueNumber,
});

const progressMessage = (state, type, progress) => workerMessage(state, type, {
  queueNumber: state.globalQueueNumber,
  progress,
});

const processingMessage = (state, status) => workerMessage(state, "processing", {
  queueNumber: state.globalQueueNumber,
  status,
});

const ffprobeStatusMessage = (state, status) => workerMessage(state, "FFPROBE", {
  queueNumber: state.globalQueueNumber,
  status,
  filePath: state.currentSourceLine,
});

const fileSizesMessage = (state, sourceFileSize, outputFileSize) => workerMessage(state, "fileSizes", {
  queueNumber: state.globalQueueNumber,
  sourceFileSize,
  outputFileSize,
});

module.exports = {
  workerResultMessage,
  appendRequestMessage,
  deleteSourceFileMessage,
  progressMessage,
  processingMessage,
  ffprobeStatusMessage,
  fileSizesMessage,
};
