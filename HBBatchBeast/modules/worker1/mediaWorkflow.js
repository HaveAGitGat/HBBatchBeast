"use strict";

const childProcess = require("child_process");
const { handleFilteredOut } = require('./copyMode');
const { evaluateMediaFilters } = require('./mediaFilters');
const { startTranscodeWorker } = require('./transcodeWorker');

const handleFileInfo = (ctx, jsonInfo) => {
  const { state, updateConsole } = ctx;

  updateConsole(state.workerNumber, "FFprobe response received:" + state.currentSourceLine)

  try {
    state.frameCount = jsonInfo.streams[0]["nb_frames"]
    updateConsole(state.workerNumber, "Source file frame count extract:Success:" + state.currentSourceLine)
  } catch (err) {
    updateConsole(state.workerNumber, "Source file frame count extract:Fail:" + state.currentSourceLine)
  }

  try {
    state.source_file_length = jsonInfo.streams[0]["duration"]
    updateConsole(state.workerNumber, "Source file length extract:Success:" + state.currentSourceLine)
  } catch (err) {
    updateConsole(state.workerNumber, "Source file length extract:Fail:" + state.currentSourceLine)
  }

  const filterResult = evaluateMediaFilters(ctx, jsonInfo);

  if (filterResult.processFileY == true) {
    startTranscodeWorker(ctx);
  } else {
    handleFilteredOut(ctx, filterResult.filterReason);
  }
};

const startMediaWorkflow = (ctx) => {
  const { state, updateConsole } = ctx;

  updateConsole(state.workerNumber, "Launching FFprobe:" + state.currentSourceLine)

  state.infoExtractModule = childProcess.fork(state.path.join(state.moduleDir, 'mediaAnalyser.js'), [], {
    silent: true
  });

  updateConsole(state.workerNumber, "FFprobe launched successfully:" + state.currentSourceLine)

  const extractCommand = {
    type: "analyseThis",
    filePath: state.currentSourceLine,
  };

  state.infoExtractModule.send(extractCommand);

  updateConsole(state.workerNumber, "Sent to FFprobe:" + state.currentSourceLine)

  state.infoExtractModule.on('message', (message) => {
    if (message.type == "consoleMessage") {
      updateConsole(state.workerNumber, message.text);
    }

    if (message.type == "fileInfo") {
      handleFileInfo(ctx, message.info);
    }
  });
};

module.exports = {
  startMediaWorkflow,
};
