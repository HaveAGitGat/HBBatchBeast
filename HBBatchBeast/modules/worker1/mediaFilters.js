"use strict";

const sendFfprobeStatus = (ctx, status) => {
  const { state, updateConsole } = ctx;
  const message = [
    state.workerNumber,
    "FFPROBE",
    state.globalQueueNumber,
    status,
    state.currentSourceLine,
  ];
  ctx.send(message);
  updateConsole(state.workerNumber, "FFprobe " + status + ":" + state.currentSourceLine)
};

const minmaxThreshold = (ctx, result) => {
  const { state } = ctx;
  if (state.minimumFileSizeOnOff == true || state.maximumFileSizeOnOff == true) {
    try {
      let singleFileSize = state.fs.statSync(state.currentSourceLine)
      singleFileSize = singleFileSize.size
      const fileSizeInMbytes = singleFileSize / 1000000.0;

      if (state.minimumFileSizeOnOff == true) {
        if (fileSizeInMbytes < state.minimumFileSize) {
          result.processFileY = false
          result.filterReason += "File below minimum MB size "
        }
      }

      if (state.maximumFileSizeOnOff == true) {
        if (fileSizeInMbytes > state.maximumFileSize) {
          result.processFileY = false
          result.filterReason += "File above maximum MB size "
        }
      }
    } catch (err) { }
  }
};

const validateStreamsReadable = (jsonInfo) => {
  for (let i = 0; i < jsonInfo.streams.length; i++) {
    Object.keys(jsonInfo.streams[i]);
  }
};

const evaluateHealthCheck = (ctx, jsonInfo) => {
  try {
    validateStreamsReadable(jsonInfo);

    sendFfprobeStatus(ctx, "OK");
  } catch (err) {
    sendFfprobeStatus(ctx, "Fail");
  }

  return {
    processFileY: true,
    filterReason: "",
  };
};

const evaluateIncludeFilters = (ctx, jsonInfo) => {
  const { state } = ctx;
  const result = {
    processFileY: false,
    filterReason: "Excluded, does not meet 'Include' conditions",
  };
  try {
    const validateArray = []
    const fileFiltersIncludeArray = state.fileFiltersIncludeArray.split(',');

    for (let i = 0; i < jsonInfo.streams.length; i++) {
      Object.keys(jsonInfo.streams[i]).forEach((key) => {
        for (let j = 0; j < fileFiltersIncludeArray.length; j++) {
          if (fileFiltersIncludeArray[j].includes(key + ": '" + jsonInfo.streams[i][key] + "'")) {
            result.processFileY = true
            result.filterReason = "Include: " + key + ": '" + jsonInfo.streams[i][key] + "' "
            validateArray.push(true)
          }
        }
      });
    }

    if (state.includeAllFilesWithProperties == true) {
      if ((validateArray.length + 1) == fileFiltersIncludeArray.length) {
        result.processFileY = true
      } else {
        result.processFileY = false
      }
    }

    sendFfprobeStatus(ctx, "OK");
  } catch (err) {
    sendFfprobeStatus(ctx, "Fail");
    result.processFileY = true
  }

  minmaxThreshold(ctx, result);
  return result;
};

const evaluateExcludeFilters = (ctx, jsonInfo) => {
  const { state } = ctx;
  const result = {
    processFileY: true,
    filterReason: "",
  };
  try {
    const validateArray = []
    const fileFiltersExcludeArray = state.fileFiltersExcludeArray.split(',');

    for (let i = 0; i < jsonInfo.streams.length; i++) {
      Object.keys(jsonInfo.streams[i]).forEach((key) => {
        for (let j = 0; j < fileFiltersExcludeArray.length; j++) {
          if (fileFiltersExcludeArray[j].includes(key + ": '" + jsonInfo.streams[i][key] + "'")) {
            result.processFileY = false
            result.filterReason += "Exclude: " + key + ": '" + jsonInfo.streams[i][key] + "' "
            validateArray.push(true)
          }
        }
      });
    }

    if (state.excludeAllFilesWithProperties == true) {
      if ((validateArray.length + 1) == fileFiltersExcludeArray.length) {
        result.processFileY = false
      } else {
        result.processFileY = true
      }
    }

    sendFfprobeStatus(ctx, "OK");
  } catch (err) {
    sendFfprobeStatus(ctx, "Fail");
    result.processFileY = true
  }

  minmaxThreshold(ctx, result);
  return result;
};

const evaluateDefaultFilters = (ctx, jsonInfo) => {
  const result = {
    processFileY: true,
    filterReason: "",
  };

  try {
    validateStreamsReadable(jsonInfo);

    sendFfprobeStatus(ctx, "OK");
  } catch (err) {
    sendFfprobeStatus(ctx, "Fail");
  }

  minmaxThreshold(ctx, result);
  return result;
};

const evaluateMediaFilters = (ctx, jsonInfo) => {
  const { state } = ctx;

  if (state.mode == "healthCheck") {
    return evaluateHealthCheck(ctx, jsonInfo);
  }

  if (state.includeAnyFilesWithProperties == true || state.includeAllFilesWithProperties == true) {
    return evaluateIncludeFilters(ctx, jsonInfo);
  }

  if (state.excludeAnyFilesWithProperties == true || state.excludeAllFilesWithProperties == true) {
    return evaluateExcludeFilters(ctx, jsonInfo);
  }

  return evaluateDefaultFilters(ctx, jsonInfo);
};

module.exports = {
  evaluateMediaFilters,
};
