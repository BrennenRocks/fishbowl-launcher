const { join } = require('path');
const { readFileSync, writeFileSync } = require('fs');
const { exec } = require('child_process');
const { EOL } = require('os');

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const editEveProperties = async (path, country, dbname) => {
  let data = readFileSync(path, 'utf-8');
  if (data.includes('country=')) {
    data = data.replace(/country=(\w+)/, `country=${country}`);
  } else {
    data += `${EOL}country=${country}`;
  }

  if (data.includes('dbName=')) {
    data = data.replace(/dbName=(\w+)/, `dbName=${dbname}`);
  } else {
    data += `${EOL}dbName=${dbname}`;
  }
  
  writeFileSync(path, data, 'utf-8');
}

require('yargs')
    .scriptName('index.js')
    .usage('$0 [args]')
    .command('$0 [specific] [country] [dbname]', '', (yargs) => {
      yargs.positional('specific', {
        type: 'string',
        describe: 'file path to the fishbowl install'
      }).positional('country', {
        type: 'string',
        default: 'US',
        describe: 'country version: AU, CA, or US'
      }).positional('dbname', {
        type: 'string',
        default: 'demous',
        describe: 'database name'
      })
    }, async (argv) => {
      editEveProperties(join(argv.specific, 'server', 'bin', 'eve.properties'), argv.country, argv.dbname);

      const serverPath = join(argv.specific, 'server', 'bin', 'debug-eve.bat');
      const clientPath = join(argv.specific, 'client', 'bin', 'debug-client.bat');
      exec('start ' + serverPath, {cwd: join(argv.specific, 'server', 'bin')});

      await sleep(6000);

      exec('start ' + clientPath, {cwd: join(argv.specific, 'client', 'bin')});
    })
    .command('client [specific]', 'launch the client', (yargs) => {
      yargs.positional('specific', {
        type: 'string',
        describe: 'file path to the fishbowl install'
      })
    }, (argv) => {
      const clientPath = join(argv.specific, 'client', 'bin', 'debug-client.bat');
      exec('start ' + clientPath, {cwd: join(argv.specific, 'client', 'bin')});
    })
    .command('server [specific]', 'launch the server using the country already in eve.properties', (yargs) => {
      yargs.positional('specific', {
        type: 'string',
        describe: 'file path to the fishbowl install'
      })
    }, (argv) => {
      const serverPath = join(argv.specific, 'server', 'bin', 'debug-eve.bat');
      exec('start ' + serverPath, {cwd: join(argv.specific, 'server', 'bin')});
    })
    .help()
    .argv