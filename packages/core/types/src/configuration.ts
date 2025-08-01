import { Algorithm as Algorithms, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { AgentOptions as HttpAgentOptions } from 'node:http';
import { AgentOptions as HttpsAgentOptions } from 'node:https';

import { PackageAccess, PackageList } from '@verdaccio/types/src/manifest';

export type TypeToken = 'Bearer' | 'Basic';

export interface Logger {
  child: (conf: any) => any;
  debug: (conf: any, template?: string) => void;
  error: (conf: any, template?: string) => void;
  http: (conf: any, template?: string) => void;
  trace: (conf: any, template?: string) => void;
  warn: (conf: any, template?: string) => void;
  info: (conf: any, template?: string) => void;
}

export type LoggerType = 'stdout' | 'file';
export type LoggerFormat = 'pretty' | 'pretty-timestamped' | 'json';
export type LoggerLevel = 'fatal' | 'error' | 'warn' | 'info' | 'http' | 'debug' | 'trace';

export type LoggerRedact = {
  paths: string[];
  censor?: string;
  remove?: boolean;
};

export type LoggerConfigItem = {
  type?: LoggerType;
  format?: LoggerFormat;
  path?: string;
  level?: LoggerLevel;
  colors?: boolean;
  sync?: boolean;
  redact?: LoggerRedact;
};

export interface ConfigWithHttps extends Config {
  https: HttpsConf;
}

export interface PackageAccessYaml {
  storage?: string;
  publish?: string;
  proxy?: string;
  access?: string;
  unpublish?: string;
}

export interface Headers {
  [key: string]: string;
}

export type AgentOptionsConf = HttpAgentOptions | HttpsAgentOptions;

export interface UpLinkTokenConf {
  type: TypeToken;
  token?: string;
  token_env?: boolean | string;
}

export interface UpLinkConf {
  url: string;
  ca?: string;
  cache?: boolean;
  timeout?: string | void;
  maxage?: string | void;
  max_fails?: number | void;
  fail_timeout?: string | void;
  headers?: Headers;
  auth?: UpLinkTokenConf;
  strict_ssl?: boolean | void;
  agent_options?: AgentOptionsConf;
  _autogenerated?: boolean;
}

export type RateLimit = {
  windowMs?: number;
  max?: number;
};

export type FlagsConfig = {
  searchRemote?: boolean;
  changePassword?: boolean;
  webLogin?: boolean;
};

export type PackageManagers = 'pnpm' | 'yarn' | 'npm' | string;

// FUTURE: WebConf and TemplateUIOptions should be merged .
export type CommonWebConf = {
  title?: string;
  logo?: string;
  logoDark?: string;
  favicon?: string;
  gravatar?: boolean;
  sort_packages?: string;
  darkMode?: boolean;
  url_prefix?: string;
  language?: string;
  login?: boolean;
  scope?: string;
  pkgManagers?: PackageManagers[];
  showInfo?: boolean;
  showSettings?: boolean;
  showSearch?: boolean;
  showFooter?: boolean;
  showThemeSwitch?: boolean;
  showDownloadTarball?: boolean;
  showUplinks?: boolean;
  hideDeprecatedVersions?: boolean;
  primaryColor?: string;
  showRaw?: boolean;
};

/**
 * Options are passed to the index.html
 */
export type TemplateUIOptions = {
  uri?: string;
  protocol?: string;
  host?: string;
  // @deprecated use base instead
  basename?: string;
  base: string;
  version?: string;
  flags?: FlagsConfig;
} & CommonWebConf;

/**
 * Options on config.yaml for web
 */
export type WebConf = {
  // @deprecated use primaryColor
  primary_color?: string;
  primaryColor?: string;
  // @deprecated use enabled
  enable?: boolean;
  enabled?: boolean;
  scriptsHead?: string[];
  scriptsBodyAfter?: string[];
  // @deprecated use scriptsBodyBefore
  scriptsbodyBefore?: string[];
  scriptsBodyBefore?: string[];
  metaScripts?: string[];
  bodyBefore?: string[];
  bodyAfter?: string[];
  rateLimit?: RateLimit;
  html_cache?: boolean;
} & CommonWebConf;

export interface UpLinksConfList {
  [key: string]: UpLinkConf;
}

export interface AuthHtpasswd {
  file: string;
  max_users: number;
}

export type AuthConf = any | AuthHtpasswd;

export interface JWTOptions {
  sign: JWTSignOptions;
  verify: JWTVerifyOptions;
}

export type Algorithm = Algorithms;

export interface JWTSignOptions extends SignOptions {}
export interface JWTVerifyOptions extends VerifyOptions {}

export interface APITokenOptions {
  legacy: boolean;
  /**
   * Temporary flag to allow migration to the new legacy signature
   */
  migrateToSecureLegacySignature: boolean;
  jwt?: JWTOptions;
}

export interface Security {
  web: JWTOptions;
  api: APITokenOptions;
}

export type ReadmeOptions = 'latest' | 'tagged' | 'all';

export interface PublishOptions {
  allow_offline: boolean;
  keep_readmes?: ReadmeOptions;
  check_owners: boolean;
}

export interface ListenAddress {
  [key: string]: string;
}

export interface HttpsConfKeyCert {
  key: string;
  cert: string;
  ca?: string;
}

export interface HttpsConfPfx {
  pfx: string;
  passphrase?: string;
}

export type HttpsConf = HttpsConfKeyCert | HttpsConfPfx;

export interface Notifications {
  method: string;
  packagePattern: RegExp;
  packagePatternFlags: string;
  endpoint: string;
  content: string;
  headers: Headers;
}

export type Notification = Notifications;

export type ServerSettingsConf = {
  // express-rate-limit settings
  rateLimit: RateLimit;
  keepAliveTimeout?: number;
  /**
   * Plugins should be prefixed verdaccio-XXXXXX by default.
   * To override the default prefix, use this property without `-`
   * If you set pluginPrefix: acme, the packages to resolve will be
   * acme-XXXXXX
   */
  pluginPrefix?: string;
  passwordValidationRegex?: RegExp;
  // docs on `trustProxy` can be found at: https://expressjs.com/en/guide/behind-proxies.html
  trustProxy?: string;
};

/**
 * YAML configuration file available options.
 */
export interface ConfigYaml {
  _debug?: boolean;
  storage?: string | void;
  packages: PackageList;
  uplinks: UpLinksConfList;
  log?: LoggerConfigItem;
  // @deprecated deprecation path from 5.x
  logs?: LoggerConfigItem;
  web?: WebConf;
  auth?: AuthConf;
  security: Security;
  publish?: PublishOptions;
  store?: any;
  listen?: ListenAddress;
  https?: HttpsConf;
  user_agent?: string;
  http_proxy?: string;
  plugins?: string | void | null;
  https_proxy?: string;
  no_proxy?: string;
  max_body_size?: string;
  notifications?: Notifications;
  notify?: Notifications | Notifications[];
  middlewares?: any;
  filters?: any;
  url_prefix?: string;
  server?: ServerSettingsConf;
  flags?: FlagsConfig;
  // @deprecated use flags instead
  experiments?: FlagsConfig;
  userRateLimit?: RateLimit;
  // internal objects, added by internal yaml to JS config parser
  // save the configuration file path
  configPath?: string;
  i18n?: { web: string };
}

/**
 * Configuration object with additional methods for configuration, includes yaml and internal medatada.
 * @interface Config
 * @extends {ConfigYaml}
 */
export interface Config extends Omit<ConfigYaml, 'packages' | 'security' | 'configPath'> {
  server_id: string;
  secret: string;
  // save the configuration file path, it's fails without thi configPath
  configPath: string;
  // @deprecated use configPath
  self_path?: string;
  // packages from yaml file looks different from packages inside the config file
  packages: PackageList;
  // security object defaults is added by the config file but optional in the yaml file
  security: Security;
  // @deprecated (pending adding the replacement)
  checkSecretKey(token: string | void): string;
  // @deprecated use core.authUtils instead
  getMatchedPackagesSpec(storage: string): PackageAccess | void;
  // TODO: verify how to handle this in the future
  [key: string]: any;
}

export interface AllowAccess {
  name: string;
  version?: string;
  tag?: string;
}

// info passed to the auth plugin when a package is package is being published

export interface AuthPackageAllow extends PackageAccess, AllowAccess {}
