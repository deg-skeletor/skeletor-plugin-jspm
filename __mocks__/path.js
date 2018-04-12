'use strict';

const path = jest.genMockFromModule('path');

const relative = (path1, path2) => {
	return path2;
};

const join = (path1, path2) => {
	return path1 + path.sep + path2;
}

path.relative = relative;
path.join = join;

module.exports = path;