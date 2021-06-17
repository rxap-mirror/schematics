import { Environment } from './environment.interface';

export const environment: Environment = {
  name: 'merge-request',
  production: false,
  master: false,
  local: false,
  serviceWorker: false,
  e2e: false,
  mergeRequest: true
};
