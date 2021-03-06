"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeVersion = exports.coreBuildPackage = exports.builtPackage = exports.args = exports.root = void 0;
const yargs_1 = require("yargs");
const path = require("path");
exports.root = process.cwd();
exports.args = yargs_1.argv;
// There appears to be a TypeScript compiler bug that isn't allowing us to say
//  IPackageJSON | undefined here, so let's create a stub package.json here instead.
// @todo: remove this when the compiler is fixed.
let packageJson = {
    directories: {
        packagePath: undefined
    }
};
try {
    packageJson = require(path.join(exports.root, "package.json" /* PackageJson */));
}
catch (e) {
    // Package.json probably doesn't exit
}
exports.builtPackage = packageJson;
exports.coreBuildPackage = require('../package.json');
exports.nodeVersion = process.version;
//# sourceMappingURL=State.js.map