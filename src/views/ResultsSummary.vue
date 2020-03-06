<template>
  <ul class="summary">
    <li
      @click="featureClicked(feature)"
      v-for="(feature, index) in (features || [])"
      :key="feature.properties.id"
    >
      <span class="num">{{ index }}<span class="hidden_brace">) </span></span>
      <span class="icon">
        <font-awesome-icon :icon="iconForLayer(feature.properties.layer)" />
      </span>
      {{ feature.properties.label }}
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
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
} from '@fortawesome/free-solid-svg-icons';
import { faCuttlefish } from '@fortawesome/free-brands-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

@Component({
  components: { FontAwesomeIcon },
})
export default class ResultsSummary extends Vue {
  @Prop() private features!: GeoJSON.Feature[];

  constructor() {
    super();
    [
      faCuttlefish,
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
    ].forEach((i) => library.add(i));
  }

  featureClicked(feature: GeoJSON.Feature) {
    this.$emit('feature-clicked', feature);
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
}
</script>

<style scoped>

.summary {
  background-color: white;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.2em;
  overflow-x: hidden;
  padding: 5px 10px;
  min-height: 2em;
}

.summary ul,
.summary ul li {
  margin: 0;
  padding: 0;
  list-style: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary ul {
  margin-left: -5px;
}

.summary p.error {
  color: rgba(139,0,0,0.8);
  padding: 0;
  margin: 0;
}

.summary span.num {
  color: rgba(0,0,139,0.6);
  white-space: pre;
}

.summary span.icon {
  color: rgba(0,0,139,0.4);
  white-space: pre;
  display: inline-block;
  width: 18px;
  font-size: 11px;
  vertical-align: bottom;
  margin: 0;
  margin-left: 1px;
  margin-right: 4px;
  text-align: center;
}

.hidden_brace{
  font-size: 0;
  line-height: 0;
}
</style>
