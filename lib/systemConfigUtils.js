const fse = require('fs-extra');
const path = require('path');
const configFilename = 'jspm.browser.js';
const bundlesRegEx = /"?bundles"?: ({[^}]*})/;

function extractBundleDefsFromContents(contents) {
	const matches = contents.match(bundlesRegEx);

	if(matches !== null && matches.length > 1) {
		return JSON.parse(matches[1]);
	}
	return {};
}

function getBundleDefs(configDir) {
	return readConfigFile(configDir)
		.then(extractBundleDefsFromContents);
}

function setBundleDefs(bundleDefs, configDir, merge = false) {
	return readConfigFile(configDir)
		.then(contents => {
			const matches = contents.match(bundlesRegEx);

			const newBundleDefs = merge ?
				{...extractBundleDefsFromContents(contents), ...bundleDefs} :
				bundleDefs;

			let newContents;
			if(matches !== null && matches.length > 1) {
				newContents = replaceBundleDefs(contents, newBundleDefs);
			} else {
				newContents = appendBundleDefs(contents, newBundleDefs);
			}

			return writeConfigFile(newContents, configDir);
		});
}

function readConfigFile(configDir) {
	return fse.readFile(getConfigFilepath(configDir), 'utf8');
}

function writeConfigFile(contents, configDir) {
	return fse.outputFile(getConfigFilepath(configDir), contents);
}

function getConfigFilepath(configDir) {
	return path.join(configDir, configFilename);
}

function replaceBundleDefs(contents, bundleDefs) {
	return contents.replace(bundlesRegEx, stringifyBundleDefs(bundleDefs));
}

function appendBundleDefs(contents, bundleDefs) {
	const contentToInsert = `,\n\t${stringifyBundleDefs(bundleDefs)}\n});`;
	return contents.replace(/\s*}\);\s*$/, contentToInsert);
}

function stringifyBundleDefs(bundleDefs) {
	return `bundles: ${JSON.stringify(bundleDefs, null, '\t')}`;
}

exports.configFilename = configFilename;
exports.readConfigFile = readConfigFile;
exports.writeConfigFile = writeConfigFile;
exports.getBundleDefs = getBundleDefs;
exports.setBundleDefs = setBundleDefs;