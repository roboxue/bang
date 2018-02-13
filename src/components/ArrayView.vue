<template>
  <v-container fluid>
    <p class="display-1">Column stats</p>
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
    <p class="display-1">Table view</p>
    <v-data-table
      v-bind:headers="[{text: 'Index', value: 'index'}].concat(visibleHeaders)"
      :items="items"
      hide-actions
    >
      <template slot="headerCell" slot-scope="props">
        <span>
          {{ props.header.value }}
        </span>
      </template>
      <template slot="items" slot-scope="props">
        <td class="text-xs-right">{{ props.index }}</td>
        <td class="text-xs-right" v-for="h in visibleHeaders" :key="h.value">
          {{ props.item[h.value] }}
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      rowsPerPageItems: [4, 8, 12],
      pagination: {
        rowsPerPage: 4
      },
      headers: []
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
        this.headers = _.chain(val)
        .map((m) => _.keys(m))
        .flatten()
        .countBy()
        .toPairs()
        .sortBy([(p) => -p[1], (p) => p[0]])
        .map((p) => {
          return {
          count: p[1],
          value: p[0],
          visible: true
        }})
        .value()
      }
  },
  props: {
    models: Array
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
