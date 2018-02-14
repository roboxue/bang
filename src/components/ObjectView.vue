<template>
  <v-container fluid>
    <v-subheader>Object view</v-subheader>
    <v-list>
      <v-list-tile class="py-1" :key="h" v-for="h in headers" @click.prevent="$emit('browse', [h])">
        <v-list-tile-title>
          {{h}}
        </v-list-tile-title>
        <v-list-tile-sub-title>
          <v-tooltip bottom>
              <span slot="activator" v-if="lodash.isPlainObject(model[h])">[array]</span>
              <span slot="activator" v-else-if="lodash.isArray(model[h])">[array]</span>
              <span slot="activator" v-else-if="lodash.isNull(model[h])">[null]</span>
              <span slot="activator" v-else-if="model[h] === ''">[empty string]</span>
              <span slot="activator" v-else>{{model[h]}}</span>
              <pre v-highlightjs><code class="json">{{JSON.stringify(model[h], null, 4)}}</code></pre>
          </v-tooltip>
        </v-list-tile-sub-title>
      </v-list-tile>
    </v-list>
  </v-container>
</template>

<script>
import _ from "lodash"

export default {
  data () {
    return {
      lodash: _
    }
  },
  computed: {
    headers() {
      return _.keys(this.model)
    }
  },
  props: {
    model: Object
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
