/// <reference types="node" />
import { GulpProxy } from './GulpProxy';
import { IExecutable } from './IExecutable';
import { IBuildConfig } from './IBuildConfig';
import { CopyStaticAssetsTask } from './tasks/copyStaticAssets/CopyStaticAssetsTask';
export { IExecutable } from './IExecutable';
import * as Gulp from 'gulp';
import { JestTask } from './tasks/JestTask';
export * from './IBuildConfig';
export { addSuppression, coverageData, functionalTestRun, getErrors, getWarnings, TestResultState, warn, verbose, error, fileError, fileLog, fileWarning, reset, log, logSummary } from './logging';
export { GCBTerminalProvider } from './utilities/GCBTerminalProvider';
export * from './tasks/CopyTask';
export * from './tasks/GenerateShrinkwrapTask';
export * from './tasks/GulpTask';
export * from './tasks/CleanTask';
export * from './tasks/CleanFlagTask';
export * from './tasks/ValidateShrinkwrapTask';
export * from './tasks/copyStaticAssets/CopyStaticAssetsTask';
export * from './tasks/JestTask';
/**
 * Merges the given build config settings into existing settings.
 *
 * @param config - The build config settings.
 * @public
 */
export declare function setConfig(config: Partial<IBuildConfig>): void;
/**
 * Merges the given build config settings into existing settings.
 *
 * @param  config - The build config settings.
 * @public
 */
export declare function mergeConfig(config: Partial<IBuildConfig>): void;
/**
 * Replaces the build config.
 *
 * @param  config - The build config settings.
 * @public
 */
export declare function replaceConfig(config: IBuildConfig): void;
/**
 * Gets the current config.
 * @returns the current build configuration
 * @public
 */
export declare function getConfig(): IBuildConfig;
/** @public */
export declare const cleanFlag: IExecutable;
/**
 * Registers an IExecutable to gulp so that it can be called from the command line
 * @param taskName - the name of the task, can be called from the command line (e.g. "gulp <taskName>")
 * @param taskExecutable - the executable to execute when the task is invoked
 * @returns the task parameter
 * @public
 */
export declare function task(taskName: string, taskExecutable: IExecutable): IExecutable;
/**
 * The callback interface for a custom task definition.
 * The task should either return a Promise, a stream, or call the
 * callback function (passing in an object value if there was an error).
 * @public
 */
export interface ICustomGulpTask {
    (gulp: typeof Gulp | GulpProxy, buildConfig: IBuildConfig, done?: (failure?: any) => void): Promise<object> | NodeJS.ReadWriteStream | void;
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
export declare function subTask(taskName: string, fn: ICustomGulpTask): IExecutable;
/**
 * Defines a gulp watch and maps it to a given IExecutable.
 *
 * @param watchMatch - the list of files patterns to watch
 * @param taskExecutable - the task to execute when a file changes
 * @returns IExecutable
 * @public
 */
export declare function watch(watchMatch: string | string[], taskExecutable: IExecutable): IExecutable;
/**
 * Takes in IExecutables as arguments and returns an IExecutable that will execute them in serial.
 * @public
 */
export declare function serial(...tasks: (IExecutable[] | IExecutable)[]): IExecutable;
/**
 * Takes in IExecutables as arguments and returns an IExecutable that will execute them in parallel.
 * @public
 */
export declare function parallel(...tasks: (IExecutable[] | IExecutable)[]): IExecutable;
/**
 * Initializes the gulp tasks.
 * @public
 */
export declare function initialize(gulp: typeof Gulp): void;
/** @public */
export declare const clean: IExecutable;
/** @public */
export declare const copyStaticAssets: CopyStaticAssetsTask;
/** @public */
export declare const jest: JestTask;
//# sourceMappingURL=index.d.ts.map