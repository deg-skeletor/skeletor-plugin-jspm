const jspmPlugin = require('../index');
const jspm = require('jspm');
const fse = require('fs-extra');
const path = require('path');

const logger = {
	info: () => {},
	warn: () => {},
	error: () => {}
};

const pluginOptions = {
	logger
};

const jspmConfigFilepath = 'source/jspm.browser.js';

beforeEach(() => {
	jest.restoreAllMocks();

	fse.__setMockFiles({
		[jspmConfigFilepath]: 'SystemJS.config({baseURL:""});'
	});

});

jest.mock('jspm');
jest.mock('fs-extra');
jest.mock('path');

test('run() returns success when no bundles configuration exists', () => {
	
	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist'
	};

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(response.status).toMatch('complete');
		});
});


test('run() returns success when bundles configuration is empty', () => {
	
	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			items: []
		}
	};

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(response.status).toMatch('complete');
		});
});

test('run() returns success if one bundle specified', () => {
	
	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			items: [{
				entry: 'main'
			}]
		}
	};

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(response.status).toMatch('complete');
		});
});