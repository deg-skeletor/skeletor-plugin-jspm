const jspm = require('jspm');
const path = require('path');
const fse = require('fs-extra');
const systemConfigUtils = require('./systemConfigUtils');
const bundleConfigFilterer = require('./bundleConfigFilterer');

function ensureJsExtension(value) {
	return value.endsWith('.js') ? value : `${value}.js`;
}

function getBundleName(entry) {
	return `${entry}-bundle.js`;
}

function buildBundleDef(entry, bundleResult) {
	return {[getBundleName(entry)]: bundleResult.modules};
}

function combineBundleDefs(bundleDefs) {
	return bundleDefs.reduce((accum, bundleDef) => (
		{...accum, ...bundleDef}
	), {});
}

function writeBundleFile(bundleName, destDir, contents) {
	const bundleFilename = path.join(destDir, bundleName);

	return fse.outputFile(bundleFilename, contents);
}

function getExclusions(entry, bundleExclusions, defaultExclusions = []) {
	const exclusions = Array.isArray(bundleExclusions) ? bundleExclusions : defaultExclusions;

	return exclusions.filter(exclusion => exclusion !== entry);
}

function getSubtractedTree(builder, tree, exclusions) {
	const promises = exclusions.map(exclusion => builder.trace(ensureJsExtension(exclusion)));

	return Promise.all(promises)
		.then(exclusionTrees => {
			return exclusionTrees.reduce((workingTree, exclusionTree) => {
				return builder.subtractTrees(workingTree, exclusionTree);
			}, tree);
		});
}

function bundle(builder, {entry, exclusions}, {destDir, minify, defaultExclusions, logger}) {
	const filteredExclusions = getExclusions(entry, exclusions, defaultExclusions);

	const options = {
		minify: minify || false
	};

	const bundleName = getBundleName(entry);

	logger.info(`Building bundle ${bundleName}...`);

	return builder.trace(ensureJsExtension(entry))
		.then(tree => getSubtractedTree(builder, tree, filteredExclusions))
		.then(tree => builder.bundle(tree, options))
		.then(result => {
			return writeBundleFile(bundleName, destDir, result.source)
				.then(() => buildBundleDef(entry, result));
		})
		.then(bundleDef => {
			logger.info(`Bundle ${bundleName} complete.`);
			return bundleDef;
		});
}

function buildBundlesForFile(filename, bundleConfigs, options) {
	return bundleConfigFilterer.filterByFilename(filename, bundleConfigs, options.sourceDir)
		.then(bundleConfigsForFile => {
			let bundleConfigsToBuild;

			if(bundleConfigsForFile.length) {
				bundleConfigsToBuild = bundleConfigsForFile;
				options.logger.info(`Found ${filename} in ${bundleConfigsForFile.length} bundle(s).`);
			} else {
				bundleConfigsToBuild = bundleConfigs;
				options.logger.info(`Could not find ${filename} in any bundles. Building all bundles.`);
			}

			return buildBundles(bundleConfigsToBuild, {...options, ...{mergedBundleDefs: true}});
		});
}

function buildBundles(bundleConfigs, options) {
	const builder = new jspm.Builder(options.sourceDir);

	const promises = bundleConfigs.map(bundleConfig => bundle(builder, bundleConfig, options));

	return Promise.all(promises)
		.then(bundleDefs => {
			const combinedBundleDefs = combineBundleDefs(bundleDefs);
			return systemConfigUtils.setBundleDefs(combinedBundleDefs, options.sourceDir, options.mergedBundleDefs);
		})
		.then(() => {
			options.logger.info(`Bundling complete. ${bundleConfigs.length} bundle(s) built.`);
			return true;
		});
}

exports.buildBundles = buildBundles;
exports.buildBundlesForFile = buildBundlesForFile;