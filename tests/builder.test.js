const jspmPlugin = require('../index');
const jspm = require('jspm');
const builder = new jspm.Builder();
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

const pluginConfigs = {
	singleBundle: {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			items: [{
				entry: 'main'
			}]
		}
	},
	multipleBundles: {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			items: [
				{
					entry: 'main'
				},
				{
					entry: 'page2'
				}
			]
		}
	}	
};

const defaultExpectedBundleOptions = {minify: false};

jest.mock('jspm');
jest.mock('fs-extra');
jest.mock('path');

beforeEach(() => {
  jest.restoreAllMocks();

  fse.__setMockFiles({
		'source/jspm.browser.js': 'contents'
	});

  jest.spyOn(builder, 'bundle');
});

test('run() builds one bundle', () => {
	expect.assertions(1);
	return jspmPlugin().run(pluginConfigs.singleBundle, pluginOptions)
		.then(response => {
			expect(builder.bundle).toBeCalledWith('main.js', defaultExpectedBundleOptions);
		});
});

test('run() builds two bundles', () => {	
	expect.assertions(3);
	return jspmPlugin().run(pluginConfigs.multipleBundles, pluginOptions)
		.then(response => {
			expect(builder.bundle.mock.calls.length).toEqual(2);
			expect(builder.bundle.mock.calls[0]).toEqual(['main.js', defaultExpectedBundleOptions]);
			expect(builder.bundle.mock.calls[1]).toEqual(['page2.js', defaultExpectedBundleOptions]);
		});
});

test('run() minifies one bundle', () => {	
	const expectedOptions = {minify: true};

	const pluginConfig = {...pluginConfigs.singleBundle};
	pluginConfig.minify = true;

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(builder.bundle).toBeCalledWith('main.js', expectedOptions);
		});
});

test('run() builds bundle with one default exclusion', () => {	
	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			defaultExclusions: ['common'],
			items: [
				{
					entry: 'main'
				},
				{
					entry: 'common'
				}
			]
		}
	};

	const expectedExpression = 'main.js - common.js';

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(builder.bundle).toBeCalledWith(expectedExpression, defaultExpectedBundleOptions);
		});
});

test('run() builds bundle with two default exclusions', () => {	
	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			defaultExclusions: ['common1', 'common2'],
			items: [
				{
					entry: 'main'
				},
				{
					entry: 'common1'
				},
				{
					entry: 'common2'
				}
			]
		}
	};

	const expectedExpression = 'main.js - common1.js - common2.js';

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(builder.bundle).toBeCalledWith(expectedExpression, defaultExpectedBundleOptions);
		});
});

test('run() builds bundle that is the default exclusion', () => {	
	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			defaultExclusions: ['common'],
			items: [
				{
					entry: 'main'
				},
				{
					entry: 'common'
				}
			]
		}
	};

	const expectedExpression = 'common.js';

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(builder.bundle).toBeCalledWith(expectedExpression, defaultExpectedBundleOptions);
		});
});

test('run() builds bundle with one exclusion', () => {

	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			defaultExclusions: ['common'],
			items: [
				{
					entry: 'common'
				},
				{
					entry: 'common2'
				},
				{
					entry: 'page1',
					exclusions: ['common2']
				},
				{
					entry: 'page2'
				}
			]
		}
	}

	const expectedExpression = 'page1.js - common2.js';

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, pluginOptions)
		.then(response => {
			expect(builder.bundle.mock.calls[2]).toEqual([expectedExpression, defaultExpectedBundleOptions]);
		});
});

test('run() only builds bundle for specified source file', () => {

	fse.__setMockFiles({
		'source/jspm.browser.js': `
			SystemJS.config({				
				bundles: {
					"main-bundle.js": [
						"components/component1.js"
					],
					"page1-bundle.js": [
						"page1.js",
						"components/component2.js"
					]
				}
			});
		`
	});

	const pluginConfig = {
		sourceDir: 'source',
		destDir: 'dist',
		bundles: {
			items: [
				{
					entry: 'main'
				},
				{
					entry: 'page1'
				}
			]
		}
	};

	const newPluginOptions = {...pluginOptions, ...{
		source: {
			filepath: 'components/component2.js'
		}
	}};

	const expectedExpression = 'page1.js';

	expect.assertions(2);
	return jspmPlugin().run(pluginConfig, newPluginOptions)
		.then(response => {
			expect(builder.bundle.mock.calls.length).toEqual(1);
			expect(builder.bundle.mock.calls[0]).toEqual([expectedExpression, defaultExpectedBundleOptions]);
		});
});