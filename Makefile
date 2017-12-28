REPORTER = list
MOCHA_OPTS = --ui bdd -c

db:
	echo Seeding blog-test *****************************************************
	./seed.sh
test:
	clear

	echo Starting test *********************************************************
	./node_modules/mocha/bin/mocha \
	--reporter $(REPORTER) \
	$(MOCHA_OPTS) \
	tests/*.js
	echo Ending test
start:
	    TWITTER_CONSUMER_KEY=eAdHRhgWzjgl72WYvqP3EL3d3 \
	    TWITTER_CONSUMER_SECRET=AFmUWsYV9hlw983xVofwsBRBu9SEczLMKMLlOkRGPxkiSeZugg 	\
	    COOKIE_CONST=107d177803c70ebbe11ae6e527e4047d0168469484c9ad5c4e163783a3415466  \
	    SESSION_CONST=071ffc0d40504f72859ee0ed711ade844577962c01f75811dbdd2e71ad17a095  \
	    npm start 

.PHONY: test db  start