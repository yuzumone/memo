.PHONY: install preview clean

install:
	npm ci

dist: clean install
	npm run build

preview: dist
	npm run preview

clean:
	find src/content/docs/notes -type f -name '*.md' -delete
