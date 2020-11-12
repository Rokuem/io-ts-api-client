import { spawn, ChildProcess } from 'child_process';
import NodeEnvironment from 'jest-environment-node';

class MyCustomEnvironment extends NodeEnvironment {
  server!: ChildProcess;

  setup() {
    return new Promise<void>((resolve, reject) => {
      this.server = spawn('yarn test:server', {
        stdio: 'inherit',
        shell: true,
      });

      this.server.on('message', (message) => {
        if (message.toString().includes('listening')) {
          return resolve();
        }
      });

      this.server.on('error', reject);
    });
  }

  async teardown() {
    this.server.kill();
  }
}
