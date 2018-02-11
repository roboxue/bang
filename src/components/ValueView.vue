<template>
  <v-container fluid>
    ValueView

    {{JSON.stringify(model)}}
  </v-container>
</template>

<script>
export default {
  data () {
    return {
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
