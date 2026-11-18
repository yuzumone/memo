NOCTL ?= noctl
NOTION_DATABASE_ID ?= 405931b350248020b169fb6f4abfaf4e
ARTICLES_DIR ?= content/articles
LINK_TEMPLATE ?= /articles/{slug}/

.PHONY: articles clean export embed

articles:
	$(MAKE) clean
	$(MAKE) export
	$(MAKE) embed

clean:
	mkdir -p '$(ARTICLES_DIR)'
	find '$(ARTICLES_DIR)' -type f -name '*.md' -delete

export:
	$(NOCTL) export db '$(NOTION_DATABASE_ID)' --output '$(ARTICLES_DIR)' --link-template '$(LINK_TEMPLATE)'

embed:
	find '$(ARTICLES_DIR)' -type f -name '*.md' -exec sed -i '' -E \
		-e '/^ {0,3}`{3,}/,/^ {0,3}`{3,}[[:space:]]*$$/b' \
		-e '/^ {0,3}~{3,}/,/^ {0,3}~{3,}[[:space:]]*$$/b' \
		-e 's@^\[([^]"]*)\]\((https?://[^[:space:]"]*)\)$$@{{< embed url="\2" title="\1" >}}@' \
		-e '/^\{\{< embed /s/[\\][|]/|/g' \
		-e '/^\{\{< embed /s/[\\]_/_/g' {} +
