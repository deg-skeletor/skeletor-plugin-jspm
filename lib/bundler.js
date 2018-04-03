const jspm = require('jspm');
const path = require('path');
const fs = require('fs-extra');
const configInjector = require('./configInjector');

const ensureJsExtension = value => value.endsWith('.js') ? value : `${value}.js`;

const getBundleName = entry => `${entry}-bundle.js`;

const buildBundleDef = (entry, bundleResult) => ({
	[getBundleName(entry)]: bundleResult.modules
});

const combineBundleDefs = bundleDefs => {
	return bundleDefs.reduce((accum, bundleDef) => {
		return {...accum, ...bundleDef};
	}, {});
};

const writeBundleFile = (bundleName, destDir, contents) => {
	const bundleFilename = path.join(destDir, bundleName);

	return fs.outputFile(bundleFilename, contents);
};

const getExclusions = (entry, bundleExclusions, defaultExclusions = []) => {
	const exclusions = Array.isArray(bundleExclusions) ? bundleExclusions : defaultExclusions;

	return exclusions.filter(exclusion => exclusion !== entry);
};

const getSubtractedTree = (builder, tree, exclusions) => {
	const promises = exclusions.map(exclusion => builder.trace(ensureJsExtension(exclusion)));

	return Promise.all(promises)
		.then(exclusionTrees => {
			return exclusionTrees.reduce((workingTree, exclusionTree) => {
				return builder.subtractTrees(workingTree, exclusionTree);
			}, tree);
		});
};

const bundle = (builder, {entry, exclusions}, {destDir, minify, defaultExclusions}) => {
	const filteredExclusions = getExclusions(entry, exclusions, defaultExclusions);

	const options = {
		minify: minify || false
	};

	return builder.trace(ensureJsExtension(entry))
		.then(tree => getSubtractedTree(builder, tree, filteredExclusions))
		.then(tree => builder.bundle(tree, options))
		.then(result => {
			const bundleName = getBundleName(entry);
			return writeBundleFile(bundleName, destDir, result.source)
				.then(() => buildBundleDef(entry, result));
		});
};

const buildBundle = (bundleConfig, options) => {
	const builder = new jspm.Builder(options.sourceDir);

	return bundle(builder, bundleConfig, options)
		.then(bundleDef => configInjector().injectBundleDefs(bundleDef, options.sourceDir));
};

const buildBundles = (bundleConfigs, options) => {
	if (bundleConfigs.length === 0) {
		return Promise.resolve(true);
	}

	const builder = new jspm.Builder(options.sourceDir);

	const promises = bundleConfigs.map(bundleConfig => {
		return bundle(builder, bundleConfig, options);
	});

	return Promise.all(promises)
		.then(combineBundleDefs)
		.then(bundleDefs => configInjector().injectBundleDefs(bundleDefs, options.sourceDir));
};

const bundler = () => {
	return {
		buildBundle,
		buildBundles
	};
};

module.exports = bundler;