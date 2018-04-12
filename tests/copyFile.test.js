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

  	jest.spyOn(fse, 'copy');
});


test('run() copies jspm.browser.js and system.js files to destination directory', () => {
	expect.assertions(3);
	return jspmPlugin().run(pluginConfigs.singleBundle, pluginOptions)
		.then(response => {
			expect(fse.copy.mock.calls.length).toEqual(2);
			expect(fse.copy.mock.calls[0]).toEqual(['source/jspm_packages/system.js', 'dist/system.js']);
			expect(fse.copy.mock.calls[1]).toEqual(['source/jspm.browser.js', 'dist/jspm.browser.js']);
		});
});