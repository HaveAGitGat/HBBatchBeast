"use strict";

const configureEnvironment = (moduleDir) => {
  if (moduleDir.includes('.asar')) {
    process.env.NODE_ENV = "production";
  }

  if (process.platform == 'win32') {
    global.stringProcessingSlash = "\\";
  }

  if (process.platform == 'linux' || process.platform == 'darwin') {
    global.stringProcessingSlash = "/";
  }
};

const createWorkerState = ({
  workerNumber,
  homePath,
  shell,
  fs,
  fsextra,
  path,
  moduleDir,
}) => ({
  workerNumber,
  homePath,
  shell,
  fs,
  fsextra,
  path,
  moduleDir,
  globalQueueNumber: undefined,
  skipOrCopy: undefined,
  copyOnOff: undefined,
  replaceOriginalFile: undefined,
  replaceOriginalFileAlways: undefined,
  itemChecked: undefined,
  fileFiltersIncludeArray: undefined,
  fileFiltersExcludeArray: undefined,
  includeAnyFilesWithProperties: undefined,
  includeAllFilesWithProperties: undefined,
  excludeAnyFilesWithProperties: undefined,
  excludeAllFilesWithProperties: undefined,
  handBrakeMode: undefined,
  FFmpegMode: undefined,
  moveCorruptFileOnOff: undefined,
  corruptDestinationPath: undefined,
  mode: undefined,
  shellThreadModule: undefined,
  repair_worker: undefined,
  infoExtractModule: undefined,
  frameCount: undefined,
  deleteSourceFilesOnOff: undefined,
  batOnOff: undefined,
  tempFolderSelected: undefined,
  currentDestinationLine: undefined,
  currentDestinationFinalLine: undefined,
  currentSourceLine: undefined,
  preset: undefined,
  minimumFileSizeOnOff: undefined,
  minimumFileSize: undefined,
  maximumFileSizeOnOff: undefined,
  maximumFileSize: undefined,
  runThoroughHealthCheck: undefined,
  errorLogFull: undefined,
  source_file_length: undefined,
  sourceFileContainer: undefined,
  currentDestinationLine_unmodified: undefined,
  currentDestinationFinalLine_unmodified: undefined,
  repairFile: undefined,
  repairCRFValue: undefined,
  handBrakeCLIPath: undefined,
  ffmpegPath: undefined,
  saveWorkerLogs: undefined,
  workerCommand: undefined,
});

const updateConsole = (workerNumber, text) => {
  const message = [
    workerNumber,
    "consoleMessage",
    text,
  ];
  process.send(message);
};

const checkifQueuePause = (ctx) => {
  const { state } = ctx;
  const f = state.fs.readFileSync(state.homePath + '/Documents/HBBatchBeast/Config/queueStartStop.txt', 'utf8');
  if (f == "1") {
    const message = [
      state.workerNumber,
      "queueRequest",
    ];
    ctx.send(message);
  }
};

const getDateNow = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd
  }

  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  mm = months[mm - 1];
  const today2 = dd + '-' + mm + '-' + yyyy;
  return today2
};

const getTimeNow = () => {
  const d = new Date(),
    h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
    m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  const s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
  const timenow = h + ':' + m + ':' + s;

  return timenow
};

module.exports = {
  configureEnvironment,
  createWorkerState,
  updateConsole,
  checkifQueuePause,
  getDateNow,
  getTimeNow,
};
