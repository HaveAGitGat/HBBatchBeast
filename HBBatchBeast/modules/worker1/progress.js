"use strict";

const appendWorkerLog = (ctx, str, isError) => {
    const { state } = ctx;

    if (state.saveWorkerLogs) {
        const message = [
            state.workerNumber,
            "appendRequest",
            state.homePath + "/Documents/HBBatchBeast/Logs/Worker" + state.workerNumber + (isError ? "ConsoleOutputError.txt" : "ConsoleOutput.txt"),
            str,
        ];
        ctx.send(message);
    }
};

const sendProgressFromOutput = (ctx, str, messageType, includeHandBrake) => {
    const { state } = ctx;

    if (includeHandBrake && state.handBrakeMode == true) {
        const numbers = "0123456789"
        const n = str.indexOf("%")

        if (str.length >= 6 && str.indexOf("%") >= 6 && numbers.includes(str.charAt(n - 5))) {
            const output = str.substring(n - 6, n + 1)

            console.log(output)
            const message = [
                state.workerNumber,
                messageType,
                state.globalQueueNumber,
                output
            ];
            ctx.send(message);
        }
    } else if (state.FFmpegMode == true) {
        if (str.includes("frame=")) {
            if (str.length >= 6) {
                const n = str.indexOf("fps");

                if (n >= 6) {
                    let output = str.substring(6, n)

                    try {
                        output = ((output / state.frameCount) * 100).toFixed(2) + "%"
                    } catch (err) { }

                    console.log(output)
                    const message = [
                        state.workerNumber,
                        messageType,
                        state.globalQueueNumber,
                        output
                    ];
                    ctx.send(message);
                }
            }
        }
    }
};

module.exports = {
    appendWorkerLog,
    sendProgressFromOutput,
};
