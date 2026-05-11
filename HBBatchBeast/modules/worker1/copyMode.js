"use strict";

const sendCopyFail = (ctx) => {
    const { state } = ctx;
    const message = [
        state.workerNumber,
        "copiedFail",
        state.globalQueueNumber,
        "Copy",
        state.errorLogFull
    ];
    ctx.send(message);
};

const sendCopySuccess = (ctx) => {
    const { state } = ctx;
    const message = [
        state.workerNumber,
        "copied",
        state.globalQueueNumber,
        "Copy",
        state.errorLogFull
    ];
    ctx.send(message);

    if (state.deleteSourceFilesOnOff == true) {
        const deleteMessage = [
            state.workerNumber,
            "deleteThisFile",
            state.globalQueueNumber,

        ];
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
    const appendMessage = [
        state.workerNumber,
        "appendRequest",
        state.homePath + "/Documents/HBBatchBeast/Logs/CommandList.txt",
        state.workerCommand + "\n",
    ];
    ctx.send(appendMessage);

    const skippedMessage = [
        state.workerNumber,
        "Skipped: Not selected",
        state.globalQueueNumber,
        "Skip",
        state.errorLogFull
    ];
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
        const message = [
            state.workerNumber,
            "Skipped: File title word filter",
            state.globalQueueNumber,
            "Skip",
            state.errorLogFull
        ];
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
        const message = [
            state.workerNumber,
            "Skipped: File property filter:" + filterReason,
            state.globalQueueNumber,
            "Skip",
            state.errorLogFull
        ];
        ctx.send(message);

        ctx.checkifQueuePause();
    }
};

module.exports = {
    handleUncheckedItem,
    handleSkipOrCopy,
    handleFilteredOut,
};
