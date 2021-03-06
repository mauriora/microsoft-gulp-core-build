"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.markTaskCreationTime = exports.initialize = exports.logEndSubtask = exports.logStartSubtask = exports.setExitCode = exports.getWatchMode = exports.setWatchMode = exports.getStart = exports.getErrors = exports.getWarnings = exports.writeError = exports.generateGulpError = exports.verbose = exports.fileError = exports.fileWarning = exports.fileLog = exports.error = exports.warn = exports.addSuppression = exports.coverageData = exports.endTaskSrc = exports.functionalTestRun = exports.TestResultState = exports.reset = exports.log = exports.logSummary = void 0;
const colors = require("colors");
const path = require("path");
// eslint-disable-next-line
const prettyTime = require('pretty-hrtime');
const state = require("./State");
const config_1 = require("./config");
const index_1 = require("./index");
const WROTE_ERROR_KEY = '__gulpCoreBuildWroteError';
let wiredUpErrorHandling = false;
let duringFastExit = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalInstance = global;
const localCache = (globalInstance.__loggingCache = globalInstance.__loggingCache || {
    warnings: [],
    errors: [],
    testsRun: 0,
    subTasksRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    testsFlakyFailed: 0,
    testsSkipped: 0,
    taskRun: 0,
    taskErrors: 0,
    coverageResults: 0,
    coveragePass: 0,
    coverageTotal: 0,
    totalTaskHrTime: undefined,
    totalTaskSrc: 0,
    wroteSummary: false,
    writingSummary: false,
    writeSummaryCallbacks: [],
    exitCode: 0,
    writeSummaryLogs: [],
    errorAndWarningSuppressions: [],
    gulp: undefined,
    gulpErrorCallback: undefined,
    gulpStopCallback: undefined,
    shouldLogErrorsDuringSummary: false,
    shouldLogWarningsDuringSummary: false
});
if (!localCache.start) {
    localCache.start = process.hrtime();
}
function isVerbose() {
    return config_1.getFlagValue('verbose');
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatError(e) {
    if (!e.err) {
        if (isVerbose()) {
            return e.message + '\r\n' + e.stack;
        }
        else {
            return e.message;
        }
    }
    // PluginError
    if (typeof e.err.showStack === 'boolean') {
        return e.err.toString() + (e.err.stack && isVerbose() ? '\r\n' + e.err.stack : '');
    }
    // normal error
    if (e.err.stack) {
        if (isVerbose()) {
            return e.err.stack;
        }
        else {
            return e.err.message;
        }
    }
    // unknown (string, number, etc.)
    if (typeof Error === 'undefined') {
        if (isVerbose()) {
            return e.message + '\r\n' + e.stack;
        }
        else {
            return e.message;
        }
    }
    else {
        let output = String(e.err);
        try {
            output = JSON.stringify(e.err);
        }
        catch (e) {
            // Do nothing
        }
        if (isVerbose()) {
            return new Error(output).stack;
        }
        else {
            return new Error(output).message;
        }
    }
}
function afterStreamFlushed(streamName, callback) {
    if (duringFastExit) {
        callback();
    }
    else {
        const stream = process[streamName];
        const outputWritten = stream.write('');
        if (outputWritten) {
            setTimeout(() => {
                callback();
            }, 250);
        }
        else {
            stream.once('drain', () => {
                setTimeout(() => {
                    callback();
                }, 250);
            });
        }
    }
}
function afterStreamsFlushed(callback) {
    afterStreamFlushed('stdout', () => {
        afterStreamFlushed('stderr', () => {
            callback();
        });
    });
}
function writeSummary(callback) {
    localCache.writeSummaryCallbacks.push(callback);
    if (!localCache.writingSummary) {
        localCache.writingSummary = true;
        // flush the log
        afterStreamsFlushed(() => {
            const shouldRelogIssues = config_1.getFlagValue('relogIssues');
            log(colors.magenta('==================[ Finished ]=================='));
            const warnings = getWarnings();
            if (shouldRelogIssues) {
                for (let x = 0; x < warnings.length; x++) {
                    console.error(colors.yellow(warnings[x]));
                }
            }
            if (shouldRelogIssues && (localCache.taskErrors > 0 || getErrors().length)) {
                const errors = getErrors();
                for (let x = 0; x < errors.length; x++) {
                    console.error(colors.red(errors[x]));
                }
            }
            afterStreamsFlushed(() => {
                for (const writeSummaryString of localCache.writeSummaryLogs) {
                    log(writeSummaryString);
                }
                const totalDuration = process.hrtime(getStart());
                const name = state.builtPackage.name || 'with unknown name';
                const version = state.builtPackage.version || 'unknown';
                log(`Project ${name} version:`, colors.yellow(version));
                log('Build tools version:', colors.yellow(state.coreBuildPackage.version || ''));
                log('Node version:', colors.yellow(process.version));
                // log('Create tasks duration:', colors.yellow(prettyTime(localCache.taskCreationTime)));
                // log('Read src tasks duration:', colors.yellow(prettyTime(localCache.totalTaskHrTime)));
                log('Total duration:', colors.yellow(prettyTime(totalDuration)));
                // log(`Tasks run: ${colors.yellow(localCache.taskRun + '')} ` +
                //     `Subtasks run: ${colors.yellow(localCache.subTasksRun + '')}`);
                if (localCache.testsRun > 0) {
                    log('Tests results -', 'Passed:', colors.green(localCache.testsPassed + ''), 'Failed:', colors.red(localCache.testsFailed + ''), 
                    // 'Flaky:', colors.yellow(localCache.testsFlakyFailed + ''),
                    'Skipped:', colors.yellow(localCache.testsSkipped + ''));
                }
                if (localCache.coverageResults > 0) {
                    log('Coverage results -', 'Passed:', colors.green(localCache.coveragePass + ''), 'Failed:', colors.red(localCache.coverageResults - localCache.coveragePass + ''), 'Avg. Cov.:', colors.yellow(Math.floor(localCache.coverageTotal / localCache.coverageResults) + '%'));
                }
                if (getWarnings().length) {
                    log('Task warnings:', colors.yellow(getWarnings().length.toString()));
                }
                let totalErrors = 0;
                if (localCache.taskErrors > 0 || getErrors().length) {
                    totalErrors = localCache.taskErrors + getErrors().length;
                    log('Task errors:', colors.red(totalErrors + ''));
                }
                localCache.wroteSummary = true;
                const callbacks = localCache.writeSummaryCallbacks;
                localCache.writeSummaryCallbacks = [];
                for (const writeSummaryCallback of callbacks) {
                    writeSummaryCallback();
                }
            });
        });
    }
    else if (localCache.wroteSummary) {
        const callbacks = localCache.writeSummaryCallbacks;
        localCache.writeSummaryCallbacks = [];
        for (const writeSummaryCallback of callbacks) {
            writeSummaryCallback();
        }
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _writeTaskError(e) {
    if (!e || !(e.err && e.err[WROTE_ERROR_KEY])) {
        writeError(e);
        localCache.taskErrors++;
    }
}
function exitProcess(errorCode) {
    if (!localCache.watchMode) {
        process.stdout.write('', () => {
            // process.exit(errorCode);
        });
    }
}
function wireUpProcessErrorHandling(shouldWarningsFailBuild) {
    if (!wiredUpErrorHandling) {
        wiredUpErrorHandling = true;
        let wroteToStdErr = false;
        if (shouldWarningsFailBuild) {
            const oldStdErr = process.stderr.write;
            process.stderr.write = function (text) {
                if (text.toString()) {
                    wroteToStdErr = true;
                    return oldStdErr.apply(process.stderr, arguments);
                }
                return true;
            };
        }
        process.on('exit', (code) => {
            duringFastExit = true;
            // eslint-disable-next-line dot-notation
            if (!global['dontWatchExit']) {
                if (!localCache.wroteSummary) {
                    localCache.wroteSummary = true;
                    console.log('About to exit with code:', code);
                    console.error('Process terminated before summary could be written, possible error in async code not ' +
                        'continuing!');
                    console.log('Trying to exit with exit code 1');
                    exitProcess(1);
                }
                else {
                    if (localCache.exitCode !== 0) {
                        console.log(`Exiting with exit code: ${localCache.exitCode}`);
                        exitProcess(localCache.exitCode);
                    }
                    else if (wroteToStdErr) {
                        console.error(`The build failed because a task wrote output to stderr.`);
                        console.log(`Exiting with exit code: 1`);
                        exitProcess(1);
                    }
                }
            }
        });
        process.on('uncaughtException', (err) => {
            console.error(err);
            _writeTaskError(err);
            writeSummary(() => {
                exitProcess(1);
                if (localCache.gulpErrorCallback) {
                    localCache.gulpErrorCallback(err);
                }
            });
        });
    }
}
function markErrorAsWritten(err) {
    try {
        err[WROTE_ERROR_KEY] = true;
    }
    catch (e) {
        // Do Nothing
    }
}
/**
 * Adds a message to be displayed in the summary after execution is complete.
 * @param value - the message to display
 * @public
 */
function logSummary(value) {
    localCache.writeSummaryLogs.push(value);
}
exports.logSummary = logSummary;
/**
 * Log a message to the console
 * @param args - the messages to log to the console
 * @public
 */
function log(...args) {
    const currentTime = new Date();
    const timestamp = colors.gray([
        padTimePart(currentTime.getHours()),
        padTimePart(currentTime.getMinutes()),
        padTimePart(currentTime.getSeconds())
    ].join(':'));
    console.log(`[${timestamp}] ${args.join('')}`);
}
exports.log = log;
function padTimePart(timepart) {
    return timepart >= 10 ? timepart.toString(10) : `0${timepart.toString(10)}`;
}
/**
 * Resets the state of the logging cache
 * @public
 */
function reset() {
    localCache.start = process.hrtime();
    localCache.warnings = [];
    localCache.errors = [];
    localCache.coverageResults = 0;
    localCache.coveragePass = 0;
    localCache.coverageTotal = 0;
    localCache.taskRun = 0;
    localCache.subTasksRun = 0;
    localCache.taskErrors = 0;
    localCache.totalTaskHrTime = undefined;
    localCache.totalTaskSrc = 0;
    localCache.wroteSummary = false;
    localCache.writingSummary = false;
    localCache.writeSummaryCallbacks = [];
    localCache.testsRun = 0;
    localCache.testsPassed = 0;
    localCache.testsFailed = 0;
    localCache.testsFlakyFailed = 0;
    localCache.testsSkipped = 0;
    localCache.writeSummaryLogs = [];
}
exports.reset = reset;
/**
 * The result of a functional test run
 * @public
 */
var TestResultState;
(function (TestResultState) {
    TestResultState[TestResultState["Passed"] = 0] = "Passed";
    TestResultState[TestResultState["Failed"] = 1] = "Failed";
    TestResultState[TestResultState["FlakyFailed"] = 2] = "FlakyFailed";
    TestResultState[TestResultState["Skipped"] = 3] = "Skipped";
})(TestResultState = exports.TestResultState || (exports.TestResultState = {}));
/**
 * Store a single functional test run's information
 * @param name - the name of the test
 * @param result - the result of the test
 * @param duration - the length of time it took for the test to execute
 * @public
 */
function functionalTestRun(name, result, duration) {
    localCache.testsRun++;
    switch (result) {
        case TestResultState.Failed:
            localCache.testsFailed++;
            break;
        case TestResultState.Passed:
            localCache.testsPassed++;
            break;
        case TestResultState.FlakyFailed:
            localCache.testsFlakyFailed++;
            break;
        case TestResultState.Skipped:
            localCache.testsSkipped++;
            break;
    }
}
exports.functionalTestRun = functionalTestRun;
/** @public */
function endTaskSrc(taskName, startHrtime, fileCount) {
    localCache.totalTaskSrc++;
    const taskDuration = process.hrtime(startHrtime);
    if (!localCache.totalTaskHrTime) {
        localCache.totalTaskHrTime = taskDuration;
    }
    else {
        localCache.totalTaskHrTime[0] += taskDuration[0];
        const nanoSecTotal = taskDuration[1] + localCache.totalTaskHrTime[1];
        if (nanoSecTotal > 1e9) {
            localCache.totalTaskHrTime[0]++;
            localCache.totalTaskHrTime[1] = nanoSecTotal - 1e9;
        }
        else {
            localCache.totalTaskHrTime[1] = nanoSecTotal;
        }
    }
    log(taskName, 'read src task duration:', colors.yellow(prettyTime(taskDuration)), `- ${fileCount} files`);
}
exports.endTaskSrc = endTaskSrc;
/**
 * Store coverage information, potentially logging an error if the coverage is below the threshold
 * @param coverage - the coverage of the file as a percentage
 * @param threshold - the minimum coverage for the file as a percentage, an error will be logged if coverage is below
 *  the threshold
 * @param filePath - the path to the file whose coverage is being measured
 * @public
 */
function coverageData(coverage, threshold, filePath) {
    localCache.coverageResults++;
    if (coverage < threshold) {
        error('Coverage:', Math.floor(coverage) + '% (<' + threshold + '%) -', filePath);
    }
    else {
        localCache.coveragePass++;
    }
    localCache.coverageTotal += coverage;
}
exports.coverageData = coverageData;
// eslint-disable-next-line no-control-regex
const colorCodeRegex = /\x1B[[(?);]{0,2}(;?\d)*./g;
/**
 * Adds a suppression for an error or warning
 * @param suppression - the error or warning as a string or Regular Expression
 * @public
 */
function addSuppression(suppression) {
    if (typeof suppression === 'string') {
        suppression = normalizeMessage(suppression);
    }
    localCache.errorAndWarningSuppressions.push(suppression);
    if (index_1.getConfig().verbose) {
        logSummary(`${colors.yellow('Suppressing')} - ${suppression.toString()}`);
    }
}
exports.addSuppression = addSuppression;
/**
 * Logs a warning. It will be logged to standard error and cause the build to fail
 * if buildConfig.shouldWarningsFailBuild is true, otherwise it will be logged to standard output.
 * @param message - the warning description
 * @public
 */
function warn(...args) {
    args.splice(0, 0, 'Warning -');
    const stringMessage = normalizeMessage(args.join(' '));
    if (!messageIsSuppressed(stringMessage)) {
        localCache.warnings.push(stringMessage);
        log(colors.yellow.apply(undefined, args));
    }
}
exports.warn = warn;
/**
 * Logs an error to standard error and causes the build to fail.
 * @param message - the error description
 * @public
 */
function error(...args) {
    args.splice(0, 0, 'Error -');
    const stringMessage = normalizeMessage(args.join(' '));
    if (!messageIsSuppressed(stringMessage)) {
        localCache.errors.push(stringMessage);
        log(colors.red.apply(undefined, args));
    }
}
exports.error = error;
/**
 * Logs a message about a particular file
 * @param write - the function which will write message
 * @param taskName - the name of the task which is doing the logging
 * @param filePath - the path to the file which encountered an issue
 * @param line - the line in the file which had an issue
 * @param column - the column in the file which had an issue
 * @param errorCode - the custom error code representing this error
 * @param message - a description of the error
 * @public
 */
function fileLog(write, taskName, filePath, line, column, errorCode, message) {
    if (!filePath) {
        filePath = '<undefined path>';
    }
    else if (path.isAbsolute(filePath)) {
        filePath = path.relative(process.cwd(), filePath);
    }
    write(`${colors.cyan(taskName)} - ${filePath}(${line},${column}): error ${errorCode}: ${message}`);
}
exports.fileLog = fileLog;
/**
 * Logs a warning regarding a specific file.
 * @param filePath - the path to the file which encountered an issue
 * @param line - the line in the file which had an issue
 * @param column - the column in the file which had an issue
 * @param warningCode - the custom warning code representing this warning
 * @param message - a description of the warning
 * @public
 */
function fileWarning(taskName, filePath, line, column, errorCode, message) {
    fileLog(warn, taskName, filePath, line, column, errorCode, message);
}
exports.fileWarning = fileWarning;
/**
 * Logs an error regarding a specific file to standard error and causes the build to fail.
 * @param filePath - the path to the file which encountered an issue
 * @param line - the line in the file which had an issue
 * @param column - the column in the file which had an issue
 * @param errorCode - the custom error code representing this error
 * @param message - a description of the error
 * @public
 */
function fileError(taskName, filePath, line, column, errorCode, message) {
    fileLog(error, taskName, filePath, line, column, errorCode, message);
}
exports.fileError = fileError;
/**
 * Logs a message to standard output if the verbose flag is specified.
 * @param args - the messages to log when in verbose mode
 * @public
 */
function verbose(...args) {
    if (config_1.getFlagValue('verbose')) {
        log.apply(undefined, args);
    }
}
exports.verbose = verbose;
/** @public */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateGulpError(err) {
    if (isVerbose()) {
        return err;
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const output = {
            showStack: false,
            toString: () => {
                return '';
            }
        };
        markErrorAsWritten(output);
        return output;
    }
}
exports.generateGulpError = generateGulpError;
/**
 * Logs an error to standard error and causes the build to fail.
 * @param e - the error (can be a string or Error object)
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function writeError(e) {
    if (e) {
        if (!e[WROTE_ERROR_KEY]) {
            if (e.err) {
                if (!e.err[WROTE_ERROR_KEY]) {
                    const msg = formatError(e);
                    const time = prettyTime(e.hrDuration);
                    error("'" + colors.cyan(e.task) + "'", colors.red(e.subTask ? 'sub task errored after' : 'errored after'), colors.magenta(time), '\r\n', msg || '');
                    markErrorAsWritten(e.err[WROTE_ERROR_KEY]);
                }
            }
            else if (e.fileName) {
                // This is probably a plugin error
                if (isVerbose()) {
                    error(e.message, '\r\n', e.plugin + ": '" + colors.yellow(e.fileName) + "':" + e.lineNumber, '\r\n', e.stack);
                }
                else {
                    error(e.message, '\r\n', e.plugin + ": '" + colors.yellow(e.fileName) + "':" + e.lineNumber);
                }
            }
            else {
                if (isVerbose()) {
                    error('Unknown', '\r\n', colors.red(e.message), '\r\n', e.stack);
                }
                else {
                    error('Unknown', '\r\n', colors.red(e.message));
                }
            }
            markErrorAsWritten(e);
        }
    }
    else {
        error('Unknown Error Object');
    }
}
exports.writeError = writeError;
/**
 * Returns the list of warnings which have been logged
 * @public
 */
function getWarnings() {
    return localCache.warnings;
}
exports.getWarnings = getWarnings;
/**
 * Returns the list of errors which have been logged
 * @public
 */
function getErrors() {
    return localCache.errors;
}
exports.getErrors = getErrors;
/** @public */
function getStart() {
    return localCache.start;
}
exports.getStart = getStart;
/**
 * @public
 */
function setWatchMode() {
    localCache.watchMode = true;
}
exports.setWatchMode = setWatchMode;
/**
 * @public
 */
function getWatchMode() {
    return localCache.watchMode;
}
exports.getWatchMode = getWatchMode;
/**
 * @public
 */
function setExitCode(exitCode) {
    localCache.exitCode = exitCode;
}
exports.setExitCode = setExitCode;
/**
 * @public
 */
function logStartSubtask(name) {
    log(`Starting subtask '${colors.cyan(name)}'...`);
    localCache.subTasksRun++;
}
exports.logStartSubtask = logStartSubtask;
/**
 * @public
 */
function logEndSubtask(name, startTime, errorObject) {
    const duration = process.hrtime(startTime);
    if (name) {
        if (!errorObject) {
            const durationString = prettyTime(duration);
            log(`Finished subtask '${colors.cyan(name)}' after ${colors.magenta(durationString)}`);
        }
        else {
            writeError({
                err: errorObject,
                task: name,
                subTask: true,
                hrDuration: duration
            });
        }
    }
}
exports.logEndSubtask = logEndSubtask;
/**
 * @public
 */
function initialize(gulp, config, gulpErrorCallback, gulpStopCallback) {
    let startCounter = 0;

    // This will add logging to the gulp execution
    localCache.gulp = gulp;
    wireUpProcessErrorHandling(config.shouldWarningsFailBuild);
    localCache.gulpErrorCallback =
        gulpErrorCallback ||
            (() => {
                // Do Nothing
            });
    localCache.gulpStopCallback =
        gulpStopCallback ||
            (() => {
                // Do Nothing
            });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gulp.on('start', (e) => {
        if( startCounter++ == 0) {
            log(`Starting gulp`);
        } else {
            log('Starting task ', "'" + colors.cyan(e.name) + "'...");
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gulp.on('stop', (e) => {
        if( --startCounter == 0) {
            log('Stopping gulp');
            writeSummary(() => {
                // error if we have any errors
                if (localCache.taskErrors > 0 ||
                    (getWarnings().length && config.shouldWarningsFailBuild) ||
                    getErrors().length ||
                    localCache.testsFailed > 0) {
                    exitProcess(1);
                }
                if (localCache.gulpStopCallback) {
                    localCache.gulpStopCallback(e);
                }
                exitProcess(0);
            });
        } else {
            const time = prettyTime(e.duration);
            log('Finished task ', "'" + colors.cyan(e.name) + "'", ' after ', colors.magenta(time));
        }

    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gulp.on('err', (err) => {
        _writeTaskError(err);
        writeSummary(() => {
            exitProcess(1);
            if (localCache.gulpErrorCallback) {
                localCache.gulpErrorCallback(err);
            }
        });
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gulp.on('task_start', (e) => {
        if (localCache.fromRunGulp) {
            log('Starting', "'" + colors.cyan(e.task) + "'...");
        }
        localCache.taskRun++;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gulp.on('task_stop', (e) => {
        const time = prettyTime(e.hrDuration);
        if (localCache.fromRunGulp) {
            log('Finished', "'" + colors.cyan(e.task) + "'", 'after', colors.magenta(time));
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gulp.on('task_err', (err) => {
        _writeTaskError(err);
        writeSummary(() => {
            exitProcess(1);
        });
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gulp.on('task_not_found', (err) => {
        log(colors.red("Task '" + err.task + "' is not in your gulpfile"));
        log('Please check the documentation for proper gulpfile formatting');
        exitProcess(1);
    });
}
exports.initialize = initialize;
/**
 * @public
 */
function markTaskCreationTime() {
    localCache.taskCreationTime = process.hrtime(getStart());
}
exports.markTaskCreationTime = markTaskCreationTime;
function messageIsSuppressed(message) {
    for (const suppression of localCache.errorAndWarningSuppressions) {
        if (typeof suppression === 'string' && message === suppression) {
            return true;
        }
        else if (suppression instanceof RegExp && message.match(suppression)) {
            return true;
        }
    }
    return false;
}
function normalizeMessage(message) {
    return message
        .replace(colorCodeRegex, '') // remove colors
        .replace(/\r\n/g, '\n') // normalize newline
        .replace(/\\/g, '/'); // normalize slashes
}
//# sourceMappingURL=logging.js.map