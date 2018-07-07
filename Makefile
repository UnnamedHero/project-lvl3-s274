install:
	npm install

start:
	npx babel-node -- src/bin/page-loader.js ${ARGS}

debug:
	DEBUG="page-loader:*" npx babel-node -- src/bin/page-loader.js ${ARGS}

publish:
	npm publish

lint:
	npm run lint .

build:
	rm -rf dist
	npm run build

test:
	npm test

watch:
	DEBUG="page-loader:*" npm test -- --watch