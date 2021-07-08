import { Environment } from './environment.interface';

export const environment: Environment = {
  name: 'e2e',
  production: false,
  master: false,
  local: true,
  serviceWorker: false,
  e2e: true,
  mergeRequest: false
};
