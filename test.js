/* eslint max-len: 0 */
const expect = require('chai').expect;
const path = require('path');
const sass = require('node-sass');
const moduleImporter = require('./lib');


function getCSS(file, data) {
  return new Promise((resolve, reject) => {
    sass.render({
      data,
      file: file ? `./fixtures/${file}` : null,
      outputStyle: 'compressed',
      importer: moduleImporter({
        basedir: path.join(__dirname, 'fixtures'),
      }),
    }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.css.toString());
      }
    });
  });
}


describe('sass-module-importer', () => {
  it('should import a local file', (done) => {
    getCSS(null, '@import "fixtures/dummy";').then((css) => {
      const expected = 'body{content:"local"}\n';
      expect(css).to.exist.and.equal(expected);
      done();
    });
  });

  it('should import nested files and dependencies', (done) => {
    getCSS(null, '@import "test-npm-nested";').then((css) => {
      const expected = `*,*:after,*:before{box-sizing:border-box}html,body{margin:0;padding:0}.test{content:"SCSS from 'npm' and from 'style' field."}.child{content:'I am being imported by another file'}.test{content:"SCSS from 'npm' and from 'main' field."}\n`;
      expect(css).to.exist.and.equal(expected);
      done();
    });
  });

  it('should fail to import non-existing module', (done) => {
    getCSS(null, '@import "unicorn";').catch((err) => {
      const expected = {
        message: 'File to import not found or unreadable: unicorn\nParent style sheet: stdin',
      };
      expect(err.message).to.exist.and.equal(expected.message);
      done();
    });
  });

  describe('npm', () => {
    it('should import contents of CSS from npm module using the "main" field', (done) => {
      getCSS(null, '@import "test-npm-main-css";').then((css) => {
        const expected = `.test{content:"CSS from 'npm' and from 'main' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import SCSS from npm module using the "main" field', (done) => {
      getCSS(null, '@import "test-npm-main-scss";').then((css) => {
        const expected = `.test{content:"SCSS from 'npm' and from 'main' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import contents of CSS from npm module using the "style" field', (done) => {
      getCSS(null, '@import "test-npm-style-css";').then((css) => {
        const expected = `.test{content:"CSS from 'npm' and from 'style' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import SCSS from npm module using the "style" field', (done) => {
      getCSS(null, '@import "test-npm-style-scss";').then((css) => {
        const expected = `.test{content:"SCSS from 'npm' and from 'style' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import "index.css" if the "main" and "style" are undefined', (done) => {
      getCSS(null, '@import "test-npm-index-css";').then((css) => {
        const expected = `.test{content:"CSS from 'npm' as index.css fallback."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import subfile from module', (done) => {
      getCSS(null, '@import "test-npm-subpath/assets/styles";').then((css) => {
        const expected = `.test{content:"Now you can load assets from modules"}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });
  });

  describe('bower', () => {
    it('should import contents of CSS from bower module using the "main" field', (done) => {
      getCSS(null, '@import "test-bower-main-css";').then((css) => {
        const expected = `.test{content:"CSS from 'bower' and from 'main' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import SCSS from bower module using the "main" field', (done) => {
      getCSS(null, '@import "test-bower-main-scss";').then((css) => {
        const expected = `.test{content:"SCSS from 'bower' and from 'main' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import contents of CSS from bower module using the "style" field', (done) => {
      getCSS(null, '@import "test-bower-style-css";').then((css) => {
        const expected = `.test{content:"CSS from 'bower' and from 'style' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import SCSS from bower module using the "style" field', (done) => {
      getCSS(null, '@import "test-bower-style-scss";').then((css) => {
        const expected = `.test{content:"SCSS from 'bower' and from 'style' field."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import "index.css" if the "main" and "style" are undefined', (done) => {
      getCSS(null, '@import "test-bower-index-css";').then((css) => {
        const expected = `.test{content:"CSS from 'bower' as index.css fallback."}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });

    it('should import subfile from module', (done) => {
      getCSS(null, '@import "test-bower-subpath/assets/styles";').then((css) => {
        const expected = `.test{content:"Now you can load assets from modules"}\n`;
        expect(css).to.exist.and.equal(expected);
        done();
      });
    });
  });
});
