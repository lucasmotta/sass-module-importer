/*eslint no-unused-expressions: 0, no-var: 0 */
/*eslint-env node, mocha */


import {expect} from 'chai';
import sass from 'node-sass';
import moduleImporter from './src';


function getCSS(file) {

  return new Promise((resolve, reject) => {

    sass.render({
      file: `./fixtures/${file}`,
      outputStyle: 'compressed',
      importer: moduleImporter()
    }, (err, res) => err ? reject(err) : resolve(res.css.toString()));

  });

}


describe('sass-module-importer', () => {

  it('should import npm module', (done) => {

    getCSS('npm-module.scss').then((css) => {

      expect(css).to.exist
        .and.equal('body{transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1)}\n');

      done();

    });

  });


  it('should import bower module', (done) => {

    getCSS('bower-module.scss').then((css) => {

      expect(css).to.exist
        .and.equal('body{background-color:#e51c23}\n');

      done();

    });

  });


  it('should import a local file', (done) => {

    getCSS('local-file.scss').then((css) => {

      expect(css).to.exist.and.equal('body{content:"local"}\n');

      done();

    });

  });


  it('should import npm, bower and local file', (done) => {

    getCSS('all.scss').then((css) => {

      expect(css).to.exist.and.equal('body{content:"local"}body{transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1);background-color:#e51c23}\n');

      done();

    });

  });


  it('should throw error when importing inexistent module', (done) => {

    getCSS('no-module.scss').catch((err) => {

      expect(err).to.be.instanceof(Error);

      done();

    });

  });

});
