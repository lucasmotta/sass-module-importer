[![Build Status](https://travis-ci.org/lucasmotta/sass-module-importer.svg?branch=master)](https://travis-ci.org/lucasmotta/sass-module-importer)

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

Assuming that the external library you are installing fits under one of those categories:

1. Set a SCSS/Sass/CSS file on the "main" field of their package.json/bower.json
2. Set a SCSS/Sass/CSS file on the "style" field of their package.json/bower.json
3. Have a `index.css` file on the root of their module

This tool it will also inline CSS files for you, since Sass [cannot import plain CSS files yet](https://github.com/sass/sass/issues/556). So if the dependency you are using exports a CSS file, it will work too.


## How-to

### install

```sh
npm install sass-module-importer --save-dev
```

### use the importer with [node-sass](https://github.com/sass/node-sass) `>= v3.0.0`

```js
import sass from 'node-sass';
import moduleImporter from 'sass-module-importer';

sass.render({
  file: './source/css/app.scss',
  importer: moduleImporter()
}, cb);
```

### use the importer with [gulp-sass](https://github.com/dlmanning/gulp-sass)

```js
import gulp from 'gulp';
import sass from 'gulp-sass';
import moduleImporter from 'sass-module-importer';

gulp.task('style', () => {
  return gulp.src('./source/css/app.scss')
    .pipe(sass({ importer: moduleImporter() }))
    .pipe(gulp.dest('./public/css'));
});
```

### import partials

If you need to import partials from your external module, just use the path for the partial you want to import. To import the following file:
```
node_modules/module-name/folder/to/_file.scss
```

Import like this anywhere:

```scss
@import "module-name/folder/to/_file.scss"
```

## Options
You can pass any option supported by [node-resolve](https://github.com/substack/node-resolve#resolveid-opts-cb) directly, like this:
```js
moduleImporter({ basedir: path.join(__dirname, 'another-folder') });
```

## Tests
Use `npm test` to run the tests.

## Issues
If you discover a bug, please raise an issue on Github. https://github.com/lucasmotta/sass-module-importer/issues

## Contributors
The source code and the test are written in ES6 (ECMAScript 2015).  
[Buble](https://gitlab.com/Rich-Harris/buble) is being used to compile to ES5 before the package is published to npm.
