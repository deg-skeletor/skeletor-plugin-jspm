'use strict';

let bundleResults = {};

const defaultBundleResult = {
	source: ''
};

const __setMockBundleResults = mockBundleResults => {
	bundleResults = mockBundleResults;
};

const bundle = (entry, options) => {
	const bundleResult = bundleResults[entry] ? bundleResults[entry] : defaultBundleResult;
	return Promise.resolve(bundleResult);
};

const builderInstance = {
	bundle,
	__setMockBundleResults
};

const Builder = jest.fn(sourceDir => builderInstance);

const jspm = {
	Builder
};

module.exports = jspm;