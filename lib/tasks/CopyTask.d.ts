/// <reference types="node" />
import { GulpTask } from './GulpTask';
import * as Gulp from 'gulp';
import { JsonObject } from '@rushstack/node-core-library';
/**
 * Configuration for CopyTask
 * @public
 */
export interface ICopyConfig {
    /**
     * The list of patterns and the destination which where they should be copied
     */
    copyTo: {
        /**
         * A mapping of destination paths (absolute or relative) to a list of glob pattern matches
         */
        [destPath: string]: string[];
    };
    /**
     * If true, the files will be copied into a flattened folder. If false, they will retain the original
     * folder structure. True by default.
     */
    shouldFlatten?: boolean;
}
/**
 * This task takes in a map of dest: [sources], and copies items from one place to another.
 * @public
 */
export declare class CopyTask extends GulpTask<ICopyConfig> {
    /**
     * Instantiates a CopyTask with an empty configuration
     */
    constructor();
    /**
     * Loads the z-schema object for this task
     */
    loadSchema(): JsonObject;
    /**
     * Executes the copy task, which copy files based on the task's Configuration
     */
    executeTask(gulp: typeof Gulp, completeCallback: (error?: string | Error) => void): Promise<any> | NodeJS.ReadWriteStream | void;
}
//# sourceMappingURL=CopyTask.d.ts.map