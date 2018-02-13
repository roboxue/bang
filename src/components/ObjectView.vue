<template>
  <v-container fluid>
    <v-data-table
      v-bind:headers="headers"
      :items="items"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-right">{{ props.item.index }}</td>
        <td class="text-xs-right">{{ props.item.key }}</td>
        <td class="text-xs-right">{{ props.item.value }}</td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import _ from "lodash"

export default {
  data () {
    return {
      headers: [
        {
          text: "Index",
          value: "index"
        },
        {
          text: "Key",
          value: "key"
        },
        {
          text: "Value",
          value: "value"
        }
      ]
    }
  },
  computed: {
    items () {
      return _.toPairs(this.model).map((keyValuePair, index) => {
        return {key: keyValuePair[0], value: keyValuePair[1], index}
      })
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
