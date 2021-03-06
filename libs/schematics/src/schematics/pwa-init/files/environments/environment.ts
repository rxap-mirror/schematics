import { Environment } from './environment.interface';
import 'zone.js/dist/zone-error';

export const environment: Environment = {
  name: 'local',
  production: false,
  master: false,
  local: true,
  serviceWorker: false,
  e2e: false,
  mergeRequest: false
};
