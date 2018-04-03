'use strict';

const fsExtra = jest.genMockFromModule('fs-extra');

let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
	mockFiles = {...newMockFiles};
}

const readFile = (filepath, format) => {
	return mockFiles[filepath] ? 
		Promise.resolve(mockFiles[filepath]) : 
		Promise.reject(`File "${filepath}" not found`);
};

const outputFile = (filepath, contents) => {
	return Promise.resolve(true)
};

const copy = (src, dest) => {
	return Promise.resolve(true);
};

fsExtra.readFile = readFile;
fsExtra.outputFile = outputFile;
fsExtra.copy = copy;
fsExtra.__setMockFiles = __setMockFiles;

module.exports = fsExtra;