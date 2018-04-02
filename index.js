const bundler = require('./lib/bundler');

const run = (config, {logger}) => {

	const options = {
		sourceDir: config.sourceDir,
		destDir: config.destDir,
		minify: config.minify
	};

	return bundler().buildBundles(config.bundles.items, options)
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