const jspmPlugin = require('./index');

const logger = {
	info: () => {},
	error: () => {}
};

const options = {
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

jest.mock('jspm');
jest.mock('fs-extra');

test('run() returns success if no bundles specified', () => {
	
	const pluginConfig = {
		bundles: {
			items: []
		}
	};

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, options)
		.then(response => {
			expect(response.status).toMatch('complete');
		});
});

test('run() builds one bundle', () => {
	jest.restoreAllMocks();
	const jspm = require('jspm');
	const builder = new jspm.Builder();
	const bundleSpy = jest.spyOn(builder, 'bundle');

	const expectedOptions = {};

	expect.assertions(1);
	return jspmPlugin().run(pluginConfigs.singleBundle, options)
		.then(response => {
			expect(builder.bundle).toBeCalledWith('main.js', expectedOptions);
		});
});

test('run() writes one bundle file', () => {
	jest.restoreAllMocks();
	const expectedBundleContents = 'contents1'; 

	const jspm = require('jspm');
	const builder = new jspm.Builder();
	builder.__setMockBundleResults({
		'main.js': {
			source: expectedBundleContents
		}
	});

	const fs = require('fs-extra');
	const outputFileSpy = jest.spyOn(fs, 'outputFile');

	const expectedOptions = {};

	expect.assertions(1);
	return jspmPlugin().run(pluginConfigs.singleBundle, options)
		.then(response => {
			expect(fs.outputFile).toBeCalledWith('dist/main-bundle.js', expectedBundleContents);
		});
});

test('run() builds two bundles', () => {
	jest.restoreAllMocks();
	const jspm = require('jspm');
	const builder = new jspm.Builder();
	const bundleSpy = jest.spyOn(builder, 'bundle');
	
	const expectedOptions = {};

	expect.assertions(3);
	return jspmPlugin().run(pluginConfigs.multipleBundles, options)
		.then(response => {
			expect(builder.bundle.mock.calls.length).toEqual(2);
			expect(builder.bundle.mock.calls[0]).toEqual(['main.js', expectedOptions]);
			expect(builder.bundle.mock.calls[1]).toEqual(['page2.js', expectedOptions]);
		});
});

test('run() writes two bundle files', () => {
	jest.restoreAllMocks();
	const expectedBundleContents1 = 'contents1'; 
	const expectedBundleContents2 = 'contents2'; 

	const jspm = require('jspm');
	const builder = new jspm.Builder();
	builder.__setMockBundleResults({
		'main.js': {
			source: expectedBundleContents1
		},
		'page2.js': {
			source: expectedBundleContents2
		}
	});

	const fs = require('fs-extra');
	const outputFileSpy = jest.spyOn(fs, 'outputFile');

	const expectedOptions = {};

	expect.assertions(3);
	return jspmPlugin().run(pluginConfigs.multipleBundles, options)
		.then(response => {
			expect(fs.outputFile.mock.calls.length).toEqual(3);
			expect(fs.outputFile.mock.calls[0]).toEqual(['dist/main-bundle.js', expectedBundleContents1]);
			expect(fs.outputFile.mock.calls[1]).toEqual(['dist/page2-bundle.js', expectedBundleContents2]);
		});
});