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

  resolve({ url, prev }, options) {
    if (this.aliases.has(url)) {
      return Promise.resolve(this.aliases.get(url));
    }

    return Promise.resolve({ url, prev })
      .then(file => this.npm(file))
      .then(file => this.bower(file))
      .then(file => this.read(file, options))
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

  read({ url, prev, resolved }, options = {}) {
    return new Promise((resolve, reject) => {
      if (path.extname(url) === 'css') {
        fs.readFile(url, 'utf8', (err, contents) => {
          if (err) {
            reject(err);
          } else {
            resolve({ contents });
          }
        });
      } else {
        if (resolved || path.isAbsolute(url)) {
          resolve({ file: url });
        } else {
          const sassNames = this.getSassNames(url);
          const cwd = process.cwd();

          let dirname = path.dirname(url);
          dirname += dirname ? '/' : '';

          let includePaths = (prev && prev !== 'stdin' ? [path.dirname(prev)] : []);
          includePaths = includePaths.concat(options.includePaths || []);

          const checkNextPath = (err) => {
            const currentPath = includePaths.shift();
            if (!currentPath) {
              reject(err || new Error(`Could not find ${url}`));
            } else {
              sassNames.reduce((chain, name) => {
                const fileExists = new Promise(resolveName => {
                  const resolvedUrl = path.resolve(cwd, currentPath, dirname + name);
                  fs.stat(resolvedUrl, errName => {
                    if (errName) {
                      resolveName(errName);
                    } else {
                      resolveName(resolvedUrl);
                    }
                  });
                });

                return chain.then(resolvedUrl =>
                  (resolvedUrl instanceof Error ? fileExists : resolvedUrl)
                );
              }, Promise.resolve())
                .then(resolvedUrl => {
                  if (resolvedUrl instanceof Error) {
                    checkNextPath(resolvedUrl);
                  } else {
                    resolve(resolvedUrl);
                  }
                });
            }
          };

          checkNextPath();
        }
      }
    });
  }

  getSassNames(url) {
    const basename = path.basename(url);
    if (path.extname(url) !== '') {
      return [basename];
    }
    return [
      `${basename}.scss`,
      `${basename}.sass`,
      `_${basename}.scss`,
      `_${basename}.sass`,
    ];
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

  return function doImport(url, prev, done) {
    const { includePaths } = this.options;
    importer.resolve({ url, prev }, { includePaths }).then(done);
  };
}
