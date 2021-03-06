/// <reference types="node" />
import { JsonObject } from '@rushstack/node-core-library';
import { GulpProxy } from '../GulpProxy';
import { IExecutable } from '../IExecutable';
import { IBuildConfig } from '../IBuildConfig';
import gulp = require('gulp');
/**
 * The base GulpTask class, should be extended by any classes which represent build tasks.
 * It provides convenient mechanisms for reading configuration files, validating their schema,
 * etc. It also provides convenient utility and logging functions.
 * @public
 */
export declare abstract class GulpTask<TTaskConfig> implements IExecutable {
    /**
     * The name of the task. The configuration file with this name will be loaded and applied to the task.
     */
    name: string;
    /**
     * The global build configuration object. Will be the same for all task instances.
     */
    buildConfig: IBuildConfig;
    /**
     * The configuration for this task instance.
     */
    taskConfig: TTaskConfig;
    /**
     * An overridable array of file patterns which will be utilized by the CleanTask to
     * determine which files to delete. Unless overridden, the getCleanMatch() function
     * will return this value.
     */
    cleanMatch: string[];
    /**
     * Indicates whether this task should be executed or not. This toggle is used by isEnabled() to determine
     * if the task should run. Since some tasks have more complex logic to determine if they should run or
     * not, the isEnabled() function can be overridden.
     */
    enabled: boolean;
    /**
     * The memoized schema for this task. Should not be utilized by child classes, use schema property instead.
     */
    private _schema;
    /**
     * Initializes a new instance of the task with the specified initial task config
     */
    constructor(name: string, initialTaskConfig?: Partial<TTaskConfig>);
    /**
     * Overridable function which returns true if this task should be executed, or false if it should be skipped.
     * @param buildConfig - the build configuration which should be used when determining if the task is enabled
     * @returns true if the build is not redundant and the enabled toggle is true
     */
    isEnabled(buildConfig: IBuildConfig): boolean;
    /**
     * A JSON Schema object which will be used to validate this task's configuration file.
     * @returns a z-schema schema definition
     */
    get schema(): JsonObject | undefined;
    /**
     * Shallow merges config settings into the task config.
     * Note this will override configuration options for those which are objects.
     * @param taskConfig - configuration settings which should be applied
     */
    setConfig(taskConfig: Partial<TTaskConfig>): void;
    /**
     * Deep merges config settings into task config.
     * Do not use this function if the configuration contains complex objects that cannot be merged.
     * @param taskConfig - configuration settings which should be applied
     */
    mergeConfig(taskConfig: Partial<TTaskConfig>): void;
    /**
     * Replaces all of the task config settings with new settings.
     * @param taskConfig - the new task configuration
     */
    replaceConfig(taskConfig: TTaskConfig): void;
    /**
     * This function is called when the task is initially registered into gulp-core-build as a task or subtask. It reads
     * the configuration file, validates it against the schema, then applies it to the task instance's configuration.
     */
    onRegister(): void;
    /**
     * When the task is executed by the build system, this function is called once. Note that this function
     * must either return a Promise, a Stream, or call the completeCallback() parameter.
     * @param gulp - an instance of the gulp library
     * @param completeCallback - a callback which should be called if the function is non-value returning
     * @returns a Promise, a Stream or undefined if completeCallback() is called
     */
    abstract executeTask(gulp: gulp.Gulp | GulpProxy, completeCallback?: (error?: string | Error) => void): Promise<any | void> | NodeJS.ReadWriteStream | void;
    /**
     * Logs a message to standard output.
     * @param message - the message to log to standard output.
     */
    log(message: string): void;
    /**
     * Logs a message to standard output if the verbose flag is specified.
     * @param message - the message to log when in verbose mode
     */
    logVerbose(message: string): void;
    /**
     * Logs a warning. It will be logged to standard error and cause the build to fail
     * if buildConfig.shouldWarningsFailBuild is true, otherwise it will be logged to standard output.
     * @param message - the warning description
     */
    logWarning(message: string): void;
    /**
     * Logs an error to standard error and causes the build to fail.
     * @param message - the error description
     */
    logError(message: string): void;
    /**
     * Logs an error regarding a specific file to standard error and causes the build to fail.
     * @param filePath - the path to the file which encountered an issue
     * @param line - the line in the file which had an issue
     * @param column - the column in the file which had an issue
     * @param errorCode - the custom error code representing this error
     * @param message - a description of the error
     */
    fileError(filePath: string, line: number, column: number, errorCode: string, message: string): void;
    /**
     * Logs a warning regarding a specific file.
     * @param filePath - the path to the file which encountered an issue
     * @param line - the line in the file which had an issue
     * @param column - the column in the file which had an issue
     * @param warningCode - the custom warning code representing this warning
     * @param message - a description of the warning
     */
    fileWarning(filePath: string, line: number, column: number, warningCode: string, message: string): void;
    /**
     * An overridable function which returns a list of glob patterns representing files that should be deleted
     * by the CleanTask.
     * @param buildConfig - the current build configuration
     * @param taskConfig - a task instance's configuration
     */
    getCleanMatch(buildConfig: IBuildConfig, taskConfig?: TTaskConfig): string[];
    /**
     * This function is called once to execute the task. It calls executeTask() and handles the return
     * value from that function. It also provides some utilities such as logging how long each
     * task takes to execute.
     * @param config - the buildConfig which is applied to the task instance before execution
     * @returns a Promise which is completed when the task is finished executing
     */
    execute(config: IBuildConfig): Promise<void>;
    /**
     * Resolves a path relative to the buildConfig.rootPath.
     * @param localPath - a relative or absolute path
     * @returns If localPath is relative, returns an absolute path relative to the rootPath. Otherwise, returns localPath.
     */
    resolvePath(localPath: string): string;
    /**
     * Synchronously detect if a file exists.
     * @param localPath - the path to the file [resolved using resolvePath()]
     * @returns true if the file exists, false otherwise
     */
    fileExists(localPath: string): boolean;
    /**
     * Copy a file from one location to another.
     * @param localSourcePath - path to the source file
     * @param localDestPath - path to the destination file
     */
    copyFile(localSourcePath: string, localDestPath?: string): void;
    /**
     * Read a JSON file into an object
     * @param localPath - the path to the JSON file
     */
    readJSONSync(localPath: string): JsonObject | undefined;
    /**
     * Override this function to provide a schema which will be used to validate
     * the task's configuration file. This function is called once per task instance.
     * @returns a z-schema schema definition
     */
    protected loadSchema(): JsonObject | undefined;
    /**
     * Returns the path to the config file used to configure this task
     */
    protected _getConfigFilePath(): string;
    /**
     * Helper function which loads a custom configuration file from disk and validates it against the schema
     * @param filePath - the path to the custom configuration file
     * @param schema - the z-schema schema object used to validate the configuration file
     * @returns If the configuration file is valid, returns the configuration as an object.
     */
    private _readConfigFile;
}
//# sourceMappingURL=GulpTask.d.ts.map