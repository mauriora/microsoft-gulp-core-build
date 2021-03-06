import * as Gulp from 'gulp';
import { IBuildConfig } from './IBuildConfig';
/**
 * Adds a message to be displayed in the summary after execution is complete.
 * @param value - the message to display
 * @public
 */
export declare function logSummary(value: string): void;
/**
 * Log a message to the console
 * @param args - the messages to log to the console
 * @public
 */
export declare function log(...args: string[]): void;
/**
 * Resets the state of the logging cache
 * @public
 */
export declare function reset(): void;
/**
 * The result of a functional test run
 * @public
 */
export declare enum TestResultState {
    Passed = 0,
    Failed = 1,
    FlakyFailed = 2,
    Skipped = 3
}
/**
 * Store a single functional test run's information
 * @param name - the name of the test
 * @param result - the result of the test
 * @param duration - the length of time it took for the test to execute
 * @public
 */
export declare function functionalTestRun(name: string, result: TestResultState, duration: number): void;
/** @public */
export declare function endTaskSrc(taskName: string, startHrtime: [number, number], fileCount: number): void;
/**
 * Store coverage information, potentially logging an error if the coverage is below the threshold
 * @param coverage - the coverage of the file as a percentage
 * @param threshold - the minimum coverage for the file as a percentage, an error will be logged if coverage is below
 *  the threshold
 * @param filePath - the path to the file whose coverage is being measured
 * @public
 */
export declare function coverageData(coverage: number, threshold: number, filePath: string): void;
/**
 * Adds a suppression for an error or warning
 * @param suppression - the error or warning as a string or Regular Expression
 * @public
 */
export declare function addSuppression(suppression: string | RegExp): void;
/**
 * Logs a warning. It will be logged to standard error and cause the build to fail
 * if buildConfig.shouldWarningsFailBuild is true, otherwise it will be logged to standard output.
 * @param message - the warning description
 * @public
 */
export declare function warn(...args: string[]): void;
/**
 * Logs an error to standard error and causes the build to fail.
 * @param message - the error description
 * @public
 */
export declare function error(...args: string[]): void;
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
export declare function fileLog(write: (text: string) => void, taskName: string, filePath: string, line: number, column: number, errorCode: string, message: string): void;
/**
 * Logs a warning regarding a specific file.
 * @param filePath - the path to the file which encountered an issue
 * @param line - the line in the file which had an issue
 * @param column - the column in the file which had an issue
 * @param warningCode - the custom warning code representing this warning
 * @param message - a description of the warning
 * @public
 */
export declare function fileWarning(taskName: string, filePath: string, line: number, column: number, errorCode: string, message: string): void;
/**
 * Logs an error regarding a specific file to standard error and causes the build to fail.
 * @param filePath - the path to the file which encountered an issue
 * @param line - the line in the file which had an issue
 * @param column - the column in the file which had an issue
 * @param errorCode - the custom error code representing this error
 * @param message - a description of the error
 * @public
 */
export declare function fileError(taskName: string, filePath: string, line: number, column: number, errorCode: string, message: string): void;
/**
 * Logs a message to standard output if the verbose flag is specified.
 * @param args - the messages to log when in verbose mode
 * @public
 */
export declare function verbose(...args: string[]): void;
/** @public */
export declare function generateGulpError(err: any): any;
/**
 * Logs an error to standard error and causes the build to fail.
 * @param e - the error (can be a string or Error object)
 * @public
 */
export declare function writeError(e: any): void;
/**
 * Returns the list of warnings which have been logged
 * @public
 */
export declare function getWarnings(): string[];
/**
 * Returns the list of errors which have been logged
 * @public
 */
export declare function getErrors(): string[];
/** @public */
export declare function getStart(): [number, number] | undefined;
/**
 * @public
 */
export declare function setWatchMode(): void;
/**
 * @public
 */
export declare function getWatchMode(): boolean | undefined;
/**
 * @public
 */
export declare function setExitCode(exitCode: number): void;
/**
 * @public
 */
export declare function logStartSubtask(name: string): void;
/**
 * @public
 */
export declare function logEndSubtask(name: string, startTime: [number, number], errorObject?: Error): void;
/**
 * @public
 */
export declare function initialize(gulp: typeof Gulp, config: IBuildConfig, gulpErrorCallback?: (err: Error) => void, gulpStopCallback?: (err: Error) => void): void;
/**
 * @public
 */
export declare function markTaskCreationTime(): void;
//# sourceMappingURL=logging.d.ts.map