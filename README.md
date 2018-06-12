# skeletor-plugin-jspm
[![Build Status](https://travis-ci.org/deg-skeletor/skeletor-plugin-jspm.svg?branch=master)](https://travis-ci.org/deg-skeletor/skeletor-plugin-jspm)

## Config
```js
{
	sourceDir: 'source',
	destDir: 'dist',
	minify: true,
	bundles: {
		defaultExclusions: ['common']
		items: [
			{
				entry: 'common'
			},
			{
				entry: 'page1'
			},
			{
				entry: 'page2',
				exclusions: []
			}
		]
	}
}
```
