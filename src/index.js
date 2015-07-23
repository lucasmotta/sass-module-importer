import Map from 'es6-map';
import npmResolve from 'resolve';
import bowerResolve from 'resolve-bower';

function find(resolver, file) {

  return new Promise((resolve) => {

    resolver(file, (err, res) => resolve(err ? file : res));

  });

}

find.npm = function(file) {

  return find(npmResolve, file);

};

find.bower = function(file) {

  return find(bowerResolve, file);

};

/**
 * Look for Sass files installed through npm
 * @return {Function}         Function to be used by node-sass importer
 */
export default function() {

  const aliases = new Map();

  return function(url, _, done) {

    if (aliases.has(url)) {

      return done({ file: aliases.get(url) });

    }

    find.npm(url).then(find.bower).then((file) => {

      aliases.set(url, file);
      done({ file });

    });

  };

}
