import 'dotenv/config';

class TestConfig {
  /**
   * Port that the test server will use.
   *
   * @default '8080'
   */
  public TEST_SERVER_PORT = process.env.TEST_SERVER_PORT || '8080';
  /**
   * Host of the test server.
   *
   * @default 'localhost'
   */
  public TEST_SERVER_HOST = process.env.TEST_SERVER_HOST || 'http://localhost';
  /**
   * Full url of the test server.
   */
  public get testServerUrl() {
    const url = new URL(this.TEST_SERVER_HOST);
    url.port = this.TEST_SERVER_PORT;
    return url.href;
  }
}

export const testConfig = new TestConfig();
