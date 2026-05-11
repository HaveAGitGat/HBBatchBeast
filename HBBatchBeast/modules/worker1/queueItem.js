"use strict";

const { processingMessage } = require('./messages');

const assignQueueMessage = (state, queueItem) => {
  state.globalQueueNumber = queueItem.globalQueueNumber;
  state.skipOrCopy = queueItem.skipOrCopy;
  state.copyOnOff = queueItem.copyOnOff;
  state.replaceOriginalFile = queueItem.replaceOriginalFile;
  state.moveCorruptFileOnOff = queueItem.moveCorruptFileOnOff;
  state.corruptDestinationPath = queueItem.corruptDestinationPath;
  state.mode = queueItem.mode;
  state.itemChecked = queueItem.itemChecked;
  state.fileFiltersIncludeArray = queueItem.fileFiltersIncludeArray + "";
  state.fileFiltersExcludeArray = queueItem.fileFiltersExcludeArray + "";
  state.replaceOriginalFileAlways = queueItem.replaceOriginalFileAlways;
  state.includeAnyFilesWithProperties = queueItem.includeAnyFilesWithProperties;
  state.includeAllFilesWithProperties = queueItem.includeAllFilesWithProperties;
  state.excludeAnyFilesWithProperties = queueItem.excludeAnyFilesWithProperties;
  state.excludeAllFilesWithProperties = queueItem.excludeAllFilesWithProperties;
  state.handBrakeMode = queueItem.handBrakeMode;
  state.FFmpegMode = queueItem.FFmpegMode;
  state.deleteSourceFilesOnOff = queueItem.deleteSourceFilesOnOff;
  state.batOnOff = queueItem.batOnOff;
  state.tempFolderSelected = queueItem.tempFolderSelected;
  state.currentSourceLine = queueItem.currentSourceLine;
  state.preset = queueItem.preset;
  state.currentDestinationLine = queueItem.currentDestinationLine;
  state.currentDestinationFinalLine = queueItem.currentDestinationFinalLine;
  state.minimumFileSizeOnOff = queueItem.minimumFileSizeOnOff
  state.minimumFileSize = queueItem.minimumFileSize
  state.maximumFileSizeOnOff = queueItem.maximumFileSizeOnOff
  state.maximumFileSize = queueItem.maximumFileSize
  state.runThoroughHealthCheck = queueItem.runThoroughHealthCheck
  state.repairFile = queueItem.repairFile
  state.repairCRFValue = queueItem.repairCRFValue
  state.handBrakeCLIPath = queueItem.handBrakeCLIPath
  state.ffmpegPath = queueItem.ffmpegPath
  state.saveWorkerLogs = queueItem.saveWorkerLogs
};

const prepareDestinationNames = (state) => {
  state.sourceFileContainer = state.currentSourceLine.split('.')
  state.sourceFileContainer = state.sourceFileContainer[state.sourceFileContainer.length - 1]

  state.currentDestinationLine_unmodified = state.currentDestinationLine.split('.')
  state.currentDestinationLine_unmodified[state.currentDestinationLine_unmodified.length - 1] = state.sourceFileContainer
  state.currentDestinationLine_unmodified = state.currentDestinationLine_unmodified.join('.')

  try {
    state.currentDestinationFinalLine_unmodified = state.currentDestinationFinalLine.split('.')
    state.currentDestinationFinalLine_unmodified[state.currentDestinationFinalLine_unmodified.length - 1] = state.sourceFileContainer
    state.currentDestinationFinalLine_unmodified = state.currentDestinationFinalLine_unmodified.join('.')
  } catch (err) { }
};

const applyHealthCheckMode = (state) => {
  if (state.mode == "healthCheck") {
    state.deleteSourceFilesOnOff = false
  }

  if (state.mode == "healthCheck") {
    if (state.runThoroughHealthCheck) {
      state.handBrakeMode = false;
      state.FFmpegMode = true;
    } else {
      state.handBrakeMode = true;
      state.FFmpegMode = false;
    }
  }
};

const buildWorkerCommand = (state) => {
  const presetSplit = state.preset.split(',')
  let workerCommand = "";

  if (process.platform == 'win32' && state.handBrakeMode == true) {
    workerCommand = state.handBrakeCLIPath + " -i \"" + state.currentSourceLine + "\" -o \"" + state.currentDestinationLine + "\" " + state.preset;
  } else if (process.platform == 'win32' && state.FFmpegMode == true) {
    workerCommand = state.ffmpegPath + " " + presetSplit[0] + " -i \"" + state.currentSourceLine + "\" " + presetSplit[1] + " \"" + state.currentDestinationLine + "\" "
  }

  const currentSourceLineUnix = state.currentSourceLine.replace(/'/g, '\'\"\'\"\'');
  const currentDestinationLineUnix = state.currentDestinationLine.replace(/'/g, '\'\"\'\"\'');
  const presetUnix = state.preset.replace(/'/g, '\'\"\'\"\'');

  const ffmpegPathUnix = state.ffmpegPath.replace(/'/g, '\'\"\'\"\'');
  let preset0Unix;
  let preset1Unix;
  try {
    preset0Unix = presetSplit[0].replace(/'/g, '\'\"\'\"\'');
  } catch (err) { }
  try {
    preset1Unix = presetSplit[1].replace(/'/g, '\'\"\'\"\'');
  } catch (err) { }

  if (process.platform == 'linux' && state.handBrakeMode == true) {
    workerCommand = "HandBrakeCLI -i '" + currentSourceLineUnix + "' -o '" + currentDestinationLineUnix + "' " + presetUnix;
  } else if (process.platform == 'linux' && state.FFmpegMode == true) {
    workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + currentDestinationLineUnix + "' "
  }

  if (process.platform == 'darwin' && state.handBrakeMode == true) {
    workerCommand = "/usr/local/bin/HandBrakeCLI -i '" + currentSourceLineUnix + "' -o '" + currentDestinationLineUnix + "' " + presetUnix;
  } else if (process.platform == 'darwin' && state.FFmpegMode == true) {
    workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + currentDestinationLineUnix + "' "
  }

  return workerCommand;
};

const prepareQueueItem = (ctx, m) => {
  const { state, updateConsole } = ctx;

  assignQueueMessage(state, m);

  updateConsole(state.workerNumber, "Received item:" + state.currentSourceLine)

  prepareDestinationNames(state);
  applyHealthCheckMode(state);

  state.workerCommand = buildWorkerCommand(state);
  state.errorLogFull = ""
  state.errorLogFull += "Command: \n\n"
  state.errorLogFull += state.workerCommand + "\n\n"

  ctx.send(processingMessage(state, "Running"));
};

module.exports = {
  prepareQueueItem,
};
