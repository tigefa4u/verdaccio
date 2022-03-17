---
id: webui
title: "Web User Interface"
---

![Uplinks](https://user-images.githubusercontent.com/558752/52916111-fa4ba980-32db-11e9-8a64-f4e06eb920b3.png)

Verdaccio has a web user interface to display only the private packages and can be customised to your liking.

```yaml
web:
  enable: true
  title: Verdaccio
  logo: http://somedomain/somelogo.png
  primary_color: "#4b5e40"
  gravatar: true | false
  scope: "@scope"
  sort_packages: asc | desc
  darkMode: false
  favicon: http://somedomain/favicon.ico | /path/favicon.ico
  rateLimit:
    windowMs: 50000
    max: 1000
  pkgManagers:
    - npm
    - yarn
    - pnpm
  login: true
  scriptsBodyAfter:
    - '<script type="text/javascript" src="https://my.company.com/customJS.min.js"></script>'
  metaScripts:
    - '<script type="text/javascript" src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>'
    - '<script type="text/javascript" src="https://browser.sentry-cdn.com/5.15.5/bundle.min.js"></script>'
    - '<meta name="robots" content="noindex" />'
  scriptsbodyBefore:
    - '<div id="myId">html before webpack scripts</div>'        
```

All access restrictions defined to [protect your packages](protect-your-dependencies.md) will also apply to the Web Interface.

> The `primary_color` and `scope` must be wrapped by quotes: eg: ('#000000' or "#000000")

The `primary_color` **must be a valid hex representation**.

### Internationalization {#internationalization}

_Since v4.5.0_, there are translations available.

```yaml
i18n:
  web: en-US
```

> ⚠️ Only the languages in this [list](https://github.com/verdaccio/ui/tree/master/i18n/translations) are available, feel free to contribute with more. The default
> one is en-US

### Configuration {#configuration}

| Property      | Type       | Required | Example                                                       | Support    | Description                                                                                                              |
| ------------- | ---------- | -------- | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| enable        | boolean    | No       | true/false                                                    | all        | allow to display the web interface                                                                                       |
| title         | string     | No       | Verdaccio                                                     | all        | HTML head title description                                                                                              |
| gravatar      | boolean    | No       | true                                                          | `>v4`      | Gravatars will be generated under the hood if this property is enabled                                                   |
| sort_packages | [asc,desc] | No       | asc                                                           | `>v4`      | By default private packages are sorted by ascending                                                                      |
| logo          | string     | No       | `/local/path/to/my/logo.png` `http://my.logo.domain/logo.png` | all        | a URI where logo is located (header logo)                                                                                |
| primary_color | string     | No       | "#4b5e40"                                                     | `>4`       | The primary color to use throughout the UI (header, etc)                                                                 |
| scope         | string     | No       | @myscope                                                      | `>v3.x`    | If you're using this registry for a specific module scope, specify that scope to set it in the webui instructions header |
| darkMode      | boolean    | No       | false                                                         | `>=v4.6.0` | This mode is an special theme for those want to live in the dark side                                                    |
| favicon       | string     | No       | false                                                         | `>=v5.0.1` | Display a custom favicon, can be local resource or valid url                                                             |
| rateLimit       | object     | No       | use `userRateLimit` configuration  | `>=v5.4.0` | Increase or decrease rate limit, by default is 5k request every 2 minutes, only limit web api endpoints, the CSS, JS, etcc are ingnored |
| pkgManagers       | npm, pnpm or yarn     | false       | npm                                                         | `>=v5.5.0` | Allow customise which package managers on the side bar and registry information dialog are visible |
| login       | boolean     | true       | true or false                                                         | `>=v5.5.0` | Allow disable login on the UI (also include web endpoints).          |
| scriptsBodyAfter | string[] | No | any list of strings | `>=5.0.0` | inject scripts after the <body/> tag |
| metaScripts | string[] | No | any list of strings | `>=5.0.0` | inject scripts inside <head/> |
| scriptsbodyBefore | string[] | No | any list of strings | `>=5.0.0` |  inject scripts before the <body/>|


> The recommended logo size is `40x40` pixels.

> The `darkMode` can be enabled via UI and is persisted in the browser local storage. Furthermore, also void `primary_color` and dark cannot be customized.