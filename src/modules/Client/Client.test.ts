import { expectTypeOf } from 'expect-type';
import { Client } from './Client';
import { spawn, ChildProcess } from 'child_process';

describe('A Client', () => {
  let server: ChildProcess;

  beforeAll(() => {
    return new Promise<void>((resolve, reject) => {
      server = spawn('yarn test:server', {
        stdio: 'inherit',
        shell: true,
      });

      server.on('message', (message) => {
        if (message.toString().includes('listening')) {
          return resolve();
        }
      });

      server.on('error', reject);
    });
  });

  afterAll(() => {
    server.kill();
  });

  const base = 'https://example.com';
  const client = new Client(base);
});
