import Vue from 'vue';
import App from '@/views/App.vue';

/* eslint-disable global-require */
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

// app.js
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import { Icon } from 'leaflet';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import '../node_modules/leaflet/dist/leaflet.css';

import './main.css';

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);

type D = Icon.Default & {
  _getIconUrl: string;
};

// eslint-disable-next-line no-underscore-dangle
delete (Icon.Default.prototype as D)._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


new Vue({
  render: (h) => h(App),
}).$mount('#app');
