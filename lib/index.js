"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jest = exports.copyStaticAssets = exports.clean = exports.initialize = exports.parallel = exports.serial = exports.watch = exports.subTask = exports.task = exports.cleanFlag = exports.getConfig = exports.replaceConfig = exports.mergeConfig = exports.setConfig = void 0;
if (process.argv.indexOf('--no-color') === -1) {
    process.argv.push('--color');
}
const path = require("path");
const GulpTask_1 = require("./tasks/GulpTask");
const GulpProxy_1 = require("./GulpProxy");
const CleanTask_1 = require("./tasks/CleanTask");
const CleanFlagTask_1 = require("./tasks/CleanFlagTask");
const CopyStaticAssetsTask_1 = require("./tasks/copyStaticAssets/CopyStaticAssetsTask");
const State_1 = require("./State");
const logging_1 = require("./logging");
const logging_2 = require("./logging");
const config_1 = require("./config");
const notifier = require("node-notifier");
const JestTask_1 = require("./tasks/JestTask");
__exportStar(require("./IBuildConfig"), exports);
var logging_3 = require("./logging");
Object.defineProperty(exports, "addSuppression", { enumerable: true, get: function () { return logging_3.addSuppression; } });
Object.defineProperty(exports, "coverageData", { enumerable: true, get: function () { return logging_3.coverageData; } });
Object.defineProperty(exports, "functionalTestRun", { enumerable: true, get: function () { return logging_3.functionalTestRun; } });
Object.defineProperty(exports, "getErrors", { enumerable: true, get: function () { return logging_3.getErrors; } });
Object.defineProperty(exports, "getWarnings", { enumerable: true, get: function () { return logging_3.getWarnings; } });
Object.defineProperty(exports, "TestResultState", { enumerable: true, get: function () { return logging_3.TestResultState; } });
Object.defineProperty(exports, "warn", { enumerable: true, get: function () { return logging_3.warn; } });
Object.defineProperty(exports, "verbose", { enumerable: true, get: function () { return logging_3.verbose; } });
Object.defineProperty(exports, "error", { enumerable: true, get: function () { return logging_3.error; } });
Object.defineProperty(exports, "fileError", { enumerable: true, get: function () { return logging_3.fileError; } });
Object.defineProperty(exports, "fileLog", { enumerable: true, get: function () { return logging_3.fileLog; } });
Object.defineProperty(exports, "fileWarning", { enumerable: true, get: function () { return logging_3.fileWarning; } });
Object.defineProperty(exports, "reset", { enumerable: true, get: function () { return logging_3.reset; } });
Object.defineProperty(exports, "log", { enumerable: true, get: function () { return logging_3.log; } });
Object.defineProperty(exports, "logSummary", { enumerable: true, get: function () { return logging_3.logSummary; } });
var GCBTerminalProvider_1 = require("./utilities/GCBTerminalProvider");
Object.defineProperty(exports, "GCBTerminalProvider", { enumerable: true, get: function () { return GCBTerminalProvider_1.GCBTerminalProvider; } });
__exportStar(require("./tasks/CopyTask"), exports);
__exportStar(require("./tasks/GenerateShrinkwrapTask"), exports);
__exportStar(require("./tasks/GulpTask"), exports);
__exportStar(require("./tasks/CleanTask"), exports);
__exportStar(require("./tasks/CleanFlagTask"), exports);
__exportStar(require("./tasks/ValidateShrinkwrapTask"), exports);
__exportStar(require("./tasks/copyStaticAssets/CopyStaticAssetsTask"), exports);
__exportStar(require("./tasks/JestTask"), exports);
const _taskMap = {};
const _uniqueTasks = [];
const packageFolder = State_1.builtPackage.directories && State_1.builtPackage.directories.packagePath
    ? State_1.builtPackage.directories.packagePath
    : '';
let _buildConfig = {
    maxBuildTimeMs: 0,
    // gulp and rootPath are set to undefined here because they'll be defined in the initialize function below,
    //  but we don't want their types to be nullable because a task that uses StrictNullChecks should expect them
    //  to be defined without checking their values.
    gulp: undefined,
    rootPath: undefined,
    packageFolder,
    srcFolder: 'src',
    distFolder: path.join(packageFolder, 'dist'),
    libAMDFolder: undefined,
    libESNextFolder: undefined,
    libFolder: path.join(packageFolder, 'lib'),
    tempFolder: 'temp',
    properties: {},
    relogIssues: config_1.getFlagValue('relogIssues', true),
    showToast: config_1.getFlagValue('showToast', true),
    buildSuccessIconPath: path.resolve(__dirname, 'pass.png'),
    buildErrorIconPath: path.resolve(__dirname, 'fail.png'),
    verbose: config_1.getFlagValue('verbose', false),
    production: config_1.getFlagValue('production', false),
    args: State_1.args,
    shouldWarningsFailBuild: false
};
/**
 * Merges the given build config settings into existing settings.
 *
 * @param config - The build config settings.
 * @public
 */
