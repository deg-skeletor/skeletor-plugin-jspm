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

  	jest.spyOn(fse, 'outputFile');
});

test('run() writes one bundle file', () => {
	const expectedBundleContents = 'contents1'; 

	builder.__setMockBundleResults({
		'main.js': {
			source: expectedBundleContents
		}
	});

	expect.assertions(2);
	return jspmPlugin().run(pluginConfigs.singleBundle, pluginOptions)
		.then(response => {
			expect(fse.outputFile.mock.calls.length).toEqual(2);
			expect(fse.outputFile.mock.calls[0]).toEqual(['dist/main-bundle.js', expectedBundleContents]);
		});
});

test('run() writes two bundle files', () => {
	const expectedBundleContents1 = 'contents1'; 
	const expectedBundleContents2 = 'contents2'; 

	builder.__setMockBundleResults({
		'main.js': {
			source: expectedBundleContents1
		},
		'page2.js': {
			source: expectedBundleContents2
		}
	});

	expect.assertions(3);
	return jspmPlugin().run(pluginConfigs.multipleBundles, pluginOptions)
		.then(response => {
			expect(fse.outputFile.mock.calls.length).toEqual(3);
			expect(fse.outputFile.mock.calls[0]).toEqual(['dist/main-bundle.js', expectedBundleContents1]);
			expect(fse.outputFile.mock.calls[1]).toEqual(['dist/page2-bundle.js', expectedBundleContents2]);
		});
});