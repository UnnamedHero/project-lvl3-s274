install:
	npm install

start:
	npm run babel-node -- src/bin/page-loader.js ${ARGS}

publish:
	npm publish

lint:
	npm run lint .

build:
	rm -rf dist
	npm run build

test:
	npm test
