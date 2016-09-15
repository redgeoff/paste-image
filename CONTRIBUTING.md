Contributing
====

Beginning Work on an Issue
---
	Create branch
	git clone branch-url


Committing Changes
---
[Commit Message Format](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit)

	npm run coverage
	npm run beautify
	git add -A
	git commit -m msg
	git push


Building
---

	npm run build


Publishing to npm/bower
---

First, make sure that you have previously issued `npm adduser`. Also make sure that you have tin installed, e.g. `npm install -g tin`. Then:

	tin -v VERSION
	git diff # check that only version changed
	npm run build-and-publish


Updating Dependencies
---
This requires having david installed globally.

	david update


Run all local tests
---

	npm run test


Run single node test
---

	node_modules/mocha/bin/mocha -g regex test


Run subset of tests and analyze coverage
---

	node_modules/istanbul/lib/cli.js cover _mocha -- -g regex test


Debugging Tests Using Node Inspector
---

	$ node-inspector # leave this running in this window
	Use *Chrome* to visit http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858
	$ mocha -g regex test/index.js --debug-brk


Running Browser Tests With Coverage
---

		$ npm run browser-coverage-full-test

You can filter full browser tests using the GREP env variable, e.g.

		$ GREP='e2e basic' npm run browser-coverage-full-test


Running Tests in PhantomJS
---

    $ npm run browser-test-phantomjs


You can filter the PhantomJS tests using the GREP env variable, e.g.

    $ GREP='e2e basic' npm run browser-test-phantomjs


Running Tests in Chrome and Firefox Automatically
---

Currently, this cannot be done in the VM as this project has not been configured to run Chrome and Firefox via Selenium headlessly. You can however use

    $ npm run test-firefox
    $ npm run test-chrome

to test outside the VM, assuming you have Firefox and Chrome installed.

Run tests in a browser
---

	$ npm run browser-server
	Use browser to visit http://127.0.0.1:8001/test/browser/index.html


Run Saucelabs Tests In a Specific Browser
---

	$ CLIENT="saucelabs:internet explorer:9" SAUCE_USERNAME=paste-image
	  SAUCE_ACCESS_KEY=26444f91-b3e8-455a-a4fe-e426105f756e npm run browser-test


Updating gh-pages
---

	git checkout gh-pages
	git merge master
	git push origin gh-pages
	git checkout master
>>>>>>> 29e7768b09d8caa8cfe395f9fed7b702a8af49b1
