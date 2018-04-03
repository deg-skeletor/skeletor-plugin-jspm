const bundler = require('./lib/bundler');
const fileCopier = require('./lib/fileCopier');

const copyFiles = (sourceDir, destDir) => {
	return Promise.all([
		fileCopier.copySystemJsFile(sourceDir, destDir),
		fileCopier.copyConfigFile(sourceDir, destDir)
	]);
};

const run = (config, {logger}) => {
	const options = {
		sourceDir: config.sourceDir,
		destDir: config.destDir,
		minify: config.minify,
		defaultExclusions: config.bundles.defaultExclusions
	};

	return bundler().buildBundles(config.bundles.items, options)
		.then(() => copyFiles(config.sourceDir, config.destDir))
		.then(() => {
			const message = `${config.bundles.items.length} bundle(s) processed`;
			logger.info(message);
			return {
				status: 'complete',
				message: message
			};
		})
		.catch(e => {
			logger.error(e);
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