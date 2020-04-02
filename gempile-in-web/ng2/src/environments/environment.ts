// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  garnetUrl: 'http://localhost:8080/garnet-fileManager/',
  server_url: 'gempile-rs-gis/v1.4/',
  host: 'http://192.168.6.20:8585/',
  tileLayer: 'http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
};
