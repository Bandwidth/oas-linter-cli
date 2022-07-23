import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .commandDir('commands')
  .alias({ l: 'lint <specPath>' })
  .alias({ s: 'save' })
  .alias({ h: 'help' })
  .alias({ v: 'version' })
  .strict()
  .argv;
