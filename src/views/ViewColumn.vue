/* eslint-disable @typescript-eslint/no-explicit-any */

<style>
.renderedJson {
  overflow-x: scroll;
}

.renderjson a {
  text-decoration: none;
}
.renderjson .disclosure {
  color: crimson;
  font-size: 150%;
}
.renderjson .syntax {
  color: grey;
}
.renderjson .string {
  color: darkred;
}
.renderjson .number {
  color: darkcyan;
}
.renderjson .boolean {
  color: blueviolet;
}
.renderjson .key {
  color: darkblue;
}
.renderjson .keyword {
  color: blue;
}
.renderjson .object.syntax {
  color: lightseagreen;
}
.renderjson .array.syntax {
  color: orange;
}

.awesome-marker svg {
  width: 15px;
  height: 15px;
  margin-top: 11px;
}
</style>

<template>
  <b-col sm="auto">
    <div class="messages">
      <div
        class="alert alert-danger"
        v-for="(message, index) in body.geocoding.errors"
        :key="index"
      >
        {{ message }}
      </div>
      <div
        class="alert alert-warning"
        v-for="(message, index) in body.geocoding.warnings"
        :key="index"
      >
        {{ message }}
      </div>
    </div>

    <div class="response shadow">
      <h4 class="code-title code-title-silver rounded">
        <span class="title">&nbsp;{{ host }}</span>
      </h4>
      <div class="code rounded" v-if="body.features && body.features.length">
        <ol>
          <li
            class="summary"
            @click="clickFeature(feature)"
            v-for="feature in body.features"
            :key="feature.properties.id"
          >
            <font-awesome-icon :icon="iconForLayer(feature.properties.layer)" />
            {{ feature.properties.label }}
          </li>
        </ol>
      </div>
      <div class="code rounded" v-else>
        No Results
      </div>
    </div>

    <div class="assertion shadow rounded" style="margin-top:-10px;">
      <l-map
        style="height: 200px;"
        :center="center"
        :zoom="13"
        ref="mymap"
        :options="{ scrollWheelZoom: false }"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
      </l-map>
    </div>

    <div class="assertion shadow rounded" v-if="body" style="margin-top:-10px;">
      <!-- <div class="code"> -->
      <div class="renderedJson" ref="renderedJson" :style="renderedJsonStyle"></div>
      <!-- </div> -->
    </div>
  </b-col>
</template>

<script lang="ts">
import renderjson from '@/vendor/renderjson';
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as L from 'leaflet';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faMap,
  faUniversity,
  faGavel,
  faDrawPolygon,
  faMapPin,
  faGlobe,
  faVectorSquare,
  faObjectUngroup,
  faFlagCheckered,
  faMapMarker,
  faEnvelope,
  faCrosshairs,
  faRoad,
  faQuestion,
  faAmericanSignLanguageInterpreting,
  faDotCircle,
  faMapSigns,
  faLanguage,
} from '@fortawesome/free-solid-svg-icons';
import { faCuttlefish, faWeebly } from '@fortawesome/free-brands-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import { latLng } from 'leaflet';

import AwesomeMarkers from '@/vendor/leaflet.awesome-markers';
import '@/vendor/leaflet.awesome-markers.css';

[
  faWeebly,
  faDotCircle,
  faMapSigns,
  faLanguage,
  faCuttlefish,
  faMap,
  faUniversity,
  faGavel,
  faDrawPolygon,
  faMapPin,
  faGlobe,
  faVectorSquare,
  faObjectUngroup,
  faFlagCheckered,
  faMapMarker,
  faEnvelope,
  faCrosshairs,
  faRoad,
  faQuestion,
  faAmericanSignLanguageInterpreting,
  faMap,
].forEach((i) => library.add(i));

function parseHTML(s: string) {
  const tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = s;
  return tmp.body.children;
}

function renderjsonReplacer(key: string, value: string) {
  if (typeof value === 'string' && value.startsWith('whosonfirst:')) {
    const parts = value.split(':');
    const id = parts[parts.length - 1];
    return parseHTML(`<a href="https://spelunker.whosonfirst.org/id/${id}/">"${value}"</a>`);
  }
  // "gid": "openaddresses:address:us/tn/statewide:db4775140901eba0",
  if (typeof value === 'string' && value.startsWith('openaddresses:')) {
    const parts = value.split(':');
    if (parts.length > 2) {
      const filepath = parts[2];
      return parseHTML(
        `<span>"${parts[0]}:${
          parts[1]
        }:<a href="https://github.com/openaddresses/openaddresses/blob/master/sources/${filepath}.json">${
          parts[2]
        }</a>:${parts.slice(3).join(':')}"</span>`,
      );
    }
  }
  return value;
}

const markers = {
  default: AwesomeMarkers.icon({
    icon: faDotCircle,
    markerColor: 'purple',
  }),
  geonames: AwesomeMarkers.icon({
    icon: faMapSigns,
    markerColor: 'darkpurple',
  }),
  wof: AwesomeMarkers.icon({
    icon: faWeebly,
    markerColor: 'green',
  }),
  openstreetmap: AwesomeMarkers.icon({
    icon: faMap,
    markerColor: 'red',
  }),
  openaddresses: AwesomeMarkers.icon({
    icon: faLanguage,
    markerColor: 'orange',
  }),
  quattroshapes: AwesomeMarkers.icon({
    icon: faObjectUngroup,
    markerColor: 'darkgreen',
  }),
};

