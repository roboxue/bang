<template>
  <v-container fluid>
  <pre v-highlightjs="sourcecode"><code class="javascript"></code></pre>
  </v-container>
</template>

<script>
import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'
Vue.use(VueHighlightJS)

export default {
  data () {
    return {
    }
  },
  computed: {
    sourcecode () {
      return JSON.stringify(model)
    }
  },
  props: [
    'model'
  ]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
