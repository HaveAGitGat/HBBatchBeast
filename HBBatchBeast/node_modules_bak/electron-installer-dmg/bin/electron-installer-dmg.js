#!/usr/bin/env node

/* eslint no-console:0 no-sync:0 */
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');

const usage = fs.readFileSync(path.resolve(__dirname, '../usage.txt')).toString();
const args = minimist(process.argv.slice(2), {
  boolean: ['debug', 'overwrite'],
});

if (args.debug) {
  process.env.DEBUG = 'electron-installer-dmg';
}

const createDMG = require('../');
const pkg = require('../package.json');

const [appPath, name] = args._;

args.appPath = appPath;
args.name = name;

if (args.help || args.h || !args.appPath || !args.name) {
  console.error(usage);
  process.exit(1);
}
if (args.version) {
  console.error(pkg.version);
  process.exit(1);
}

createDMG(args, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }
  console.error(`Wrote DMG to:\n${args.dmgPath}`);
});
