# sass-module-importer

Simple importer for [node-sass](https://github.com/sass/node-sass) to import [npm](https://www.npmjs.com) and [bower](http://bower.io/search/) modules.

Say good-bye to all the mess with relative paths on your Sass files.  
You can now import your Sass/SCSS modules by referencing to the module name, like this:

```sass
@import "sass-easing";
@import "quantum-colors";
@import "inuit-defaults";
@import "inuit-functions";
@import "inuit-mixins";
@import "inuit-box-sizing";
@import "inuit-normalize";
@import "inuit-page";
// :)
```

Just for comparison, look at this mess:

```sass
@import "node_modules/sass-easing/_easings.scss";
@import "bower_components/quantum-colors/_quantum-colors.scss";
@import "bower_components/inuit-defaults/settings.defaults";
@import "bower_components/inuit-functions/tools.functions";
@import "bower_components/inuit-mixins/tools.mixins";
@import "bower_components/inuit-normalize/generic.normalize";
@import "bower_components/inuit-box-sizing/generic.box-sizing";
@import "bower_components/inuit-page/base.page";
// :(
```

## How-to

### install

```sh
npm install sass-module-importer --save-dev
```

### use the importer with [node-sass](https://github.com/sass/node-sass) `>= v3.0.0`

```js
var sass = require('node-sass');
var moduleImporter = require('sass-module-importer');

sass.render({
  file: './source/css/app.scss',
  importer: moduleImporter()
}, cb);
```

### use the importer with [gulp-sass](https://github.com/dlmanning/gulp-sass)

```js
var gulp = require('gulp');
var sass = require('gulp-sass');
var moduleImporter = require('sass-module-importer');

gulp.task('style', function() {
  return gulp.src('./source/css/app.scss')
    .pipe(sass({ importer: moduleImporter() }))
    .pipe(gulp.dest('./public/css'));
});
```

## Tests
Use `npm test` to run the tests.

## Issues
If you discover a bug, please raise an issue on Github. https://github.com/lucasmotta/sass-module-importer/issues

## Contributors
The source code and the test are written in ES6 (ECMAScript 2015).  
[Babel](https://babeljs.io) is being used to compile to ES5 before the package is published to npm.
