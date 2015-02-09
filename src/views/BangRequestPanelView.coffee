###
Bang.coffee, frontend JSON workspace, a chrome extension

Copyright (c) 2015, Groupon, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

Neither the name of GROUPON nor the names of its contributors may be
used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
###
class BangRequestPanelView extends Backbone.View
  model: URI

  initialize: ->
    @queryStringBlockId = "uriSearch"
    @queryStringListId = "queryParameters"
    @keyInputId = "newKey"
    @valueInputId = "newValue"
    @refreshLinkId = "refreshLink"

  events:
    "change .form-group[data-key] input": "onUpdateUri"
    "click #uriSearch": "onToggleQueryStringDetail"
    "click #addNewQueryParameter button": "onAddNewQueryParameter"

  render: (root)->
    root  = d3.select(@el)
    @originQueryParam = @model.search(true)
    @renderHeader root.append("div").attr("class", "panel-heading")
    @renderRequestUri root.append("div").attr("class", "form-horizontal panel-footer").attr("id", "uri")

  renderHeader: (header)->
    href = @model.href()
    header.append("span").attr("class", "panel-title").html("Response from <code>#{href}</code> stored into <code class='bang'>bang</code>")
    header.append("div").attr("class", "panel-toggle pull-right").text("toggle details")

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
      refreshLinkId: @refreshLinkId
    }
    root.html window.Milk.render bangTemplates.BangRequestUri, page
    root.selectAll(".form-control-feedback").style("display", "none")
    @renderQueryParameters()

  renderQueryParameters: ->
    $("#" + @refreshLinkId).attr("href", @model.href())
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
    ).on "change", ([key])=>
      value = $(d3.event.currentTarget).val()
      defaultValue = $(d3.event.currentTarget).attr("placeholder")
      valueToSet = if value and value isnt defaultValue then value else defaultValue
      @model.setSearch(key, valueToSet)
      @updateUri $(d3.event.currentTarget), (value and value isnt defaultValue)
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

  updateUri: (divToUpdate, showFeedbackIcon)->
    if showFeedbackIcon
      divToUpdate.siblings(".form-control-feedback").show()
      divToUpdate.parent().parent().addClass("has-warning")
    else
      divToUpdate.siblings(".form-control-feedback").hide()
      divToUpdate.parent().parent().removeClass("has-warning")
    $("#" + @queryStringBlockId).text @model.search() or "(no query string)"
    $("#" + @refreshLinkId).attr("href", @model.href())

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
