const bundler = require('./lib/bundler');

const run = (config, {logger}) => {

	return bundler().buildBundles(config.bundles.items, config.sourceDir, config.destDir)
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