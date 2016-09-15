paste-image [![Build Status](https://travis-ci.org/redgeoff/paste-image.svg)](https://travis-ci.org/redgeoff/paste-image) [![Coverage Status](https://coveralls.io/repos/redgeoff/paste-image/badge.svg?branch=master&service=github)](https://coveralls.io/github/redgeoff/paste-image?branch=master) [![Dependency Status](https://david-dm.org/redgeoff/paste-image.svg)](https://david-dm.org/redgeoff/paste-image)
===
[![Selenium Test Status](https://saucelabs.com/browser-matrix/paste-image.svg)](https://saucelabs.com/u/paste-image)

Cross-browser pasting of images


Example
===

```js
// Listen for all image paste events on a page
pasteImage.on('paste-image', function (image) {

  // Display the image by appending it to the end of the body
  document.body.appendChild(image);

});
```


Install via NPM
===

    npm install paste-image


Why?
===

It's 2016 and Chrome is the only browser to properly implement the [Clipboard API](https://www.w3.org/TR/clipboard-apis). Let's wrap up some workarounds and provide an easy way to provide cross-browser image pasting.


[Contributing](CONTRIBUTING.md)
---
