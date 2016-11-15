import fs from 'fs';
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
    if (this.aliases.has(url)) {
      return Promise.resolve(this.aliases.get(url));
    }

    return Promise.resolve({ url, prev })
      .then(file => this.npm(file))
      .then(file => this.bower(file))
      .then(file => this.read(file))
      .then((res) => {
        this.aliases.set(url, res);
        return res;
      });
  }

  filter(pkg) {
    if (!pkg.main || (pkg.main && !pkg.main.match(/\.s?[c|a]ss$/g))) {
      pkg.main = pkg.style || pkg['main.scss'] || pkg['main.sass'] || 'index.css';
    }
    return pkg;
  }

  find(resolver, { url, prev, resolved }) {
    return new Promise((resolve) => {
      if (resolved) {
        resolve({ url, prev, resolved });
      } else {
        resolver(url, this.options, (err, res) => {
          resolve({ url: (err ? url : res), prev, resolved: !err });
        });
      }
    });
  }

  read({ url, prev, resolved }) {
    return new Promise((resolve, reject) => {
      if (url.match(/\.css$/g)) {
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
