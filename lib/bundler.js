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

const bundle = (builder, entry, {destDir, minify }) => {
	const entryFilename = entry.endsWith('.js') ? entry : `${entry}.js`;

	const options = {
		minify: minify || false
	};

	return builder.bundle(entryFilename, options)
		.then(result => {
			return writeBundleFile(entry, destDir, result.source)
				.then(() => buildBundleDef(entry, result));
		});
};

const buildBundle = ({entry}, options) => {
	const builder = new jspm.Builder(options.sourceDir);

	return bundle(builder, entry, options)
		.then(bundleDef => configInjector().injectBundleDefs(bundleDef, options.sourceDir));
};

const buildBundles = (bundleConfigs, options) => {
	if (bundleConfigs.length === 0) {
		return Promise.resolve(true);
	}

	const builder = new jspm.Builder(options.sourceDir);

	const promises = bundleConfigs.map(bundleConfig => {
		return bundle(builder, bundleConfig.entry, options);
	});

	return Promise.all(promises)
		.then(combineBundleDefs)
		.then(bundleDefs => configInjector().injectBundleDefs(bundleDefs, options.sourceDir));
};

const bundler = () => {
	
	return {
		buildBundle,
		buildBundles
	}
};

module.exports = bundler;