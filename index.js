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

const run = (config, options) => {
	const bundlerOptions = getBundlerOptions(config, options);

	let bundlerPromise;

	if(config.bundles && Array.isArray(config.bundles.items)) {
		bundlerPromise = options.source && options.source.filepath ?
			bundler.buildBundlesForFile(options.source.filepath, config.bundles.items, bundlerOptions) :
			bundler.buildBundles(config.bundles.items, bundlerOptions);
	} else {
		bundlerPromise = Promise.resolve();
	}

	return bundlerPromise
		.then(() => copyFiles(config.sourceDir, config.destDir))
		.then(() => ({
			status: 'complete'
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