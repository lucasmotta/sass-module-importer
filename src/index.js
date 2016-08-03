import fs from 'fs';
import Map from 'es6-map';
import assign from 'object-assign';
import npmResolve from 'resolve';
import bowerResolve from 'resolve-bower';

class ModuleImporter {
  constructor(opts) {
    this.aliases = new Map();
    this.options = assign({}, { packageFilter: this.filter }, opts);
  }

  resolve({ url }) {
    if (this.aliases.has(url)) {
      return Promise.resolve(this.aliases.get(url));
    }

    return Promise.resolve({ url })
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

  find(resolver, { url, resolved }) {
    return new Promise((resolve) => {
      if (resolved) {
        resolve({ url, resolved });
      } else {
        resolver(url, this.options, (err, res) => {
          resolve({ url: (err ? url : res), resolved: !err });
        });
      }
    });
  }

  read({ url, resolved }) {
    if (!resolved) {
      return null;
    }

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
        resolve({ file: url });
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
    importer.resolve({ url }).then(done);
  };
}
