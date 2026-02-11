.PHONY: markdown preview clean

markdown:
	emacs -Q --batch --load scripts/export.el --funcall export-to-starlight

dist: clean markdown
	npm run build

preview: dist
	npm run preview

clean:
	find src/content/docs -type f -name '*.md' -delete
