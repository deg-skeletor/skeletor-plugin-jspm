const fs = require('fs-extra');
const path = require('path');
const configFilename = 'jspm.config.js';

const configInjector = () => {

	const injectBundleDefs = (bundleDefs, configDir, replace = false) => {
		const configFilepath = path.join(configDir, configFilename);

		fs.readFile(configFilepath, 'utf8')
			.then(contents => {
				let newContents = replace ? 
					replaceBundleDefs(contents, bundleDefs) :
					mergeBundleDefs(contents, bundleDefs);
				return fs.outputFile(configFilepath, newContents);
			});
	};

	const addBundleDefs = (contents, bundleDefs) => {
		const bundlesString = stringifyBundleDefs(bundleDefs);
		const text = 'browserConfig: {';
		const newText = `${text}\n${bundlesString},`;

		return contents.replace(text, newText);
	};

	const replaceBundleDefs = (contents, bundleDefs) => {
		const re = /"bundles": ({[^}]*})/;

		const matches = contents.match(re);
		if(matches !== null && matches.length > 1) {
			const bundlesString = stringifyBundleDefs(bundleDefs);
			return contents.replace(re, bundlesString);
		} else {
			return addBundleDefs(contents, bundleDefs);
		}
	};

	const mergeBundleDefs = (contents, bundleDefs) => {
		const re = /"bundles": ({[^}]*})/;
		const matches = contents.match(re);

		if(matches !== null && matches.length > 1) {
			const oldBundleDefs = JSON.parse(matches[1]);
			return replaceBundleDefs(contents, {...oldBundleDefs, ...bundleDefs})
		}

		return replaceBundleDefs(contents, bundleDefs);
	}

	const stringifyBundleDefs = bundleDefs => `"bundles": ${JSON.stringify(bundleDefs)}`;

	return {
		injectBundleDefs
	};
};

module.exports = configInjector;