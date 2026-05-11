"use strict";

const assignQueueMessage = (state, m) => {
    state.globalQueueNumber = m[1];
    state.skipOrCopy = m[2];
    state.copyOnOff = m[3];
    state.replaceOriginalFile = m[4];
    state.moveCorruptFileOnOff = m[5];
    state.corruptDestinationPath = m[6];
    state.mode = m[7];
    state.itemChecked = m[9];
    state.fileFiltersIncludeArray = m[10] + "";
    state.fileFiltersExcludeArray = m[11] + "";
    state.replaceOriginalFileAlways = m[12];
    state.includeAnyFilesWithProperties = m[13];
    state.includeAllFilesWithProperties = m[14];
    state.excludeAnyFilesWithProperties = m[15];
    state.excludeAllFilesWithProperties = m[16];
    state.handBrakeMode = m[17];
    state.FFmpegMode = m[18];
    state.deleteSourceFilesOnOff = m[19];
    state.batOnOff = m[20];
    state.tempFolderSelected = m[21];
    state.currentSourceLine = m[22];
    state.preset = m[23];
    state.currentDestinationLine = m[24];
    state.currentDestinationFinalLine = m[25];
    state.minimumFileSizeOnOff = m[26]
    state.minimumFileSize = m[27]
    state.maximumFileSizeOnOff = m[28]
    state.maximumFileSize = m[29]
    state.runThoroughHealthCheck = m[30]
    state.repairFile = m[31]
    state.repairCRFValue = m[32]
    state.handBrakeCLIPath = m[33]
    state.ffmpegPath = m[34]
    state.saveWorkerLogs = m[35]
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

    const processingMessage = [
        state.workerNumber,
        "processing",
        state.globalQueueNumber,
        "Running"
    ];
    ctx.send(processingMessage);
};

module.exports = {
    prepareQueueItem,
};
