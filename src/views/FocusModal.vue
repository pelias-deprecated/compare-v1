<template>
  <div class="about">
    <l-map
      :zoom="zoom"
      :center="center"
      style="height: 50vh; width: 100%;"
      @click="addMarker"
      ref="mymap"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-marker :lat-lng="focusLatLng" v-if="focusLatLng"> </l-marker>
    </l-map>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { latLng } from 'leaflet';

@Component({})
export default class FocusView extends Vue {
  zoom = 5;

  center = latLng(47.41322, -1.219482);

  url = '//{s}.tiles.mapbox.com/v3/randyme.i0568680/{z}/{x}/{y}.png';

  // url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

  focusLatLng: L.LatLng | null = null;

  addMarker(event: {latlng: L.LatLng}) {
    this.$emit('focus-changed', event.latlng);
    this.focusLatLng = event.latlng;
  }

  getMap(): L.Map {
    return (this.$refs.mymap as unknown as {mapObject: L.Map}).mapObject;
  }

  invalidateSize() {
    setTimeout(() => {
      this.getMap().invalidateSize();
    }, 100);
  }
}
</script>
