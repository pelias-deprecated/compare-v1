/* eslint-disable @typescript-eslint/no-explicit-any */
<style>
.form-group {
  display: flex;
}
label {
  padding-right: 20px;
  width: 200px;
  flex-shrink: 0;
}
.tag-editor {
  flex-grow: 1;
}
</style>
<template>
  <b-container fluid>
    <b-row>
      <b-form v-on:submit.prevent="onSubmit" class="w-100 px-4 pb-4">
        <b-form-group
          label="Query (text):"
          label-for="input-text"
          label-cols-sm="2"
          v-if="endpointUsesText"
        >
          <b-form-input
            class="w-100"
            id="input-text"
            required
            placeholder="London, UK"
            v-model="text"
            @change="onChange"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="Ids (comma separated):"
          label-for="input-ids"
          label-cols-sm="2"
          v-if="endpointUsesIds"
        >
          <b-form-input
            class="w-100"
            id="input-ids"
            required
            placeholder="openstreetmap:venue:way/5013364,whosonfirst:borough:421205771"
            v-model="ids"
            @change="onChange"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="input-group-2"
          :label="pointLabel"
          label-for="input-point"
          label-cols-sm="2"
          v-if="endpointUsesPoint"
        >
          <div style="display: flex">
            <b-form-input
              id="input-point"
              placeholder="40.74, -74"
              v-model="pointStr"
              @change="onPointChange"
              :required="isPointRequired"
            ></b-form-input>

            <b-button v-b-modal.modal-point>
              <font-awesome-icon :icon="['fa', 'map']" />
            </b-button>
          </div>
        </b-form-group>

        <b-form-group id="input-group-5" label="Hosts" label-for="input-hosts" label-cols-sm="2">
          <vue-tags-input
            id="input-hosts"
            v-model="host"
            :tags="hosts"
            @tags-changed="tagsChanged"
            placeholder="Add Host"
          />
          <div class="alert alert-danger" v-if="hosts.length === 0">
            Please add at least one host
          </div>
        </b-form-group>

        <b-form-group label="Extra params" label-for="input-extra-params" label-cols-sm="2">
          <b-form-input
            id="input-extra-params"
            placeholder="debug=true&foo=bar&baz=bat"
            v-model="extraParams"
            @change="onChange"
          ></b-form-input>
        </b-form-group>

        <div role="group" class="form-row form-group">
          <label class="col-sm-2 col-form-label">Options</label>
          <div class="bv-no-point-ring col flex">
            <b-form-checkbox id="checkbox-debug" @change="onDebugChange" v-model="debug"
              >Debug</b-form-checkbox
            >
          </div>
        </div>

        <div role="group" class="form-row form-group">
          <label class="col-sm-2 col-form-label">Endpoint</label>
          <div class="col-sm-10" style="display:flex">
            <b-form-radio v-model="endpoint" @change="onEndpointChange" value="/v1/search"
              >Geocode</b-form-radio
            >
            <b-form-radio v-model="endpoint" @change="onEndpointChange" value="/v1/autocomplete"
              >Autocomplete</b-form-radio
            >
            <b-form-radio v-model="endpoint" @change="onEndpointChange" value="/v1/reverse"
              >Reverse Geocode</b-form-radio
            >
            <b-form-radio
              v-model="endpoint"
              @change="onEndpointChange"
              value="/v1/search/structured"
              >Structured Geocode</b-form-radio
            >
            <b-form-radio v-model="endpoint" @change="onEndpointChange" value="/v1/place"
              >Place</b-form-radio
            >
          </div>
        </div>

        <b-form-group label="Search path" label-for="input-search-path" label-cols-sm="2">
          <b-form-input
            id="input-search-path"
            required
            placeholder="/v1/autocomplete?text=london"
            v-model="queryPath"
          ></b-form-input>
        </b-form-group>

        <b-button type="submit" variant="primary">Submit</b-button>
      </b-form>
    </b-row>

    <b-row>
      <ViewColumn
        v-for="response in responses"
        :key="response.url"
        :body="response.body"
        :host="response.host"
        :numHosts="hosts.length"
      />
    </b-row>

    <b-modal id="modal-point" :title="pointLabel" @shown="pointModalShown">
      <PointModal
        ref="pointModal"
        :lat="pointLat"
        :lng="pointLng"
        v-on:point-changed="pointChanged"
      />
    </b-modal>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { VueTagsInput, createTags } from '@johmun/vue-tags-input';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMap } from '@fortawesome/free-solid-svg-icons';

