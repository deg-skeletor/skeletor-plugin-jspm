const path = require('path');
const systemConfigUtils = require('./systemConfigUtils');

function filterBundleDefsByFilename(filename, bundleDefs) {
	return Object.keys(bundleDefs).filter(bundleName => bundleDefs[bundleName].includes(filename));
}

function getBundleNamesForFilename(filename, configDir) {
	const relativeFilename = path.relative(configDir, filename);

	return systemConfigUtils.getBundleDefs(configDir)
		.then(bundleDefs => filterBundleDefsByFilename(relativeFilename, bundleDefs));
}

function findBundleConfigByEntry(entry, bundleConfigs) {
	return bundleConfigs.find(bundleConfig => bundleConfig.entry === entry);
}

function getEntryFilenameFromBundleName(bundleName) {
	return bundleName.replace('-bundle.js', '');
}

function getBundleConfigsByNames(bundleNames, bundleConfigs) {
	return bundleNames.reduce((accumm, bundleName) => {
		const entryFilename = getEntryFilenameFromBundleName(bundleName);
		const bundleConfig = findBundleConfigByEntry(entryFilename, bundleConfigs);
		if(typeof bundleConfig !== 'undefined') {
			accumm.push(bundleConfig);
		}
		return accumm;
	}, []);
}

function filterByFilename(filename, bundleConfigs, configDir) {
	return getBundleNamesForFilename(filename, configDir)
		.then(bundleNames => getBundleConfigsByNames(bundleNames, bundleConfigs));
}

exports.filterByFilename = filterByFilename;