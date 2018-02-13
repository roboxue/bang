<template>
  <v-container fluid>
    <v-data-table
      v-bind:headers="[{text: 'Index', value: 'index'}].concat(headers)"
      :items="items"
      hide-actions
    >
      <template slot="headerCell" slot-scope="props">
        <v-tooltip bottom>
          <span slot="activator">
            {{ props.header.text }}
          </span>
          <span>
            {{ props.header.text }}
          </span>
        </v-tooltip>
      </template>
      <template slot="items" slot-scope="props">
        <td class="text-xs-right">{{ props.index }}</td>
        <td class="text-xs-right" v-for="h in headers" :key="h.value">
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
    }
  },
  computed: {
    items () {
      return this.models
    },
    headers () {
      let total = this.models.length
      return _.chain(this.models)
      .map((m) => _.keys(m))
      .flatten()
      .countBy()
      .toPairs()
      .sortBy([(p) => -p[1], (p) => p[0]])
      .map((p) => {
        return {
        text: `${p[0]} (${p[1]}/${total})`,
        value: p[0]
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
