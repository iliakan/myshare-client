#!/usr/bin/env node

let request = require('request-promise');
let fs = require('fs');
let path = require('path');

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

  let filePath = process.argv[2];

  if (!fs.existsSync(filePath)) {
    throw new Error("No such file: " + filePath);
  }

  console.log('Sharing ' + filePath);

  console.log(config)
  let url = new URL('/share', config.server);
  url.searchParams.set('secret', config.secret);

  let link = await request({
    method: 'POST',
    url: url,
    formData: {
      name: 'file',
      file: {
        value: fs.createReadStream(filePath),
        options: {
          filename: path.basename(filePath)
        }
      }
    }
  });

  console.log(link);
}

run();

