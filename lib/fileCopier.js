const path = require('path');
const fs = require('fs-extra');

const jspmPackagesPath = 'jspm_packages';
const systemJsFilename = 'system.js';
const configFilename = 'jspm.config.js';

const copyFile = (sourceDir, destDir, filepath) => {
	const sourceFilepath = path.join(sourceDir, filepath);
	const destFilepath = path.join(destDir, filepath);

	return fs.copy(sourceFilepath, destFilepath);
};

const copySystemJsFile = (sourceDir, destDir) => {
	return copyFile(path.join(sourceDir, jspmPackagesPath), destDir, systemJsFilename);
};

const copyConfigFile = (sourceDir, destDir) => {
	return copyFile(sourceDir, destDir, configFilename);
};

module.exports = {
	copySystemJsFile,
	copyConfigFile
};