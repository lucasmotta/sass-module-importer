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

  resolveSass({ url, prev }) {
    const filePath = path.resolve(prev.replace(path.sep + path.basename(prev), ''), url);
    const extensions = ['.sass', '.scss', '.css'];
    const len = extensions.length;
    let i = 0;
    let ext = extensions[i];
    let filePathWithExt;

    return new Promise((resolve) => {
      function handler(err, stat) {
        ext = extensions[++i];

        if (err || !stat || !stat.isFile()) {
          if (i < len) {
            fs.stat(filePathWithExt = filePath + ext, handler);
          } else {
            resolve(false);
          }
        } else {
          resolve(filePathWithExt);
        }
      }

      fs.stat(filePathWithExt = filePath + ext, handler);
    });
  }

  filter(pkg) {
    if (!pkg.main) {
      pkg.main = pkg.style || pkg['main.scss'] || pkg['main.sass'] || 'index.css';
    }
    pkg.main = pkg.main.replace(/^\//, '');
    return pkg;
  }

  find(resolver, { url, prev, resolved }) {
    return new Promise((resolve) => {
      if (resolved) {
        resolve({ url, prev, resolved });
      } else
      if (/^(\.|\/)/.test(url)) {
        resolve({ url, prev, resolved: true });
      } else {
        this.resolveSass({ url, prev }).then((resolvedPath) => {
          if (resolvedPath) {
            resolve({ url, prev, resolved: true });
          } else {
            const moduleName = url.split(path.sep)[0];

            resolver(moduleName, this.options, (err, res) => {
              let result = res;

              if (!err && url !== moduleName) {
                result = url.replace(
                  moduleName,
                  result.replace(/(node_modules|bower_components)\/([^\/]*)(\/.*|)$/, '$1/$2')
                );
              }

              resolve({ url: (err ? url : result), prev, resolved: !err });
            });
          }
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
    importer.resolve({ url, prev }).then(done);
  };
}
