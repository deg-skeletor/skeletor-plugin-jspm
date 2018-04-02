const jspmPlugin = require('./index');

const logger = {
	info: () => {},
	error: () => {}
};

const options = {
	logger
};

const jspmConfigFilepath = 'source/jspm.config.js';
const jspmConfigFileContents = 'browserConfig: {"bundles": {}}';

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

	const fs = require('fs-extra');
	fs.__setMockFiles({[jspmConfigFilepath]: jspmConfigFileContents});

	const expectedOptions = {minify: false};

	expect.assertions(1);
	return jspmPlugin().run(pluginConfigs.singleBundle, options)
		.then(response => {
			expect(builder.bundle).toBeCalledWith('main.js', expectedOptions);
		});
});

test('run() minifies one bundle', () => {
	jest.restoreAllMocks();
	const jspm = require('jspm');
	const builder = new jspm.Builder();
	const bundleSpy = jest.spyOn(builder, 'bundle');

	const fs = require('fs-extra');
	fs.__setMockFiles({[jspmConfigFilepath]: jspmConfigFileContents});

	const expectedOptions = {minify: true};

	const pluginConfig = {...pluginConfigs.singleBundle};
	pluginConfig.minify = true;

	expect.assertions(1);
	return jspmPlugin().run(pluginConfig, options)
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
	fs.__setMockFiles({[jspmConfigFilepath]: jspmConfigFileContents});
	const outputFileSpy = jest.spyOn(fs, 'outputFile');

	expect.assertions(1);
	return jspmPlugin().run(pluginConfigs.singleBundle, options)
		.then(response => {
			expect(fs.outputFile).toBeCalledWith('dist/main-bundle.js', expectedBundleContents);
		});
});

test('run() updates jspm.config.js file with one bundle definition', () => {
	jest.restoreAllMocks();
	const expectedBundleContents = 'contents1'; 
	
	const jspm = require('jspm');
	const builder = new jspm.Builder();
	builder.__setMockBundleResults({
		'main.js': {
			source: expectedBundleContents,
			modules: ['main.js', 'component.js']
		}
	});

	const fs = require('fs-extra');
	fs.__setMockFiles({[jspmConfigFilepath]: jspmConfigFileContents});
	const outputFileSpy = jest.spyOn(fs, 'outputFile');

	const expectedConfigContents = 'browserConfig: {"bundles": {"main-bundle.js":["main.js","component.js"]}}';

	expect.assertions(2);
	return jspmPlugin().run(pluginConfigs.singleBundle, options)
		.then(response => {
			expect(fs.outputFile.mock.calls.length).toEqual(2);
			expect(fs.outputFile.mock.calls[1]).toEqual([jspmConfigFilepath, expectedConfigContents]);
		});
});

test('run() builds two bundles', () => {
	jest.restoreAllMocks();
	const jspm = require('jspm');
	const builder = new jspm.Builder();
	const bundleSpy = jest.spyOn(builder, 'bundle');
	
	const expectedOptions = {minify: false};

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
	fs.__setMockFiles({[jspmConfigFilepath]: jspmConfigFileContents});
	const outputFileSpy = jest.spyOn(fs, 'outputFile');

	expect.assertions(3);
	return jspmPlugin().run(pluginConfigs.multipleBundles, options)
		.then(response => {
			expect(fs.outputFile.mock.calls.length).toEqual(3);
			expect(fs.outputFile.mock.calls[0]).toEqual(['dist/main-bundle.js', expectedBundleContents1]);
			expect(fs.outputFile.mock.calls[1]).toEqual(['dist/page2-bundle.js', expectedBundleContents2]);
		});
});

test('run() updates jspm.config.js file with two bundle definitions', () => {
	jest.restoreAllMocks();
		
	const jspm = require('jspm');
	const builder = new jspm.Builder();
	builder.__setMockBundleResults({
		'main.js': {
			source: '',
			modules: ['main.js', 'component.js']
		},
		'page2.js': {
			source: '',
			modules: ['page2.js']
		}
	});

	const fs = require('fs-extra');
	fs.__setMockFiles({[jspmConfigFilepath]: jspmConfigFileContents});
	const outputFileSpy = jest.spyOn(fs, 'outputFile');

	const expectedConfigContents = 'browserConfig: {"bundles": {"main-bundle.js":["main.js","component.js"],"page2-bundle.js":["page2.js"]}}';

	expect.assertions(2);
	return jspmPlugin().run(pluginConfigs.multipleBundles, options)
		.then(response => {
			expect(fs.outputFile.mock.calls.length).toEqual(3);
			expect(fs.outputFile.mock.calls[2]).toEqual([jspmConfigFilepath, expectedConfigContents]);
		});
});