<template>
  <v-container fluid>
    ObjectView

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
    model: Object
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
