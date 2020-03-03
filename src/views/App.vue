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
      <b-form v-on:submit.prevent="onSubmit" class="w-100">
        <b-form-group label="Query (text):" label-for="input-text" label-cols-sm="2">
          <b-form-input
            class="w-100"
            id="input-text"
            required
            placeholder="London, UK"
            v-model="text"
            @change="onChange"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-2" label="Focus" label-for="input-focus" label-cols-sm="2">
          <div style="display: flex">
            <b-form-input
              id="input-focus"
              placeholder="40.74, -74"
              v-model="focus"
              @change="onChange"
            ></b-form-input>

            <b-button v-b-modal.modal-focus>
              <font-awesome-icon :icon="['fa', 'map']" />
            </b-button>
          </div>
        </b-form-group>

        <b-form-group id="input-group-4" label="Options" label-cols-sm="2">
          <b-form-checkbox
            id="checkbox-autocomplete"
            @change="onAutocompleteChange"
            v-model="autocomplete"
            >Autocomplete</b-form-checkbox
          >
          <b-form-checkbox id="checkbox-debug" @change="onDebugChange" v-model="debug"
            >Debug</b-form-checkbox
          >
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

        <b-form-group label="Search path" label-for="input-text" label-cols-sm="2">
          <b-form-input
            id="input-text"
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

    <b-modal id="modal-focus" title="Focus" @shown="focusModalShown">
      <FocusModal ref="focusModal" v-on:focus-changed="focusChanged" />
    </b-modal>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { VueTagsInput, createTags } from '@johmun/vue-tags-input';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMap } from '@fortawesome/free-solid-svg-icons';

import FocusModal from './FocusModal.vue';
import ViewColumn from './ViewColumn.vue';

library.add(faMap);

type Tag = {
  text: string;
};

@Component({
  components: {
    FocusModal,
    VueTagsInput,
    FontAwesomeIcon,
    ViewColumn,
  },
})
export default class CompareView extends Vue {
  @Prop() private msg!: string;

  text: string | null = '';

  private focus: string | null = '';

  private host = '';

  private hosts: Tag[] = [];

  private autocomplete = false;

  private debug = true;

  private queryPath = '';

  private extraParams = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private responses: any[] = [];

  private endpoint = '';

  focusModalShown() {
    (this.$refs.focusModal as FocusModal).invalidateSize();
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
    console.info('loaded from localStorage:', (hosts || '').split(',').join(', '));
    if (typeof hosts === 'string') {
      if (hosts !== '') {
        this.hosts = createTags(hosts.split(','));
      }
    } else {
      window.localStorage.setItem('endpoints', '');
    }
    if (this.hosts.length === 0) {
      this.hosts = createTags(['https://api.geocode.earth', 'https://api.dev.geocode.earth']);
    }

    const hash = window.location.hash.substr(1);
    if (hash.length > 0) {
      const parts = hash.split('?');
      const path = parts[0];
      this.autocomplete = path === '/v1/autocomplete';
      const params = new URLSearchParams(parts[1]);

      this.debug = params.get('debug') === '1';
      params.delete('debug');

      this.text = params.get('text');
      params.delete('text');

      this.focus = params.get('focus.point.lat')
        ? `${params.get('focus.point.lat')},${params.get('focus.point.lon')}`
        : null;

      params.delete('focus.point.lat');
      params.delete('focus.point.lon');

      this.extraParams = params.toString();

      if (this.text) {
        this.onChange();
        this.onSubmit();
      }
    }
  }

  getParams() {
    const params = new URLSearchParams(`?${this.extraParams}`);

    if (this.focus) {
      const focusParts = this.focus.split(',');
      // TODO(blackmad): do something here if it's invalid
      const lat = focusParts[0].trim();
      const lon = focusParts[1].trim();
      params.set('focus.point.lat', lat);
      params.set('focus.point.lon', lon);
    }

    if (this.text) {
      params.set('text', this.text);
    }

    if (this.debug !== undefined) {
      params.set('debug', this.debug ? '1' : '0');
    }
    return params;
  }

  // We need these because checkboxes don't seem to sync before calling change
  // unlike text fields
  onAutocompleteChange(v: boolean) {
    this.autocomplete = v;
    this.onChange();
  }

  onDebugChange(v: boolean) {
    this.debug = v;
    this.onChange();
  }

  onChange() {
    this.endpoint = '/v1/search';
    if (this.autocomplete) {
      this.endpoint = '/v1/autocomplete';
    }

    const params = this.getParams();

    this.queryPath = `${this.endpoint}?${params.toString()}`;
    window.location.hash = this.queryPath;

    if (this.autocomplete) {
      this.onSubmit();
    }
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
        console.info(`loaded key for domain '${domain}' from localStorage: 'api_key:${host}'`);
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
          console.warn(err);
          return {
            status: '',
            data: {
              error: err,
            },
          };
        });

      if (!data || !data.geocoding) {
        console.log('jsonp error', host);
        console.log(status, data);

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
      .catch((e) => console.error(e));
  }

  focusChanged(latlng: L.LatLng) {
    this.focus = `${latlng.lat},${latlng.lng}`;
  }
}
</script>
