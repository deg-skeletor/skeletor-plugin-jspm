'use strict';

const fsExtra = jest.genMockFromModule('fs-extra');

const readFile = (filepath, format) => {
	return Promise.resolve('');
};

const outputFile = (filepath, contents) => {
	return Promise.resolve(true)
};

fsExtra.readFile = readFile;
fsExtra.outputFile = outputFile;

module.exports = fsExtra;