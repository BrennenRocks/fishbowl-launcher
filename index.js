const { join } = require('path');
const { readFileSync, writeFileSync } = require('fs');
const { exec } = require('child_process');
const { EOL } = require('os');

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const editEveProperties = (path, dbname) => {
  if (path == undefined) {
    return;
  }

  let data = readFileSync(path, 'utf-8');
  if (data.includes('dbName=')) {
    data = data.replace(/dbName=(\w+)/, `dbName=${dbname}`);
  } else {
    data += `${EOL}dbName=${dbname}`;
  }

  writeFileSync(path, data, 'utf-8');
}

require('yargs')
  .scriptName('index.js')
  .check(argv => {
    if (argv.specific == undefined) {
      throw (new Error('The \'specific\' argument is required'));
    }

    return true;
  })
  .command('$0 [specific] [dbname]', 'launch client and server for the specified dbname', (yargs) => {
    yargs.positional('specific', {
      type: 'string',
      describe: 'file path to the fishbowl install'
    }).positional('dbname', {
      type: 'string',
      describe: 'database name'
    })
  }, async (argv) => {
    if (argv.dbname) {
      editEveProperties(join(argv.specific, 'server', 'bin', 'eve.properties'), argv.dbname);
    }

    const serverPath = join(argv.specific, 'server', 'bin', 'debug-eve.bat');
    const clientPath = join(argv.specific, 'client', 'bin', 'debug-client.bat');
    exec('start ' + serverPath, { cwd: join(argv.specific, 'server', 'bin') });

    await sleep(7000);

    exec('start ' + clientPath, { cwd: join(argv.specific, 'client', 'bin') });
  })
  .command('client [specific]', 'launch the client', (yargs) => {
    yargs.positional('specific', {
      type: 'string',
      describe: 'file path to the fishbowl install'
    })
  }, (argv) => {
    const clientPath = join(argv.specific, 'client', 'bin', 'debug-client.bat');
    exec('start ' + clientPath, { cwd: join(argv.specific, 'client', 'bin') });
  })
  .command('server [specific]', 'launch the server using the database already in eve.properties', (yargs) => {
    yargs.positional('specific', {
      type: 'string',
      describe: 'file path to the fishbowl install'
    })
  }, (argv) => {
    const serverPath = join(argv.specific, 'server', 'bin', 'debug-eve.bat');
    exec('start ' + serverPath, { cwd: join(argv.specific, 'server', 'bin') });
  })
  .command('checkout [specific]', 'launch Checkout', (yargs) => {
    yargs.positional('specific', {
      type: 'string',
      describe: 'file path to the fishbowl install'
    })
  }, (argv) => {
    const checkoutPath = join(argv.specific, 'client', 'bin', 'Checkout.bat');
    exec('start ' + checkoutPath, { cwd: join(argv.specific, 'client', 'bin') });
  })
  .help()
  .argv