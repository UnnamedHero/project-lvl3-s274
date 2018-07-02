install:
	npm install

start:
	npm run babel-node -- src/bin/page-loader.js

publish:
	npm publish

lint:
	npm run lint .

build:
	rm -rf dist
	npm run build

test:
	npm test
