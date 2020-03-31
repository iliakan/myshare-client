#!/usr/bin/env node

let request = require('request-promise');
let fs = require('fs');
let path = require('path');
let chalk = require('chalk');
const clipboardy = require('clipboardy');
const minimist = require('minimist');

let configPaths = ['/etc/myshare', require('os').homedir() + '/.myshare'];
const configPath = configPaths.find(p => fs.existsSync(p));

if (!configPath) {
  throw new Error('Config not found');
}

const config = require(configPath);

if (!config.server) {
  throw new Error("No server in config");
}


if (!config.secret) {
  throw new Error('No secret in config');
}

async function run() {

  let args = minimist(process.argv.slice(2), { boolean: true});

  // console.log(args)
  let filePath = args._[0];


  if (!filePath) {
    console.error(chalk.red("Usage: share [--update] <filepath>"));
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(chalk.red('No such file: ' + filePath));
    process.exit(1);
  }

  console.log('Sharing ' + filePath);

  let url = new URL('/share', config.server);

  let formData = {
    update: 'update' in args ? 1 : 0,
    secret: config.secret,
    file: {
      value: fs.createReadStream(filePath),
      options: {
        filename: path.basename(filePath)
      }
    }
  };

  // console.log(formData);
  let link = await request({
    method: 'POST',
    url: url,
    formData
  });

  clipboardy.writeSync(link);
  console.log(link);
}

run();

