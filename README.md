# BackMeUp Timeline-Search

A map- and timeline search frontend for BackMeUp.

## Developer Instructions

* Make sure you have a running search backend available for development. (At the moment, the
  project expects an ElasticSearch instance running on the default port.)

* Open `index.html` in your browser, with the browser's same-origin-policy is disabled. (E.g.
  on Chrome, start with `chrome-browser --disable-web-security`)

## Build Instructions

The project includes a gulpfile for building a packaged version using the
[gulp](http://gulpjs.com/) build system. The gulpfile defines the following tasks:

* __gulp__ (default): builds a minified version of the code, __without__ the external
  dependencies of [simplehistogram.js](https://github.com/rsimon/simplehistogram.js),
  [dateflipper.js](https://github.com/rsimon/dateflipper.js) and
  [Leaflet](http://leafletjs.com/).

* __gulp unminified__: builds a non-minified version of the code, __without__ the
  external dependencies of [simplehistogram.js](https://github.com/rsimon/simplehistogram.js),
  [dateflipper.js](https://github.com/rsimon/dateflipper.js) and [Leaflet](http://leafletjs.com/).

* __gulp no-deps__: builds a minified version of the code, __with__ the external
    dependencies of [simplehistogram.js](https://github.com/rsimon/simplehistogram.js) and
    [dateflipper.js](https://github.com/rsimon/dateflipper.js) included. (Leaflet will
    not be included though!).

Make sure you have the gulp plugins [gulp-concat](https://www.npmjs.com/package/gulp-concat/),
[gulp-uglify](https://www.npmjs.com/package/gulp-uglify) and
[gulp-concat-css](https://www.npmjs.com/package/gulp-concat-css) installed.
