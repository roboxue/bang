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
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <v-flex xs4>
            <v-container fluid>
              <v-breadcrumbs>
                <v-breadcrumbs-item>
                  <template slot="default">
                    <span @click="goToRoot">Root</span>
                  </template>
                </v-breadcrumbs-item>
                <v-breadcrumbs-item v-for="(fragment, i) in path" :key="fragment">
                  <template slot="default">
                    <span @click="path.pop(path.length - i)">{{fragment}}</span>
                  </template>
                </v-breadcrumbs-item>
              </v-breadcrumbs>
              <v-subheader>Raw JSON</v-subheader>
              <pre v-highlightjs="jsonRepl"><code class="json"></code></pre>
            </v-container>
          </v-flex>
          <v-flex xs8>
            <ArrayView v-if="isArray"
              :models=browseResult
              @browse="pushToPath"
            />
            <ObjectView v-else-if="isObject"
              :model=browseResult
              @browse="pushToPath"
            />
            <ValueView v-else
              :model=browseResult
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer fixed app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
import Vue from 'vue'
import ObjectView from './components/ObjectView'
import ArrayView from './components/ArrayView'
import ValueView from './components/ValueView'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/mode/javascript/javascript.js'
import VueHighlightJS from 'vue-highlightjs'
import 'highlight.js/styles/monokai.css'

import _ from 'lodash'

Vue.use(VueHighlightJS)

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
      path: [],
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
      return _.isArray(this.browseResult)
    },
    isObject () {
      return _.isObject(this.browseResult)
    },
    jsonRepl () {
      return JSON.stringify(this.browseResult, null, 2)
    },
    browseResult () {
      return this.path.length === 0 ? this.bangResult : _.get(this.bangResult, this.path)
    }
  },
  methods: {
    evalBangResult () {
      this.evalErrorMessage = ""
      try {
        this.bangResult = JSON.parse(this.code)
        this.path = []
      } catch(err) {
        this.evalErrorMessage = err.message
      }
      this.showEvalMessage = true
    },
    pushToPath (fragment) {
      this.path.push(fragment)
    },
    goToRoot () {
      this.path = []
    }
  },
  name: 'App',
  components: {
    ObjectView,
    ArrayView,
    ValueView,
    VueHighlightJS,
    codemirror
  }
}
</script>
