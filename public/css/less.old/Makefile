STYLE = ../style.css
STYLE_LESS = style.less
LESS_COMPRESSOR ?= `which lessc`
WATCHR ?= `which watchr`

#
# BUILD DOCS
#


	lessc ${STYLE_LESS} > ${STYLE}

#
# WATCH LESS FILES
#

watch:
	echo "Watching less files..."; \
	watchr -e "watch('.*\.less') { system 'make' }"


.PHONY: docs watch
