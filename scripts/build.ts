import { execSync } from 'child_process';

execSync('tsc --declaration', {
  stdio: 'inherit',
});
execSync('tsc --removeComments', {
  stdio: 'inherit',
});
