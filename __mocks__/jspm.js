'use strict';

let bundleResults = {};

const defaultBundleResult = {
	source: ''
};

const __setMockBundleResults = mockBundleResults => {
	bundleResults = mockBundleResults;
};

const trace = entry => {
	return Promise.resolve(entry);
};

const subtractTrees = (tree1, tree2) => {
	return `${tree1} - ${tree2}`;
};

const bundle = (entry, options) => {
	const bundleResult = bundleResults[entry] ? bundleResults[entry] : defaultBundleResult;
	return Promise.resolve(bundleResult);
};

const builderInstance = {
	trace,
	subtractTrees,
	bundle,
	__setMockBundleResults
};

const Builder = jest.fn(sourceDir => builderInstance);

const jspm = {
	Builder
};

module.exports = jspm;