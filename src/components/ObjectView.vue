<template>
  <v-container fluid>
    <v-subheader>Object view</v-subheader>
    <v-card>
      <v-card-title class="py-1" :key="h" v-for="h in headers">
        <a href="#" @click.prevent="$emit('browse', h)">{{h}}</a>
        <v-spacer></v-spacer>
        <span class="text-lg-right" :key="h">{{ model[h] }}</span>
      </v-card-title>
    </v-card>
  </v-container>
</template>

<script>
import _ from "lodash"

export default {
  data () {
    return {
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
