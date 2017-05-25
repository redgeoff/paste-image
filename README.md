paste-image [![Build Status](https://travis-ci.org/redgeoff/paste-image.svg)](https://travis-ci.org/redgeoff/paste-image) [![Coverage Status](https://coveralls.io/repos/redgeoff/paste-image/badge.svg?branch=master&service=github)](https://coveralls.io/github/redgeoff/paste-image?branch=master) [![Dependency Status](https://david-dm.org/redgeoff/paste-image.svg)](https://david-dm.org/redgeoff/paste-image)
===

[![Greenkeeper badge](https://badges.greenkeeper.io/redgeoff/paste-image.svg)](https://greenkeeper.io/)
[![Selenium Test Status](https://saucelabs.com/browser-matrix/paste-image-user.svg)](https://saucelabs.com/u/paste-image-user)

Cross-browser pasting of images


[Live Demo](http://redgeoff.github.io/paste-image/examples)
---
A [simple example](http://redgeoff.github.io/paste-image/examples) that works in all major browsers.


Example
---

```js
// Listen for all image paste events on a page
pasteImage.on('paste-image', function (image) {

  // Display the image by appending it to the end of the body
  document.body.appendChild(image);

});
```


Install via NPM
---

    npm install paste-image


Why?
---

It's 2016 and Chrome is the only browser to properly implement the [Clipboard API](https://www.w3.org/TR/clipboard-apis). Let's wrap up some workarounds and provide an easy way to provide cross-browser image pasting.


[Contributing](CONTRIBUTING.md)
---
