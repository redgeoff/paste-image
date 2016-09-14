paste-image [![Build Status](https://travis-ci.org/redgeoff/paste-image.svg)](https://travis-ci.org/redgeoff/paste-image) [![Coverage Status](https://coveralls.io/repos/redgeoff/paste-image/badge.svg?branch=master&service=github)](https://coveralls.io/github/redgeoff/paste-image?branch=master) [![Dependency Status](https://david-dm.org/redgeoff/paste-image.svg)](https://david-dm.org/redgeoff/paste-image)
===
[![Selenium Test Status](https://saucelabs.com/browser-matrix/paste-image.svg)](https://saucelabs.com/u/paste-image)

Cross-browser pasting of images


Example
===

pasteImage.on('paste-image', function (image) {
  document.body.appendChild(image);
});
