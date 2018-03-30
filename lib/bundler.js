const jspm = require('jspm');
const path = require('path');
const fs = require('fs-extra');
const configInjector = require('./configInjector');

const getBundleName = entry => `${entry}-bundle.js`;

const buildBundleDef = (entry, bundleResult) => ({
	[getBundleName(entry)]: bundleResult.modules
});

const combineBundleDefs = bundleDefs => {
	return bundleDefs.reduce((accum, bundleDef) => {
		return {...accum, ...bundleDef};
	}, {});
};

const writeBundleFile = (entry, destDir, contents) => {
	const bundleFilename = path.join(destDir, getBundleName(entry));

	return fs.outputFile(bundleFilename, contents);
};

const bundle = (builder, entry, destDir) => {
	const entryFilename = entry.endsWith('.js') ? entry : `${entry}.js`;

	return builder.bundle(entryFilename, {})
		.then(result => {
			return writeBundleFile(entry, destDir, result.source)
				.then(() => buildBundleDef(entry, result));
		});
};

const buildBundle = ({entry}, {sourceDir, destDir}) => {
	const builder = new jspm.Builder(sourceDir);

	return bundle(builder, entry, destDir)
		.then(bundleDef => configInjector().injectBundleDefs(bundleDef, sourceDir));
};

const buildBundles = (bundleConfigs, sourceDir, destDir) => {
	if (bundleConfigs.length === 0) {
		return Promise.resolve(true);
	}

	const builder = new jspm.Builder(sourceDir);

	const promises = bundleConfigs.map(bundleConfig => {
		return bundle(builder, bundleConfig.entry, destDir);
	});

	return Promise.all(promises)
		.then(combineBundleDefs)
		.then(bundleDefs => configInjector().injectBundleDefs(bundleDefs, sourceDir));
};

const bundler = () => {
	
	return {
		buildBundle,
		buildBundles
	}
};

module.exports = bundler;