import fs from 'fs';
import glob from 'glob';
import path from 'path';
import Map from 'es6-map';
import assign from 'object-assign';
import npmResolve from 'resolve';
import bowerResolve from 'resolve-bower';

class ModuleImporter {
  constructor(opts) {
    this.aliases = new Map();
    this.options = assign({}, { packageFilter: this.filter }, opts);
  }

  resolve({ url, prev }) {
    const fullPath = prev === 'stdin' ? url : path.resolve(path.dirname(prev), url);
    const extname = path.extname(fullPath);

    if (extname === '.js') {
      return Promise.resolve({ contents: '' });
    }

    if (this.aliases.has(fullPath)) {
      return Promise.resolve(this.aliases.get(fullPath));
    }

    const dirName = path.dirname(fullPath);
    const fileName = `?(_)${path.basename(fullPath)}.+(scss|sass|css)`;
    const matches = glob.sync(path.join(dirName, fileName));

    if (matches.length > 0) {
      return Promise.resolve({ file: fullPath });
    }

    return Promise.resolve({ url, prev })
      .then(file => this.npm(file))
      .then(file => this.bower(file))
      .then(file => this.read(file))
      .then((res) => {
        if (res) {
          this.aliases.set(fullPath, res);
        }
        return res;
      });
  }

  filter(pkg) {
    const regex = /\.s?[c|a]ss$/;
    if (!pkg.main ||
       (typeof pkg.main !== 'string') ||
       (pkg.main && !pkg.main.match(regex))) {
      if (typeof pkg.main === 'object') {
        pkg.main = pkg.main.find(elem => elem.match(regex));
      } else {
        pkg.main = pkg.style || pkg.sass || pkg['main.scss'] || pkg['main.sass'] || 'index.css';
      }
    }
    return pkg;
  }

  find(resolver, { url, prev, resolved }) {
    return new Promise((resolve) => {
      if (resolved) {
        resolve({ url, prev, resolved });
      } else {
        const options = Object.assign({}, this.options, {
          basedir: prev && prev !== 'stdin' ? path.dirname(prev) : process.cwd(),
        });
        resolver(url, options, (err, res) => {
          resolve({ url: (err ? url : res), prev, resolved: !err });
        });
      }
    });
  }

  read({ url, prev, resolved }) {
    return new Promise((resolve, reject) => {
      if (!resolved) {
        resolve();
      } else {
        if (url.match(/\.css$/)) {
          fs.readFile(url, 'utf8', (err, contents) => {
            if (err) {
              reject(err);
            } else {
              resolve({ contents });
            }
          });
        } else {
          let resolvedURL = url;
          if (!resolved && prev && prev !== 'stdin' && !path.isAbsolute(url)) {
            resolvedURL = path.resolve(path.dirname(prev), url);
          }
          resolve({ file: resolvedURL });
        }
      }
    });
  }

  npm(file) {
    return this.find(npmResolve, file);
  }

  bower(file) {
    return this.find(bowerResolve, file);
  }
}


/**
 * Look for Sass files installed through npm
 * @param opts {Object}       Options to be passed to the resolver module
 *
 * @return {Function}         Function to be used by node-sass importer
 */
export default function (opts) {
  const importer = new ModuleImporter(opts);

  return (url, prev, done) => {
    importer.resolve({ url, prev })
      .then(done)
      .catch(err => setImmediate(() => { throw err; }));
  };
}