import * as L from 'leaflet';

/* eslint-disable global-require */
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

// app.js
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import { Icon } from 'leaflet';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import ViewColumn from './ViewColumn.vue';
import PointModal from './PointModal.vue';
import '../../node_modules/leaflet/dist/leaflet.css';

import '../main.css';

library.add(faMap);

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

type Tag = {
  text: string;
};

@Component({
  components: {
    PointModal,
    VueTagsInput,
    FontAwesomeIcon,
    ViewColumn,
  },
})
export default class CompareView extends Vue {
  @Prop() private isBuiltForApi!: boolean;

  @Prop() private isBuiltForSpa!: boolean;

  ids: string | null = '';

  text: string | null = '';

  private point: L.LatLng | null = null;

  private pointStr: string | null = '';

  private host = '';

  private hosts: Tag[] = [];

  private autocomplete = false;

  private debug = true;

  private queryPath = '';

  private extraParams = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private responses: any[] = [];

  private endpoint = '/v1/search';

  pointModalShown() {
    (this.$refs.pointModal as PointModal).invalidateSize();
  }

  tagsChanged(newHosts: Tag[]) {
    this.hosts = newHosts;
    // ugh, for historical reasons, we save these in local storage as "endpoints"
    window.localStorage.setItem('endpoints', this.hosts.map((h) => h.text).join(','));
    this.onChange();
  }

  created() {
    // ugh, for historical reasons, we save these in local storage as "endpoints"
    const hosts = window.localStorage.getItem('endpoints');
    window.console.info('loaded from localStorage:', (hosts || '').split(',').join(', '));
    if (typeof hosts === 'string') {
      if (hosts !== '') {
        this.hosts = createTags(hosts.split(','));
      }
    } else {
      window.localStorage.setItem('endpoints', '');
    }
    if (this.hosts.length === 0) {
      if (this.isBuiltForApi) {
        this.hosts = createTags([`${window.location.protocol}//${window.location.host}`]);
      } else {
        this.hosts = createTags(['https://api.geocode.earth', 'https://api.dev.geocode.earth']);
      }
    }

    // If we're running in non-SPA mode with routing like
    // http://blackmad.github.io/pelias-compare/index.html#/v1/search?text=....
    let hash = window.location.hash.substr(1);
    // If we're running in SPA mode with routing like
    // http://localhost:8080/v1/search?text=San+Nicolas%2C+Peru&debug=0
    if (this.isBuiltForSpa) {
      hash = `/v1/${window.location.href.split('/v1/')[1]}`;
    }

    // As a hueristic, only decode as uri component if there's a uri
    // escaped question mark in there. Copy and pasting a path onto the
    // url hash string won't automatically do this
    if (hash.includes('%3F')) {
      hash = decodeURIComponent(hash);
    }
    if (hash.length > 0) {
      const parts = hash.split('?');
      // eslint-disable-next-line prefer-destructuring
      this.endpoint = parts[0];
      const params = new URLSearchParams(parts[1]);

      this.debug = params.get('debug') === '1';
      params.delete('debug');

      this.text = params.get('text');
      params.delete('text');

      this.ids = params.get('ids');
      params.delete('ids');

      const parsePoint = (_prefix?: string) => {
        const prefix = _prefix ? `${_prefix}.` : '';

        const lat = params.get(`${prefix}point.lat`);
        const lon = params.get(`${prefix}point.lon`);
        if (!lat || !lon) {
          return null;
        }

        params.delete(`${prefix}point.lat`);
        params.delete(`${prefix}point.lon`);

        const latlng = new L.LatLng(parseFloat(lat.trim()), parseFloat(lon.trim()));

        this.pointStr = `${latlng.lat},${latlng.lng}`;

        return latlng;
      };

      this.point = parsePoint() || parsePoint('focus');

      this.extraParams = params.toString();

      if (
        (this.text && this.endpointUsesText)
        || (this.point && this.isPointRequired)
        || (this.ids && this.endpointUsesIds)
      ) {
        this.onChange();
        this.onSubmit();
      }
    }
  }

  getParams() {
    const params = new URLSearchParams(`?${this.extraParams}`);

    if (this.point && this.endpointUsesPoint) {
      if (this.endpointUsesFocus) {
        params.set('focus.point.lat', this.point.lat.toString());
        params.set('focus.point.lon', this.point.lng.toString());
      } else {
        params.set('point.lat', this.point.lat.toString());
        params.set('point.lon', this.point.lng.toString());
      }
    }

    if (this.text && this.endpointUsesText) {
      params.set('text', this.text);
    }

    if (this.ids && this.endpointUsesIds) {
      params.set('ids', this.ids);
    }

    if (this.debug !== undefined) {
      params.set('debug', this.debug ? '1' : '0');
    }
    return params;
  }