function setConfig(config) {
    // eslint-disable-next-line
    const objectAssign = require('object-assign');
    _buildConfig = objectAssign({}, _buildConfig, config);
}
exports.setConfig = setConfig;
/**
 * Merges the given build config settings into existing settings.
 *
 * @param  config - The build config settings.
 * @public
 */
function mergeConfig(config) {
    // eslint-disable-next-line
    const merge = require('lodash.merge');
    _buildConfig = merge({}, _buildConfig, config);
}
exports.mergeConfig = mergeConfig;
/**
 * Replaces the build config.
 *
 * @param  config - The build config settings.
 * @public
 */
function replaceConfig(config) {
    _buildConfig = config;
}
exports.replaceConfig = replaceConfig;
/**
 * Gets the current config.
 * @returns the current build configuration
 * @public
 */
function getConfig() {
    return _buildConfig;
}
exports.getConfig = getConfig;
/** @public */
exports.cleanFlag = new CleanFlagTask_1.CleanFlagTask();
/**
 * Registers an IExecutable to gulp so that it can be called from the command line
 * @param taskName - the name of the task, can be called from the command line (e.g. "gulp <taskName>")
 * @param taskExecutable - the executable to execute when the task is invoked
 * @returns the task parameter
 * @public
 */
function task(taskName, taskExecutable) {
    taskExecutable = serial(exports.cleanFlag, taskExecutable);
    _taskMap[taskName] = taskExecutable;
    _trackTask(taskExecutable);
    return taskExecutable;
}
exports.task = task;
/** @public */
class CustomTask extends GulpTask_1.GulpTask {
    constructor(name, fn) {
        super(name);
        this._fn = fn.bind(this);
    }
    executeTask(gulp, completeCallback) {
        return this._fn(gulp, getConfig(), completeCallback);
    }
}
/**
 * Creates a new subtask from a function callback. Useful as a shorthand way
 * of defining tasks directly in a gulpfile.
 *
 * @param taskName - the name of the task, appearing in build logs
 * @param fn - the callback function to execute when this task runs
 * @returns an IExecutable which can be registered to the command line with task()
 * @public
 */
function subTask(taskName, fn) {
    const customTask = new CustomTask(taskName, fn);
    return customTask;
}
exports.subTask = subTask;
/**
 * Defines a gulp watch and maps it to a given IExecutable.
 *
 * @param watchMatch - the list of files patterns to watch
 * @param taskExecutable - the task to execute when a file changes
 * @returns IExecutable
 * @public
 */
function watch(watchMatch, taskExecutable) {
    _trackTask(taskExecutable);
    let isWatchRunning = false;
    let shouldRerunWatch = false;
    let lastError = undefined;
    const successMessage = 'Build succeeded';
    const failureMessage = 'Build failed';
    return {
        execute: (buildConfig) => {
            return new Promise(() => {
                function _runWatch() {
                    if (isWatchRunning) {
                        shouldRerunWatch = true;
                        return Promise.resolve();
                    }
                    else {
                        isWatchRunning = true;
                        return _executeTask(taskExecutable, buildConfig)
                            .then(() => {
                            if (lastError) {
                                lastError = undefined;
                                if (buildConfig.showToast) {
                                    notifier.notify({
                                        title: successMessage,
                                        message: State_1.builtPackage ? State_1.builtPackage.name : '',
                                        icon: buildConfig.buildSuccessIconPath
                                    });
                                }
                                else {
                                    logging_1.log(successMessage);
                                }
                            }
                            return _finalizeWatch();
                        })
                            .catch((error) => {
                            if (!lastError || lastError !== error) {
                                lastError = error;
                                if (buildConfig.showToast) {
                                    notifier.notify({
                                        title: failureMessage,
                                        message: error.toString(),
                                        icon: buildConfig.buildErrorIconPath
                                    });
                                }
                                else {
                                    logging_1.log(failureMessage);
                                }
                            }
                            return _finalizeWatch();
                        });
                    }
                }
                function _finalizeWatch() {
                    isWatchRunning = false;
                    if (shouldRerunWatch) {
                        shouldRerunWatch = false;
                        return _runWatch();
                    }
                    return Promise.resolve();
                }
                logging_2.setWatchMode();
                buildConfig.gulp.watch(watchMatch, _runWatch);
                _runWatch().catch(console.error);
            });
        }
    };
}
exports.watch = watch;
/**
 * Takes in IExecutables as arguments and returns an IExecutable that will execute them in serial.
 * @public
 */
function serial(...tasks) {
    const flatTasks = _flatten(tasks).filter((taskExecutable) => {
        return taskExecutable !== null && taskExecutable !== undefined;
    });
    for (const flatTask of flatTasks) {
        _trackTask(flatTask);
    }
    return {
        execute: (buildConfig) => {
            let output = Promise.resolve();
            for (const taskExecutable of flatTasks) {
                output = output.then(() => _executeTask(taskExecutable, buildConfig));
            }
            return output;
        }
    };
}
exports.serial = serial;
/**
 * Takes in IExecutables as arguments and returns an IExecutable that will execute them in parallel.
 * @public
 */
