// This is a simple singleton wrapper to allow us to import the latest environment from various places
import worker from './worker';

class EnvironmentHandler {
  constructor() {
    this.env = {};
  }

  getEnv() {
    return this.env;
  }

  async handleRequest(request, env, ctx) {
    this.env = env;
    return worker(request);
  }
}

const handler = new EnvironmentHandler();

export default handler;
