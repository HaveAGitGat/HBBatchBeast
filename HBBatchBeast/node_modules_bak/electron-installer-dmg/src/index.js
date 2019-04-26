const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const debug = require('debug')('electron-installer-dmg');

function build(opts, done) {
  const appdmg = require('appdmg'); // eslint-disable-line

  const spec = Object.assign({}, opts.additionalDMGOptions || {}, {
    title: opts.title || opts.productName || opts.name,
    contents: opts.contents,
    icon: opts.icon,
    'icon-size': opts['icon-size'],
    background: opts.background,
    format: opts.format,
  });
  const specContents = JSON.stringify(spec, null, 2);

  debug('DMG spec is:\n', spec);

  const specPath = path.resolve(os.tmpdir(), 'appdmg.json');
  debug('writing config to `%s`', specPath);

  fs.writeFile(specPath, specContents, (specWriteErr) => {
    if (specWriteErr) return done(specWriteErr);
    debug('creating dmg...');
    appdmg({
      source: specPath,
      target: opts.dmgPath,
    }).on('progress', (info) => {
      if (info.type === 'step-begin') {
        debug('appdmg [%d/%d]: %s...', info.current, info.total, info.title);
      }
    }).on('finish', () => {
      debug('appdmg finished!');
      debug('cleaning up temp config at `%s`', specPath);
      fs.unlink(specPath, (unlinkErr) => {
        if (unlinkErr) return done(unlinkErr);
        done(null, opts);
      });
    }).on('error', (appdmgErr) => {
      done(appdmgErr);
    });
  });
}

module.exports = (immutableOpts, done) => {
  const opts = Object.assign({}, immutableOpts || {});

  if (process.platform !== 'darwin') {
    return done(new Error('Must be run on OSX'));
  }
  if (!opts.background) {
    opts.background = path.resolve(__dirname, '../resources/mac/background.png');
  } else {
    opts.background = path.resolve(opts.background);
  }
  if (!opts.icon) {
    opts.icon = path.resolve(__dirname, '../resources/mac/atom.icns');
  } else {
    opts.icon = path.resolve(opts.icon);
  }

  opts['icon-size'] = opts.iconSize || opts['icon-size'] || 80;
  opts.out = opts.out || process.cwd();

  if (!opts.appPath || typeof opts.appPath !== 'string') {
    return done(new Error('opts.appPath must be defined as a string'));
  }

  opts.appPath = path.resolve(process.cwd(), opts.appPath);

  if (opts.dmgPath && typeof opts.dmgPath !== 'string') {
    return done(new Error(`Expected opts.dmgPath to be a string but it was "${typeof opts.dmgPath}"`));
  }

  if (!opts.dmgPath && (!opts.out || typeof opts.out !== 'string')) {
    return done(new Error('Either opts.dmgPath or opts.out must be defined as a string'));
  }

  if (!opts.dmgPath && (!opts.name || typeof opts.name !== 'string')) {
    return done(new Error('opts.name must be defined as a string'));
  }

  opts.dmgPath = path.resolve(opts.dmgPath || path.join(opts.out, `${opts.name}.dmg`));

  fs.mkdirs(path.dirname(opts.dmgPath), (mkdirErr) => {
    if (mkdirErr) return done(mkdirErr);

    opts.overwrite = opts.overwrite || false;

    opts.format = opts.format || 'UDZO';

    opts.contents = opts.contents || [
      {
        x: 448,
        y: 344,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 192,
        y: 344,
        type: 'file',
        path: opts.appPath,
      },
    ];

    if (typeof opts.contents === 'function') {
      opts.contents = opts.contents(opts);
    }

    fs.exists(opts.dmgPath, (exists) => {
      if (exists && !opts.overwrite) {
        debug('DMG already exists at `%s` and overwrite is false', opts.dmgPath);
        const msg = `DMG already exists.  Run electron-installer-dmg again with \
\`--overwrite\` or remove the file and rerun. ${opts.dmgPath}`;
        return done(new Error(msg));
      }

      if (exists && opts.overwrite) {
        debug('DMG already exists at `%s`.  Removing...', opts.dmgPath);
        fs.unlink(opts.dmgPath, (unlinkErr) => {
          if (unlinkErr) return done(unlinkErr);
          build(opts, done);
        });
      } else {
        build(opts, done);
      }
    });
  });
};

module.exports.p = opts => new Promise((resolve, reject) => {
  module.exports(opts, (err, result) => {
    if (err) return reject(err);
    resolve(result);
  });
});
