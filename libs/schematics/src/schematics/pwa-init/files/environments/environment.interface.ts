export interface Environment {
  /**
   * The name of the environment
   */
  name: string;
  /**
   * The app is compiled from code in the production branch
   */
  production: boolean;
  /**
   * The app is compiled from code in the master branch
   */
  master: boolean;
  /**
   * Indicates that the application is compiled and startet in a
   * local development environment (ng serve)
   */
  local: boolean;
  /**
   * Where the service worker is active or not
   */
  serviceWorker: boolean;
  /**
   * The app is used for an e2e test
   */
  e2e: boolean;
  /**
   * The app is compiled from code in a merge request
   */
  mergeRequest: boolean;

  /**
   * The release name of the current build.
   *
   * Add on application startup
   */
  release?: string;

  /**
   * The commit hash of the current build.
   *
   * Add on application startup
   */
  commit?: string;

  /**
   * The build time of the current build.
   *
   * Add on application startup
   */
  timestamp?: number;

  /**
   * The git branch of the current build.
   *
   * Add on application startup
   */
  branch?: string;

  /**
   * The git tag of the current build.
   *
   * Add on application startup
   */
  tag?: string;

  [key: string]: any;
}
