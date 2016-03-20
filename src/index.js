import fs from 'fs';
import path from 'path';
import Map from 'es6-map';
import assign from 'object-assign';
import npmResolve from 'resolve';
import bowerResolve from 'resolve-bower';

let options;

/**
 * Check for the "main" field to see if it contains any css/scss/sass
 * If not, try to use the "style" field from package.json - and if that fails
 * too, defaults to "index.css"
 */
const filter = (pkg) => {
  if (!pkg.main || (pkg.main && !pkg.main.match(/\.s?[c|a]ss$/g))) {
    pkg.main = pkg.style || pkg['main.scss'] || pkg['main.sass'] || 'index.css';
  }
  return pkg;
};

/**
 * Simple Promise wrapper to resolve the npm/bower modules
 */
const find = (resolver, { url, prev, resolved }) => new Promise((resolve) => {
  if (resolved) {
    resolve({ url, prev, resolved });
  } else {
    resolver(url, options, (err, res) => {
      resolve({ url: (err ? url : res), prev, resolved: !err });
    });
  }
});

const npm = (file) => find(npmResolve, file);

const bower = (file) => find(bowerResolve, file);

/**
 * Read file's content
 */
const read = ({ url, prev, resolved }) => new Promise((resolve, reject) => {
  if (url.match(/\.css$/g)) {
    fs.readFile(url, 'utf8', (err, contents) => err ? reject(err) : resolve({ contents }));
  } else {
    let resolvedURL = url;
    if (!resolved && prev && prev !== 'stdin' && !path.isAbsolute(url)) {
      resolvedURL = path.resolve(path.dirname(prev), url);
    }
    resolve({ file: resolvedURL });
  }
});

/**
 * Look for Sass files installed through npm
 * @param opts {Object}       Options to be passed to the resolver module
 *
 * @return {Function}         Function to be used by node-sass importer
 */
export default function (opts) {
  options = assign({}, { packageFilter: filter }, opts);

  const aliases = new Map();

  return (url, prev, done) => {
    if (aliases.has(url)) {
      done(aliases.get(url));
    } else {
      npm({ url, prev }).then(bower).then(read).then((res) => {
        aliases.set(url, res);
        done(res);
      });
    }
  };
}
