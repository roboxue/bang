<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list>
        <v-subheader>Custom JSON literial</v-subheader>
        <codemirror v-model="code" :options="cmOptions"></codemirror>
        <v-list-tile @click="evalBangResult">
          <v-list-tile-action>
            <v-icon>assignment_turned_in</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Eval and assign to <code>bangResult</code></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-alert :type="evalErrorMessage ? 'error' : 'success'"
          v-model="showEvalMessage"
          dismissible>
          {{evalErrorMessage || "Evaluation Success"}}
        </v-alert>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-content>
      <ArrayView v-if="isArray"
        :models=bangResult
      />
      <ObjectView v-else-if="isObject"
        :model=bangResult
      />
      <ValueView v-else
        :model=bangResult
      />
    </v-content>
    <v-footer fixed app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
import ObjectView from './components/ObjectView'
import ArrayView from './components/ArrayView'
import ValueView from './components/ValueView'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/mode/javascript/javascript.js'

import _ from 'lodash'

export default {
  data () {
    return {
      clipped: false,
      drawer: true,
      title: 'Bang! JSON workspace',

      code: "",
      showEvalMessage: false,
      evalErrorMessage: "",
      bangResult: {},
      cmOptions: {
        tabSize: 4,
        mode: 'text/javascript',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true,
      }
    }
  },
  computed: {
    isArray () {
      return _.isArray(this.bangResult)
    },
    isObject () {
      return _.isObject(this.bangResult)
    }
  },
  methods: {
    evalBangResult () {
      this.evalErrorMessage = ""
      try {
        this.bangResult = JSON.parse(this.code)
      } catch(err) {
        this.evalErrorMessage = err.message
      }
      this.showEvalMessage = true
    }
  },
  name: 'App',
  components: {
    ObjectView,
    ArrayView,
    ValueView,
    codemirror
  }
}
</script>
