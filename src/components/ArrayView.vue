<template>
  <v-container fluid>
    ArrayView

    {{JSON.stringify(model)}}
  </v-container>
</template>

<script>
export default {
  data () {
    return {
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
