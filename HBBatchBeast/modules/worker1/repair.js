"use strict";

const childProcess = require("child_process");
const { appendWorkerLog, sendProgressFromOutput } = require('./progress');
const { workerResultMessage } = require('./messages');

const buildRepairCommand = (state, repairFilePath) => {
  const preset = "-y,-c:v libx264 -crf " + state.repairCRFValue + " -c:a aac -q:a 100 -strict -2 -movflags faststart -level 41"
  const presetSplit = preset.split(',')
  let workerCommand = "";

  if (process.platform == 'win32' && state.FFmpegMode == true) {
    workerCommand = state.ffmpegPath + " " + presetSplit[0] + " -i \"" + state.currentSourceLine + "\" " + presetSplit[1] + " \"" + repairFilePath + "\" "
  }

  if (process.platform == 'linux' && state.FFmpegMode == true) {
    const ffmpegPathUnix = state.ffmpegPath.replace(/'/g, '\'\"\'\"\'');
    const currentSourceLineUnix = state.currentSourceLine.replace(/'/g, '\'\"\'\"\'');
    const repairFilePathUnix = repairFilePath.replace(/'/g, '\'\"\'\"\'');
    const preset0Unix = presetSplit[0].replace(/'/g, '\'\"\'\"\'');
    const preset1Unix = presetSplit[1].replace(/'/g, '\'\"\'\"\'');

    workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + repairFilePathUnix + "' "
  }

  if (process.platform == 'darwin' && state.FFmpegMode == true) {
    const ffmpegPathUnix = state.ffmpegPath.replace(/'/g, '\'\"\'\"\'');
    const currentSourceLineUnix = state.currentSourceLine.replace(/'/g, '\'\"\'\"\'');
    const repairFilePathUnix = repairFilePath.replace(/'/g, '\'\"\'\"\'');
    const preset0Unix = presetSplit[0].replace(/'/g, '\'\"\'\"\'');
    const preset1Unix = presetSplit[1].replace(/'/g, '\'\"\'\"\'');

    workerCommand = ffmpegPathUnix + " " + preset0Unix + " -i '" + currentSourceLineUnix + "' " + preset1Unix + " '" + repairFilePathUnix + "' "
  }

  return {
    preset,
    workerCommand,
  };
};

const getRepairFilePath = (state) => {
  let repairFilePath = state.currentSourceLine.split('.')
  repairFilePath[repairFilePath.length - 2] = repairFilePath[repairFilePath.length - 2] + "_repaired_file"
  repairFilePath = repairFilePath.join('.')

  return repairFilePath;
};

const sendUnableToRepair = (ctx, preset, repairFilePath) => {
  const { state, updateConsole } = ctx;

  updateConsole(state.workerNumber, "Unable to repair file!:" + state.currentSourceLine + (repairFilePath ? " to " + repairFilePath : ""))
  const message = workerResultMessage(state, "Unable to repair file", preset);
  ctx.send(message);

  if (state.moveCorruptFileOnOff == true) {
    ctx.moveCorruptedFile();
  }

  ctx.checkifQueuePause();
};

const verifyRepairLength = (ctx, preset, repairFilePath) => {
  const { state, updateConsole } = ctx;

  updateConsole(state.workerNumber, "Checking repaired file length!:" + repairFilePath)

  if (state.moduleDir.includes('.asar')) {
    process.env.NODE_ENV = "production";
  }

  const ffprobe = require('ffprobe');
  let ffprobeStaticPath;

  if (process.env.NODE_ENV == 'production') {
    ffprobeStaticPath = require('ffprobe-static').path.replace('app.asar', 'app.asar.unpacked')
  } else {
    ffprobeStaticPath = require('ffprobe-static').path
  }

  ffprobe(repairFilePath, { path: ffprobeStaticPath }, (err, info) => {
    if (err) {
      state.errorLogFull += "\n" + err.stack
      sendUnableToRepair(ctx, preset, repairFilePath);
      return;
    }

    const repaired_file_length = info.streams[0]["duration"]

    updateConsole(state.workerNumber, "File source length:" + parseInt(state.source_file_length))
    updateConsole(state.workerNumber, "File repaired length:" + parseInt(repaired_file_length))

    if (parseInt(state.source_file_length) === parseInt(repaired_file_length)) {
      updateConsole(state.workerNumber, "File repaired successfully!:" + state.currentSourceLine + " to " + repairFilePath)

      const message = workerResultMessage(state, "File repaired. Please inspect files.", preset);
      ctx.send(message);

      if (state.moveCorruptFileOnOff == true) {
        ctx.moveCorruptedFile();
      }
      ctx.checkifQueuePause();
    } else {
      updateConsole(state.workerNumber, "Unable to repair file!:" + state.currentSourceLine + " to " + repairFilePath)
      try {
        state.fs.unlinkSync(repairFilePath)
      } catch (err) { }

      const message = workerResultMessage(state, "Unable to repair file", preset);
      ctx.send(message);

      if (state.moveCorruptFileOnOff == true) {
        ctx.moveCorruptedFile();
      }

      ctx.checkifQueuePause();
    }
  });
};

