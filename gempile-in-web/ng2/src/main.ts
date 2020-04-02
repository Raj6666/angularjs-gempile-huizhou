import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

function LoadScript(url) {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  if (script['readyState']) {
    script['onreadystatechange'] = function () {
      if (script['readyState'] === 'loaded' || script['readyState'] === 'complete') {
        script['onreadystatechange'] = null;
      }
    };
  }
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

// (function(window) {
//   if (environment.production) {//生产环境
//     LoadScript('http://188.5.6.144:8090/map/1.3.1/plugins/proj4.js');
//     LoadScript('http://188.5.6.144:8090/map/1.3.1/plugins/proj4leaflet.js');
//     LoadScript('http://188.5.6.144:8090/map/1.3.1/leaflet.js');
//   } else {//本地环境
//     LoadScript('./assets/leafletLocalMap/leaflet.js');
//     LoadScript('./assets/leafletLocalMap/plugins/proj4.js');
//     setTimeout( LoadScript('./assets/leafletLocalMap/plugins/proj4leaflet.js'), 500);
//
//     // LoadScript('./assets/leafletLocalMap/plugins/proj4leaflet.js');
//     // LoadScript('./assets/leafletLocalMap/plugins/leaflet-heat.js');
//   }
// })(window);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

