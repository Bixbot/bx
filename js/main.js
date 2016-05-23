// minifyOnSave: true, filenamePattern: ../demo/bx.min.js

/*! The MIT License (MIT)
Copyright (c) 2016 Bixbot

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

// Self-executing function that returns the bx object
var bx = (function() {

    // The main bx object itself
    var bx = {};

    // Contains data relating to the scroll function
    var scroller = {
		attribute: 'data-scroll',
		speed: 500,
		offset: 0,
        timeout: null,
        interval: null
	};

    // When invoking the bx object:
    //  * add functions to onload
    //  * query strings
    bx = function(onload) {
        if (bx.isFunction(onload)) {
            bx.ready(onload);
        } else if (typeof onload == 'string') {
            var nodes = document.querySelectorAll(onload);
            nodes.first = function () {
                return this[0];
            };
            nodes.each = function(callback) {
                for (var i = 0; i < this.length; i++) {
                    callback.call(this[i]);
                }
                return this;
            }
            return nodes;
        } else {
            console.log("bx onload: Don't know what to do with input parameter");
        }
    }

    // Check if input is a function
    bx.isFunction = function(subject) {
        var type = {};
        return subject && type.toString.call(subject) === '[object Function]';
    };

    // Add a callback to run when page is fully loaded
    bx.ready = function (callback) {
        if (document.readyState === "interactive" || document.readyState === "complete") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    };

    // Get height of an element
    bx.height = function(elem) {
        return Math.max(elem.scrollHeight, elem.offsetHeight, elem.clientHeight);
    };

    // Get height of viewport
    bx.viewportHeight = function() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    };

    // Get height of document
    bx.documentHeight = function() {
        return Math.max(bx.height(document.body), bx.height(document.documentElement));
    };

    // Initialize optional functionality.
    //   options: { scroll: Boolean }
    bx.init = function(options) {
        if (options.scroll) {
            bx.ready(function() {
                var scroll = function(anchor, toggle) {
            		var anchorElem = anchor === '#' ? document.documentElement : document.querySelector(anchor);
            		var startLocation = window.pageYOffset;
            		var endLocation = (function(anchor, offset) {
                        var location = 0;
                		if (anchor.offsetParent) {
                			do {
                				location += anchor.offsetTop;
                				anchor = anchor.offsetParent;
                			} while (anchor);
                		}
                		location = Math.max(location - offset, 0);
                		return Math.min(location, bx.documentHeight() - bx.viewportHeight());
                    })(anchorElem, parseInt(scroller.offset, 10));
            		var distance = endLocation - startLocation;
            		var timeLapsed = 0, percentage, position;

            		if (window.history.pushState && window.location.protocol !== 'file:') {
            			window.history.pushState(null, null, [window.location.protocol, '//', window.location.host, window.location.pathname, window.location.search, anchor].join(''));
            		}
            		var stopScroll = function (position, endLocation, animationInterval) {
            			if (position == endLocation || window.pageYOffset == endLocation || ((window.innerHeight + window.pageYOffset) >= bx.documentHeight())) {
            				clearInterval(scroller.interval);
            				anchorElem.focus();
            			}
            		};
            		var loopScroll = function () {
            			timeLapsed += 16;
            			percentage = ( timeLapsed / parseInt(scroller.speed, 10) );
            			percentage = ( percentage > 1 ) ? 1 : percentage;
            			position = startLocation + (distance * (percentage < 0.5 ? 2 * percentage * percentage : -1 + (4 - 2 * percentage) * percentage));
            			window.scrollTo(0, Math.floor(position));
            			stopScroll(position, endLocation, animationInterval);
            		};
            		var startScroll = function () {
            			clearInterval(scroller.interval);
            			scroller.interval = setInterval(loopScroll, 16);
            		};
            		if (window.pageYOffset === 0) { window.scrollTo( 0, 0 ); }
            		startScroll();
                };
                var scrollHandler = function(event) {
                    if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
                    var toggle = (function (elem) {
                		for (; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {
                			if (elem.hasAttribute(scroller.attribute)) {
                				return elem;
                			}
                		}
                		return null;
                	})(event.target);
            		if (toggle && toggle.tagName.toLowerCase() === 'a') {
            			event.preventDefault();
            			scroll(toggle.hash, toggle);
            		}
                };
                document.addEventListener('click', scrollHandler, false );
            });
        }
    };

    return bx;
})();