const handleRepairExit = (ctx, message, preset, repairFilePath) => {
  const { state, updateConsole } = ctx;

  updateConsole(state.workerNumber, "Repair worker exit status received")

  state.repair_worker = "";

  console.log('shellThreadExited:', message.code);

  if (message.code == "Cancelled") {
    const cancelledMessage = workerResultMessage(state, "cancelled", preset);
    ctx.send(cancelledMessage);

    updateConsole(state.workerNumber, "Repair cancelled:" + state.currentSourceLine)

    try {
      state.fs.unlinkSync(repairFilePath)
    } catch (err) { }

    updateConsole(state.workerNumber, "File deleted:" + repairFilePath)

    ctx.checkifQueuePause();
  } else if (message.code != 0) {
    if (state.currentSourceLine.includes("'") && process.platform == 'linux') {
      state.errorLogFull += "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + state.currentSourceLine
      updateConsole(state.workerNumber, "\n Operation may have failed due to apostrophe in file name. Please try using the setting 'Remove apostrophes from filenames' in the advanced settings section.:" + state.currentSourceLine)
    }

    sendUnableToRepair(ctx, preset, repairFilePath);
  } else {
    verifyRepairLength(ctx, preset, repairFilePath);
  }
};

const attachRepairWorkerListeners = (ctx, preset, repairFilePath) => {
  const { state, updateConsole } = ctx;

  state.repair_worker.stdout.on('data', (data) => {
    const str = "" + data;

    appendWorkerLog(ctx, str, false);
    sendProgressFromOutput(ctx, str, "repair_worker_percentage", false);
  });

  state.repair_worker.stderr.on('data', (data) => {
    const str = "" + data;

    appendWorkerLog(ctx, str, true);

    state.errorLogFull += data;
    sendProgressFromOutput(ctx, str, "repair_worker_percentage", false);
  });

  state.repair_worker.on("exit", () => {
    updateConsole(state.workerNumber, "Repair worker exited")
  });

  state.repair_worker.on('message', (message) => {
    if (message.type == "consoleMessage") {
      updateConsole(state.workerNumber, message.text);
    }

    if (message.error) {
      console.error(message.error);
    }

    if (message.type == "Exit") {
      handleRepairExit(ctx, message, preset, repairFilePath);
    }
  });
};

const attemptToRepair = (ctx) => {
  const { state, updateConsole } = ctx;
  const repairWorkerPath = "worker2.js"

  updateConsole(state.workerNumber, "Launching repair worker:")

  state.repair_worker = childProcess.fork(state.path.join(state.moduleDir, repairWorkerPath), [], {
    silent: true
  });
  updateConsole(state.workerNumber, "Launching repair worker successful:")

  const repairFilePath = getRepairFilePath(state);
  const repairCommand = buildRepairCommand(state, repairFilePath);
  const processFileMessage = {
    type: "processFile",
    command: repairCommand.workerCommand,
  };

  updateConsole(state.workerNumber, "Sending command to repair worker:" + repairCommand.workerCommand)
  state.repair_worker.send(processFileMessage);

  attachRepairWorkerListeners(ctx, repairCommand.preset, repairFilePath);
};

module.exports = {
  attemptToRepair,
};
