REPORTER = list
MOCHA_OPTS = --ui bdd -c

test:
	clear
	echo Starting test *********************************************************
	./node_modules/mocha/bin/mocha \
	--reporter $(REPORTER) \
	$(MOCHA_OPTS) \
	tests/*.js
	echo Ending test
start:
	TWITTER_CONSUMER_KEY= eAdHRhgWzjgl72WYvqP3EL3d3 \
	TWITTER_CONSUMER_SECRET= AFmUWsYV9hlw983xVofwsBRBu9SEczLMKMLlOkRGPxkiSeZugg \
	node  app

.PHONY: test