@Component({
  components: { FontAwesomeIcon },
})
export default class ViewColumn extends Vue {
  @Prop() private body!: any;

  @Prop() private numHosts!: number;

  @Prop() private host!: string;

  private renderedJson: any = null;

  private summary = '';

  renderedJsonStyle = {};

  center = latLng(47.41322, -1.219482);

  url = '//{s}.tiles.mapbox.com/v3/randyme.i0568680/{z}/{x}/{y}.png';

  // url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

  centerFeatures(features: any) {
    const geoJsonLayer = L.geoJSON(features);

    let bounds = geoJsonLayer.getBounds();

    // pad bounds to the marker fit on screen
    try {
      bounds = bounds.pad(0.5);
      this.getMap().fitBounds(bounds);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  mounted() {
    this.renderedJsonStyle = {
      'max-width': `${94 / this.numHosts}vw`,
    };

    console.log(this.renderedJsonStyle);

    renderjson.set_replacer(renderjsonReplacer);
    renderjson.set_show_to_level('all');

    (this.$refs.renderedJson as any).appendChild(renderjson(this.body));
    this.getMap().invalidateSize();
    this.centerFeatures(this.body.features);

    this.addBoundingBoxes();
    this.addMarkers();
  }

  addMarkers() {
    const geojson = this.body;
    // add a red marker to map to indicate the focus centre point.
    let focusPoint = null;
    if (geojson?.data?.geocoding.query) {
      const { query } = geojson.data.geocoding;
      if (query && query['focus.point.lat'] && query['focus.point.lon']) {
        focusPoint = { lon: query['focus.point.lon'], lat: query['focus.point.lat'] };
      }
    }
    // all custom icon logic
    const pointToLayer = function style(f: any, latlon: L.LatLng) {
      let i = markers.default;

      // custom icon created from geojson properties
      if (f.properties?.icon) {
        i = AwesomeMarkers.icon({
          icon: f.properties.icon,
          markerColor: f.properties['marker-color'] || 'red',
        });
      } else {
        switch (f.properties.source) {
          case 'openstreetmap':
          case 'osm':
            i = markers.openstreetmap;
            break;
          case 'whosonfirst':
          case 'wof':
            i = markers.wof;
            break;
          case 'geonames':
          case 'gn':
            i = markers.geonames;
            break;
          case 'quattroshapes':
          case 'qs':
            i = markers.quattroshapes;
            break;
          case 'openaddresses':
          case 'oa':
            i = markers.openaddresses;
            break;
          default:
            i = markers.default;
            break;
        }
      }

      return L.marker(latlon, {
        title: `${f.properties.gid} - ${f.properties.label}`,
        icon: i,
      }).bindPopup(
        `<p><strong style="font-size:14px">${f.properties.label}</strong><br />${f.properties.gid}</p>`,
      );
    };

    const style = (f: any) => f.properties;

    if (geojson.data?.features) {
      if (focusPoint) {
        geojson.data.features.push({
          type: 'Feature',
          properties: {
            'marker-color': 'blue',
            icon: 'crosshairs',
            gid: `lat: ${focusPoint.lat}, lon: ${focusPoint.lon}`,
            label: 'focus.point',
          },
          geometry: {
            type: 'Point',
            coordinates: [focusPoint.lon, focusPoint.lat],
          },
        });
      }
    }

    L.geoJSON(geojson, {
      pointToLayer,
      style,
    }).addTo(this.getMap());
  }

  addBoundingBoxes() {
    const style = {
      stroke: true,
      color: 'blue',
      opacity: 0.5,
      dashArray: '5, 5',
      fillColor: 'blue',
      fillOpacity: 0.0,
      weight: 2,
    };

    const bboxLayer = new L.GeoJSON();
    (this.body.features || []).forEach((feat: { bbox: number[] }) => {
      if (feat?.bbox) {
        const bounds = [
          [feat.bbox[1], feat.bbox[0]],
          [feat.bbox[3], feat.bbox[2]],
        ];
        const rect = new L.Rectangle(bounds as any, style);
        rect.addTo(bboxLayer);
      }
    });
    this.getMap().addLayer(bboxLayer);
  }

  // eslint-disable-next-line class-methods-use-this
  iconForLayer(layer: string) {
    switch (layer) {
      case 'locality':
        return faUniversity;
      case 'localadmin':
        return faGavel;
      case 'neighbourhood':
        return faDrawPolygon;
      case 'borough':
        return faMapPin;
      case 'county':
        return faCuttlefish;
      case 'macrocounty':
        return faGlobe;
      case 'region':
        return faVectorSquare;
      case 'macroregion':
        return faObjectUngroup;
      case 'country':
        return faFlagCheckered;
      case 'venue':
        return faMapMarker;
      case 'address':
        return faEnvelope;
      case 'mixed':
        return faCrosshairs;
      case 'street':
        return faRoad;
      default:
        return faQuestion;
    }
  }

  clickFeature(feature: any) {
    const geojson = L.geoJSON(feature);
    const bounds = geojson.getBounds();
    this.getMap().setView(bounds.getCenter(), 6);
  }

  getMap(): L.Map {
    return ((this.$refs.mymap as unknown) as { mapObject: L.Map }).mapObject;
  }
}
</script>
