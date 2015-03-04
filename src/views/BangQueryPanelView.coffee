define ["underscore"
        "backbone"
        "mustache"
        "app/templates"
], (_, Backbone, Mustache, templates)->
  class BangQueryPanelView extends Backbone.View
    initialize: ->
      @textAreaId = "bangQuery"

    events:
      "click #runQuery": "doRunQuery"
      "click #reset": "doReset"

    render: ->
      page = {
        textAreaPlaceholder: "Any Javascript Expression!"
        textAreaId: @textAreaId
        supportedFrameworks: [
          {name: "jQuery", url: "http://jquery.com"}
          {name: "d3.js", url: "http://d3js.org"}
          {name: "underscore.js", url: "http://underscorejs.org"}
          {name: "backbone.js", url: "http://backbonejs.org"}
        ]
      }
      @$el.html Mustache.render templates.BangQueryForm, page

    doRunQuery: ->
      query = $("#" + @textAreaId).val()
      @trigger "change:query", query

    doReset: ->
      @updateQuery "bang"
      @trigger "reset:query"

    updateQuery: (query)->
      $("#" + @textAreaId).val query