  // We need this because checkboxes don't seem to sync before calling change
  // unlike text fields
  onDebugChange(v: boolean) {
    this.debug = v;
    this.onChange();
  }

  // We need this because checkboxes don't seem to sync before calling change
  // unlike text fields
  onEndpointChange(v: string) {
    this.endpoint = v;
    this.onChange();
  }

  onPointChange(v: string) {
    const parts = v.split(',');
    this.point = new L.LatLng(parseFloat(parts[0].trim()), parseFloat(parts[1].trim()));
    this.onChange();
  }

  onChange() {
    const params = this.getParams();

    this.queryPath = `${this.endpoint}?${params.toString()}`;
    if (this.isBuiltForSpa) {
      window.history.replaceState({}, '', this.queryPath);
    } else {
      window.location.hash = this.queryPath;
    }

    this.$forceUpdate();
  }

  // get your own api key for free at https://geocode.earth/
  // to use your own key, open the browsr console and enter
  // the key in your browser localstorage and refresh the page:
  // > localStorage.setItem('api_key:geocode.earth', 'ge-aaaaaaaaaaaaaaaa');
  getKey = (domain: string) => {
    const sections = domain.split('.');
    for (let i = 0; i < sections.length - 1; i += 1) {
      const host = sections.slice(i).join('.');
      const key = window.localStorage.getItem(`api_key:${host}`);
      if (typeof key === 'string' && key.length) {
        window.console.info(
          `loaded key for domain '${domain}' from localStorage: 'api_key:${host}'`,
        );
        return key;
      }
    }
    // if no personal key is found, then
    // use the geocode.earth 'compare app' key
    // which has restrictive daily limits due to
    // frequent abuse.
    return 'ge-5673e2c135b93a30';
  };

  onSubmit() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responsePromises: Promise<any>[] = this.hosts.map(async (_host: Tag) => {
      let host = _host.text;
      if (host.endsWith('/')) {
        host = host.substring(0, host.length - 1);
      }

      let { queryPath } = this;

      // eslint-disable-next-line no-prototype-builtins
      if (!queryPath.includes('api_key')) {
        const key = this.getKey(host);
        if (key) {
          // eslint-disable-next-line @typescript-eslint/camelcase
          queryPath += `&api_key=${key}`;
        }
      }

      const urlWithParams = `${host}${queryPath}`;

      // eslint-disable-next-line prefer-const
      let { status, data } = await fetch(urlWithParams, {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-Requested-With': '' },
      })
        .then(async (response) => ({ data: await response.json(), status: response.status }))
        .catch((err) => {
          window.console.warn(err);
          return {
            status: '',
            data: {
              error: err,
            },
          };
        });

      if (!data || !data.geocoding) {
        // mock response to reuse the UI logic

        let message = 'failed to load json';
        if (data && data.error) {
          message = data.error;
        }

        data = {
          geocoding: {
            errors: [`${status} ${message}`],
          },
        };
      }

      return {
        url: urlWithParams,
        status,
        host,
        body: data,
        bodyString: `${JSON.stringify(data, null, 2)}\n\n`,
      };
    });
    Promise.all(responsePromises)
      .then((r) => {
        this.responses = r;
      })
      .catch((e) => {
        window.console.error(e);
      });
  }

  pointChanged(latlng: L.LatLng) {
    this.pointStr = `${latlng.lat},${latlng.lng}`;
  }

  get endpointUsesText() {
    return ['/v1/search', '/v1/autocomplete'].includes(this.endpoint);
  }

  get endpointUsesIds() {
    return ['/v1/place'].includes(this.endpoint);
  }

  get isPointRequired() {
    return this.endpoint === '/v1/reverse';
  }

  get endpointUsesPoint() {
    return ['/v1/search', '/v1/autocomplete', '/v1/search/structured', '/v1/reverse'].includes(
      this.endpoint,
    );
  }

  get endpointUsesFocus() {
    return ['/v1/search', '/v1/autocomplete', '/v1/search/structured'].includes(this.endpoint);
  }

  get pointLabel() {
    if (this.endpointUsesFocus) {
      return 'Focus';
    }
    return 'Point';
  }

  get pointLat() {
    return this.point?.lat;
  }

  get pointLng() {
    return this.point?.lng;
  }
}
</script>
