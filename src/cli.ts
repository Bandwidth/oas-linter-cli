import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .commandDir('commands')
  .alias({ h: 'help' })
  .alias({ v: 'version' })
  .alias({ s: 'save' })
  .strict()
  .argv;
