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

const jspmConfigFilepath = 'source/jspm.browser.js';

jest.mock('jspm');
jest.mock('fs-extra');
jest.mock('path');

beforeEach(() => {
	jest.restoreAllMocks();

  	fse.__setMockFiles({
		[jspmConfigFilepath]: 'SystemJS.config({baseURL:""});'
	});

  	jest.spyOn(fse, 'outputFile');
});

test('run() updates jspm.browser.js file with one bundle definition', () => {
	const expectedBundleContents = 'contents1'; 
	
	builder.__setMockBundleResults({
		'main.js': {
			source: expectedBundleContents,
			modules: ['main.js', 'component.js']
		}
	});

	const expectedConfigContents = 'SystemJS.config({baseURL:"",\n\tbundles: {\n\t"main-bundle.js": [\n\t\t"main.js",\n\t\t"component.js"\n\t]\n}\n});';

	expect.assertions(2);
	return jspmPlugin().run(pluginConfigs.singleBundle, pluginOptions)
		.then(response => {
			expect(fse.outputFile.mock.calls.length).toEqual(2);
			expect(fse.outputFile.mock.calls[1]).toEqual([jspmConfigFilepath, expectedConfigContents]);
		});
});

test('run() updates jspm.browser.js file with two bundle definitions', () => {
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

	const expectedConfigContents = 'SystemJS.config({baseURL:"",\n\tbundles: {\n\t"main-bundle.js": [\n\t\t"main.js",\n\t\t"component.js"\n\t],\n\t"page2-bundle.js": [\n\t\t"page2.js"\n\t]\n}\n});';

	expect.assertions(2);
	return jspmPlugin().run(pluginConfigs.multipleBundles, pluginOptions)
		.then(response => {
			expect(fse.outputFile.mock.calls.length).toEqual(3);
			expect(fse.outputFile.mock.calls[2]).toEqual([jspmConfigFilepath, expectedConfigContents]);
		});
});