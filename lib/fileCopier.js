const path = require('path');
const fse = require('fs-extra');
const systemConfigUtils = require('./systemConfigUtils');

const jspmPackagesPath = 'jspm_packages';
const systemJsFilename = 'system.js';

function copyFile(sourceDir, destDir, filepath) {
	const sourceFilepath = path.join(sourceDir, filepath);
	const destFilepath = path.join(destDir, filepath);

	return fse.copy(sourceFilepath, destFilepath);
}

function copySystemJsFile(sourceDir, destDir) {
	return copyFile(path.join(sourceDir, jspmPackagesPath), destDir, systemJsFilename);
}

function copyConfigFile(sourceDir, destDir) {
	return copyFile(sourceDir, destDir, systemConfigUtils.configFilename);
}

exports.copySystemJsFile = copySystemJsFile;
exports.copyConfigFile = copyConfigFile;