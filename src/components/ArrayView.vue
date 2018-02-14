<template>
  <v-container fluid>
    <v-subheader>Column stats</v-subheader>
    <v-list dense>
      <v-list-tile v-for="h in headers" :key="h.value">
        <v-list-tile-content><h4>{{h.value}}</h4></v-list-tile-content>
        <v-list-tile-content class="align-end">{{(h.count * 100 / models.length).toFixed(2)}}% ({{h.count}}/{{models.length}})</v-list-tile-content>
        <v-list-tile-action @click="h.visible = !h.visible">
          <v-btn icon ripple>
            <v-icon color=grey>{{ h.visible ? "visibility": "visibility_off"}}</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
    <v-subheader>Table view</v-subheader>
    <v-card-title>
      Search Array
      <v-spacer></v-spacer>
      <v-text-field
        append-icon="search"
        label="Search"
        single-line
        hide-details
        v-model="searchTerm"
      ></v-text-field>
    </v-card-title>
    <v-data-table
      v-bind:headers="[{text: 'Index', value: 'index'}].concat(visibleHeaders)"
      :items="items"
      :search="searchTerm"
    >
      <template slot="headerCell" slot-scope="props">
        <span>
          {{ props.header.value }}
        </span>
      </template>
      <template slot="items" slot-scope="props">
        <td class="text-xs-right">
          <a href="#" @click.prevent="$emit('browse', [props.index])">{{ props.index }}</a>
        </td>
        <td class="text-xs-right" v-for="h in visibleHeaders" :key="h.value">
          <v-tooltip bottom>
            <template v-if="h.value === '(value)'">
              <span slot="activator">{{props.item}}</span>
              <pre v-highlightjs><code class="json">{{JSON.stringify(props.item, null, 4)}}</code></pre>
            </template>
            <template bottom v-else>
              <a href="#"
                v-if="lodash.isPlainObject(props.item[h.value])"
                slot="activator" 
                @click.prevent="$emit('browse', [props.index, h.value])">
                [object]
              </a>
              <span slot="activator" v-else-if="lodash.isArray(props.item[h.value])">[array]</span>
              <span slot="activator" v-else-if="lodash.isNull(props.item[h.value])">[null]</span>
              <span slot="activator" v-else-if="props.item[h.value] === ''">[empty string]</span>
              <span slot="activator" v-else>{{props.item[h.value]}}</span>
              <pre v-highlightjs><code class="json">{{JSON.stringify(props.item[h.value], null, 4)}}</code></pre>
            </template>
          </v-tooltip>
        </td>
      </template>
        <template slot="no-data">
          <v-alert :value="true" type="warning">
            Empty Array
          </v-alert>
        </template>
    </v-data-table>
  </v-container>
</template>

<script>
import _ from "lodash"

export default {
  data () {
    return {
      searchTerm: '',
      lodash: _,
      rowsPerPageItems: [4, 8, 12],
      pagination: {
        rowsPerPage: 4
      },
      headers: this.getHeadersFromModel(this.models)
    }
  },
  computed: {
    items () {
      return this.models
    },
    visibleHeaders () {
      return _.filter(this.headers, ["visible", true])
    }
  },
  watch: {
      models: function (val) {
        this.headers = this.getHeadersFromModel(val)
      }
  },
  props: {
    models: Array
  },
  methods: {
    getHeadersFromModel (val) {
        return _.chain(val)
          .map((m) => _.isObject(m) ? _.keys(m): ["(value)"])
          .flatten()
          .countBy()
          .toPairs()
          .sortBy([(p) => -p[1], (p) => p[0]])
          .map((p) => {
            return {
              count: p[1],
              value: p[0],
              visible: true
            }
          })
          .value()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