function parallel(...tasks) {
    const flatTasks = _flatten(tasks).filter((taskExecutable) => {
        return taskExecutable !== null && taskExecutable !== undefined;
    });
    for (const flatTask of flatTasks) {
        _trackTask(flatTask);
    }
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute: (buildConfig) => {
            return new Promise((resolve, reject) => {
                const promises = [];
                for (const taskExecutable of flatTasks) {
                    promises.push(_executeTask(taskExecutable, buildConfig));
                }
                // Use promise all to make sure errors are propagated correctly
                Promise.all(promises).then(resolve, reject);
            });
        }
    };
}
exports.parallel = parallel;
/**
 * Initializes the gulp tasks.
 * @public
 */
function initialize(gulp) {
    _buildConfig.rootPath = process.cwd();
    _buildConfig.gulp = new GulpProxy_1.GulpProxy(gulp);
    _buildConfig.uniqueTasks = _uniqueTasks;
    _buildConfig.jestEnabled = JestTask_1._isJestEnabled(_buildConfig.rootPath);
    _handleCommandLineArguments();
    for (const uniqueTask of _buildConfig.uniqueTasks) {
        if (uniqueTask.onRegister) {
            uniqueTask.onRegister();
        }
    }
    logging_2.initialize(gulp, getConfig(), undefined, undefined);
    Object.keys(_taskMap).forEach((taskName) => _registerTask(gulp, taskName, _taskMap[taskName]));
    logging_2.markTaskCreationTime();
}
exports.initialize = initialize;
/**
 * Registers a given gulp task given a name and an IExecutable.
 */
function _registerTask(gulp, taskName, taskExecutable) {
    gulp.task(taskName, (cb) => {
        const maxBuildTimeMs = taskExecutable.maxBuildTimeMs === undefined
            ? _buildConfig.maxBuildTimeMs
            : taskExecutable.maxBuildTimeMs;
        const timer = maxBuildTimeMs === 0
            ? undefined
            : setTimeout(() => {
                logging_1.error(`Build ran for ${maxBuildTimeMs} milliseconds without completing. Cancelling build with error.`);
                cb(new Error('Timeout'));
            }, maxBuildTimeMs);
        _executeTask(taskExecutable, _buildConfig).then(() => {
            if (timer) {
                clearTimeout(timer);
            }
            cb();
        }, (error) => {
            if (timer) {
                clearTimeout(timer);
            }
            cb(logging_2.generateGulpError(error));
        });
    });
}
/**
 * Executes a given IExecutable.
 */
function _executeTask(taskExecutable, buildConfig) {
    // Try to fallback to the default task if provided.
    if (taskExecutable && !taskExecutable.execute) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (taskExecutable.default) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            taskExecutable = taskExecutable.default;
        }
    }
    // If the task is missing, throw a meaningful error.
    if (!taskExecutable || !taskExecutable.execute) {
        return Promise.reject(new Error(`A task was scheduled, but the task was null. This probably means the task wasn't imported correctly.`));
    }
    if (taskExecutable.isEnabled === undefined || taskExecutable.isEnabled(buildConfig)) {
        const startTime = process.hrtime();
        if (buildConfig.onTaskStart && taskExecutable.name) {
            buildConfig.onTaskStart(taskExecutable.name);
        }
        const taskPromise = taskExecutable.execute(buildConfig).then(() => {
            if (buildConfig.onTaskEnd && taskExecutable.name) {
                buildConfig.onTaskEnd(taskExecutable.name, process.hrtime(startTime));
            }
        }, (error) => {
            if (buildConfig.onTaskEnd && taskExecutable.name) {
                buildConfig.onTaskEnd(taskExecutable.name, process.hrtime(startTime), error);
            }
            return Promise.reject(error);
        });
        return taskPromise;
    }
    // No-op otherwise.
    return Promise.resolve();
}
function _trackTask(taskExecutable) {
    if (_uniqueTasks.indexOf(taskExecutable) < 0) {
        _uniqueTasks.push(taskExecutable);
    }
}
/**
 * Flattens a set of arrays into a single array.
 */
function _flatten(oArr) {
    const output = [];
    function traverse(arr) {
        for (let i = 0; i < arr.length; ++i) {
            if (Array.isArray(arr[i])) {
                traverse(arr[i]);
            }
            else {
                output.push(arr[i]);
            }
        }
    }
    traverse(oArr);
    return output;
}
function _handleCommandLineArguments() {
    _handleTasksListArguments();
}
function _handleTasksListArguments() {
    /* eslint-disable dot-notation */
    if (State_1.args['tasks'] || State_1.args['tasks-simple'] || State_1.args['T']) {
        global['dontWatchExit'] = true;
    }
    if (State_1.args['h']) {
        // we are showing a help command prompt via yargs or ts-command-line
        global['dontWatchExit'] = true;
    }
    /* eslint-enable dot-notation */
}
/** @public */
exports.clean = new CleanTask_1.CleanTask();
/** @public */
exports.copyStaticAssets = new CopyStaticAssetsTask_1.CopyStaticAssetsTask();
/** @public */
exports.jest = new JestTask_1.JestTask();
// Register default clean task.
task('clean', exports.clean);
//# sourceMappingURL=index.js.map