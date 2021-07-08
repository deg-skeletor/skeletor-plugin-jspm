const bundler = require('./lib/bundler');
const fileCopier = require('./lib/fileCopier');

function copyFiles(sourceDir, destDir) {
	return Promise.all([
		fileCopier.copySystemJsFile(sourceDir, destDir),
		fileCopier.copyConfigFile(sourceDir, destDir)
	]);
}

function getBundlerOptions(config, {logger}) {
	return {
		sourceDir: config.sourceDir,
		destDir: config.destDir,
		minify: config.minify,
		defaultExclusions: config.bundles ? config.bundles.defaultExclusions : [],
		logger
	};
}

function ensureBundleConfigs(config) {
	return config.bundles && Array.isArray(config.bundles.items) ? config.bundles.items : [];
}

const run = (config, options) => {
	const bundlerOptions = getBundlerOptions(config, options);

	const bundleConfigs = ensureBundleConfigs(config);

	const bundlerPromise = options.source && options.source.filepath ?
			bundler.buildBundlesForFile(options.source.filepath, bundleConfigs, bundlerOptions) :
			bundler.buildBundles(bundleConfigs, bundlerOptions);

	return bundlerPromise
		.then(result =>
			copyFiles(config.sourceDir, config.destDir)
				.then(() => result)
		)
		.then(result => ({
			status: result.success ? 'complete' : 'error',
			message: result.message
		}))
		.catch(e => {
			options.logger.error(e);
			return {
				status: 'error',
				error: e
			};
		});
};

module.exports = skeletorPluginJspm = () => (
	{
		run
	}
);