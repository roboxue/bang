define ["underscore"
        "backbone"
        "URI"
        "d3"
        "mustache"
        "app/templates"
], (_, Backbone, URI, d3, Mustache, templates)->
  class BangRequestPanelView extends Backbone.View
    model: URI

    initialize: ->
      @queryStringBlockId = "uriSearch"
      @queryStringListId = "queryParameters"
      @keyInputId = "newKey"
      @valueInputId = "newValue"
      @refreshUrlId = "refreshUrl"

    events:
      "change .form-group.urlComponent[data-key] input": "onUpdateUri"
      "change .form-group.queryParameter[data-key] input": "onUpdateQueryParameter"
      "click #uriSearch": "onToggleQueryStringDetail"
      "click #addNewQueryParameter button": "onAddNewQueryParameter"

    render: (root)->
      root  = d3.select(@el)
      @originQueryParam = @model.search(true)
      @renderHeader root.append("div").attr("class", "panel-heading")
      @renderRequestUri root.append("div").attr("class", "form-horizontal panel-footer").attr("id", "uri")
      @renderFooter root.append("div").attr("class", "panel-footer")

    renderHeader: (header)->
      href = @model.href()
      header.append("span").attr("class", "panel-title").html("Requested URL: <code>#{href}</code>")

    renderFooter: (footer)->
      footer.append("span").attr("class", "panel-title").attr("id", @refreshUrlId)

    renderRequestUri: (root)->
      page = {
        protocol: @model.protocol()
        hostname: @model.hostname()
        port: @model.port()
        path: @model.path()
        hash: @model.hash()
        queryStringBlockId: @queryStringBlockId
        queryStringListId: @queryStringListId
        keyInputId: @keyInputId
        valueInputId: @valueInputId
      }
      root.html Mustache.render templates.BangRequestUri, page
      root.selectAll(".form-control-feedback").style("display", "none")
      @renderQueryParameters()

    renderQueryParameters: ->
      @updateRefreshLink()
      $("#" + @queryStringBlockId).text @model.search() or "(no query string)"
      parameterDiv = d3.select("#" + @queryStringListId).text("").selectAll("div.form-group").data(_.pairs(@model.search(true))).enter()
      .append("div").attr("class", "form-group has-feedback queryParameter").attr("data-key", ([key])-> key)
      parameterDiv.append("label").attr("class", "control-label col-sm-offset-2 col-sm-2").attr("for", ([key])-> "query#{key}").text(([key])-> key)
      inputDiv = parameterDiv.append("div").attr("class", "col-sm-7")
      inputDiv.append("span").attr("class", "glyphicon glyphicon-warning-sign form-control-feedback").attr("aria-hidden", "true").style("display", "none")
      inputDiv.append("input").attr(
        placeholder: ([key])=> @originQueryParam[key]
        value: ([key, value])-> value
        type: "text"
        class: "form-control"
        id: ([key])-> "query#{key}"
      )
      parameterDiv.append("div").attr("class", "col-sm-1").append("button").attr("class", "glyphicon glyphicon-remove btn btn-default").on "click", ([key])=>
        @model.removeSearch key
        @renderQueryParameters()

    onUpdateUri: (ev)->
      key = $(ev.currentTarget).parent().parent().data("key")
      value = $(ev.currentTarget).val()
      defaultValue = $(ev.currentTarget).attr("placeholder")
      valueToSet = if value and value isnt defaultValue then value else defaultValue
      @model[key](valueToSet)
      @updateUri $(ev.currentTarget), (value and value isnt defaultValue)

    onUpdateQueryParameter: (ev)->
      key = $(ev.currentTarget).parent().parent().data("key")
      value = $(ev.currentTarget).val()
      defaultValue = $(ev.currentTarget).attr("placeholder")
      valueToSet = if value and value isnt defaultValue then value else defaultValue
      @model.setSearch(key, valueToSet)
      @updateUri $(ev.currentTarget), (value and value isnt defaultValue)

    updateUri: (divToUpdate, showFeedbackIcon)->
      if showFeedbackIcon
        divToUpdate.siblings(".form-control-feedback").show()
        divToUpdate.parent().parent().addClass("has-warning")
      else
        divToUpdate.siblings(".form-control-feedback").hide()
        divToUpdate.parent().parent().removeClass("has-warning")
      $("#" + @queryStringBlockId).text @model.search() or "(no query string)"
      @updateRefreshLink()

    updateRefreshLink: ->
      $("#" + @refreshUrlId).html("Updated URL: <a href='#{@model.href()}'><code>#{@model.href()}</code></a>")

    onToggleQueryStringDetail: ->
      $("#" + @queryStringListId).toggle()

    onAddNewQueryParameter: ->
      newKey = $("#" + @keyInputId).val()
      if newKey
        $("#" + @keyInputId).parent().removeClass("has-error")
      else
        return $("#" + @keyInputId).parent().addClass("has-error")
      newValue = $("#" + @valueInputId).val()
      if newValue
        @model.addSearch(newKey, newValue)
      else
        @model.addSearch(newKey)
      @renderQueryParameters()
      $("#" + @keyInputId).val("")
      $("#" + @valueInputId).val("")
