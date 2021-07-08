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
		.then(exclusionTrees =>
			exclusionTrees.reduce((workingTree, exclusionTree) =>
				builder.subtractTrees(workingTree, exclusionTree)
			, tree)
		);
}

function filterSuccessfulResults(results) {
	return results.filter(result => result.success);
}

function getSummaryMessage(results) {
	const successCount = filterSuccessfulResults(results).length;
	const failureCount = results.length - successCount;

	return `Bundling summary: ${successCount} bundle(s) built successfully, ${failureCount} bundle(s) failed to build.`;
}

function bundle(builder, {entry, exclusions}, {destDir, minify, defaultExclusions, logger}) {
	const filteredExclusions = getExclusions(entry, exclusions, defaultExclusions);

	const options = {
		minify: minify || false
	};

	const bundleName = getBundleName(entry);

	logger.info(`Building bundle "${bundleName}"...`);

	return builder.trace(ensureJsExtension(entry))
		.then(tree => getSubtractedTree(builder, tree, filteredExclusions))
		.then(tree => builder.bundle(tree, options))
		.then(result =>
			writeBundleFile(bundleName, destDir, result.source)
				.then(() => buildBundleDef(entry, result))
		)
		.then(bundleDef => {
			logger.info(`Bundle "${bundleName}" complete.`);
			return {
				success: true,
				bundleDef
			};
		})
		.catch(e => {
			logger.error(`An error was encountered while building bundle "${bundleName}".`);
			logger.error(e);
			return {
				success: false
			};
		});
}

function buildBundlesForFile(filename, bundleConfigs, options) {
	return bundleConfigFilterer.filterByFilename(filename, bundleConfigs, options.sourceDir)
		.then(bundleConfigsForFile => {
			let bundleConfigsToBuild;

			if(bundleConfigsForFile.length) {
				bundleConfigsToBuild = bundleConfigsForFile;
				options.logger.info(`Found "${filename}" in ${bundleConfigsForFile.length} bundle(s).`);
			} else {
				bundleConfigsToBuild = bundleConfigs;
				options.logger.info(`Could not find "${filename}" in any bundles. Building all bundles.`);
			}

			return buildBundles(bundleConfigsToBuild, {...options, ...{mergedBundleDefs: true}});
		});
}

function buildBundles(bundleConfigs, options) {
	const builder = new jspm.Builder(options.sourceDir);

	const promises = bundleConfigs.map(bundleConfig => bundle(builder, bundleConfig, options));

	return Promise.all(promises)
		.then(results => {
			const bundleDefs = filterSuccessfulResults(results).map(result => result.bundleDef);

			const combinedBundleDefs = combineBundleDefs(bundleDefs);
			return systemConfigUtils.setBundleDefs(combinedBundleDefs, options.sourceDir, options.mergedBundleDefs)
				.then(() => results);
		})
		.then(results => {
			const success = filterSuccessfulResults(results).length === results.length;
			const message = getSummaryMessage(results);
			options.logger.info(message);
			return {
				success,
				message
			};
		});
}

exports.buildBundles = buildBundles;
exports.buildBundlesForFile = buildBundlesForFile;