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
class BangQueryPanelView extends Backbone.View
  initialize: ->
    @textAreaId = "bangQuery"

  events:
    "click #runQuery": "doRunQuery"
    "click #rest": "doReset"

  render: ->
    root  = d3.select(@el)
    @renderHeader root.append("div").attr("class", "panel-heading")
    @renderQueryForm root.append("div").attr("class", "panel-body")

  renderHeader: (header)->
    header.append("span").attr("class", "panel-title").html("Custom JavaScript Query")

  renderQueryForm: (body)->
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
    body.html window.Milk.render bangTemplates.BangQueryForm, page

  doRunQuery: ->
    chrome.runtime.sendMessage {stage: "query"}
    query = $("#" + @textAreaId).val()
    @trigger "runQuery", query

  doReset: ->
    $("#" + @textAreaId).val "bang"
    bangJsonView.model.baseExpression = "bang"
    bangJsonView.model.set {fragment: if bang instanceof Array then "bang[]" else "bang"}
    bangJsonView.model.trigger "path:update"

