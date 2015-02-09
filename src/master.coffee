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
bang = null
bangUri = null
originBangUri = null
queryResult = null
bangJsonView = null
bangQueryPanelView = null
bangRequestPanelView = null
originBody = null

render = ->
  console.log "Bang will make your life with JSON easier!"
  chrome.runtime.sendMessage {stage: "load"}
  root = d3.select("body").text("").append("div").attr("class", "container-fluid")
  renderHeader root.append("div").attr("class", "navbar navbar-default")
  queryRow = root.append("div").attr("class", "row")
  responseRow = root.append("div").attr("class", "row")
  bangJsonView = new BangJsonView {
    model: new BangJsonPath [new BangJsonPathFragment({fragment: if bang instanceof Array then "bang[]" else "bang"})], {baseExpression: "bang"}
    el: queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default panel-primary").attr("id", "navigatorPanel").node()
  }
  bangJsonView.render()
  bangQueryPanelView = new BangQueryPanelView {
    el: queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel").node()
  }
  bangQueryPanelView.render()
  bangRequestPanelView = new BangRequestPanelView {
    el: responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success").attr("id", "requestPanel").node()
    model: bangUri
  }
  bangRequestPanelView.render()
  $(".panel-heading")
  $(".panel-toggle").click (ev)->
    ev.preventDefault()
    $(ev.currentTarget).parent().siblings(".panel-body").toggle()
    if $("#rawResponse").is(":visible") and $("#rawResponse").is(":empty")
      renderRawResponseJSON()
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'), type: "text/css"})
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bang.css'), type: "text/css"})
  bangJsonView.model.trigger "path:update"
  bangQueryPanelView.on "runQuery", (query)->
    bangJsonView.clear()
    { error, result } = runQuery query
    console.log query, error, result
    if error
      bangJsonView.codeBlockPre.text error
      bangJsonView.codeBlockPre.text error
      $(bangJsonView.codeBlockPre.node()).show()
    else
      queryResult = result
      bangJsonView.model.baseExpression = query
      if queryResult instanceof Array
        bangJsonView.model.set {fragment: "queryResult[]"}
      else
        bangJsonView.model.set {fragment: "queryResult"}
      bangJsonView.model.trigger "path:update"

renderRawResponseJSON = ->
  $("#rawResponse").html prettyPrint(bang)
  $("#rawResponse [data-index][data-folded]").each ->
    node = $(this)
    currentIndex = parseInt node.data("index")
    childSiblings = node.nextUntil("[data-index=#{currentIndex}]").filter ->
      $(this).data("index") > currentIndex
    if childSiblings.length
      node.find(".glyphicon").addClass("glyphicon-minus")
      node.css("cursor", "pointer")
  $("#rawResponse [data-index][data-folded]").click (ev)->
    node = $(ev.currentTarget)
    currentIndex = parseInt node.data("index")
    childSiblings = node.nextUntil("[data-index=#{currentIndex}]").filter ->
      $(this).data("index") > currentIndex
    return unless childSiblings.length > 0
    next = node.nextAll("[data-index=#{currentIndex}]").first()
    if node.data("folded")
      node.data("folded", false)
      node.find(".json-comment").text("")
      node.find(".glyphicon").removeClass("glyphicon-plus").addClass("glyphicon-minus").text("")
      node.find(".json-comment").text("")
      decreaseFoldedTimes = (row)->
        foldedTimes = if row.data("folds") then parseInt(row.data("folds")) - 1 else 0
        row.data("folds", foldedTimes)
        row.show() if foldedTimes is 0
      decreaseFoldedTimes next
      childSiblings.each ->
        decreaseFoldedTimes $(this)
    else
      node.data("folded", true)
      node.find(".glyphicon").removeClass("glyphicon-minus").addClass("glyphicon-plus").text("")
      comment = next.text().trim()
      if /^]/.test comment
        # Display array's elements count if the folded row is an array
        elements = childSiblings.filter("[data-index=#{currentIndex + 1}]")
        # If this array contains n object, it will have n extra lines that matches index=currentIndex
        elementsCount = elements.length - elements.filter(-> $(".glyphicon-minus, .glyphicon-plus", this).length > 0).length
        comment = "#{elementsCount} elements#{comment}"
      else
        comment = "...#{comment}"
      node.find(".json-comment").text(comment)
      next.hide()
      childSiblings.hide()
      increaseFoldedTimes = (row)->
        foldedTimes = if row.data("folds") then parseInt(row.data("folds")) + 1 else 1
        row.data("folds", foldedTimes)
      increaseFoldedTimes next
      childSiblings.each ->
        increaseFoldedTimes $(this)

renderHeader = (root)->
  root.html """
  <div class="navbar-header">
    <a class="navbar-brand" href="http://github.com/roboxue/bang">Bang
      <ruby>
       棒<rt>Bàng</rt>
      </ruby>
      <small>(Awesome)</small>
    </a>
  </div>
  <div class="collapse navbar-collapse">
    <p class="navbar-text">Lightweight awesome <code>JSON</code> workspace - the raw response is in variable <code class="bang">bang</code></p>
    <p class="navbar-text navbar-right"><a href="#" class="navbar-link" id="dismiss">Dismiss Workspace</a></p>
  </div>
  """
  $("#dismiss").click (ev)->
    ev.preventDefault()
    d3.select("body").text("").append("pre").html JSON.stringify(JSON.parse(originBody), null, stringifyPadingSize)

runQuery = (query)->
  try
    result = eval query
    if result is undefined
      return {error: "(undefined)"}
    else
      return {result}
  catch ex
    return {error: ex}

getPathFragmentForKey = (data, key)->
  if data[key] instanceof Array
    if data[key].length is 1
      return new BangJsonPathFragment { fragment: key + "[0]" }
    else
      return new BangJsonPathFragment { fragment: key + "[]" }
  else
    return new BangJsonPathFragment {fragment: key }

stringifyPadingSize = 4

replacer = (match, pIndent, pKey, pVal, pEnd)->
  key = '<span class=json-key>'
  val = '<span class=json-value>'
  str = '<span class=json-string>'
  r = pIndent or ''
  index = r.length / stringifyPadingSize
  r = r.replace(/\s/g, '&nbsp;')
  if pKey
    r = r + key + pKey.replace(/[": ]/g, '') + '</span>: '
  if pVal
    r = r + (if pVal[0] is '"' then str else val) + pVal + '</span>'
  r += pEnd or ''
  "<p data-folded='false' data-index='#{index}' class='json-row row'><span class='glyphicon col-sm-1'></span><span class='col-sm-11 json-content'>#{r}<span class='json-comment'></span></span></p>"

replacerSimplified = (match, pIndent, pKey, pVal, pEnd)->
  key = '<span class=json-key>'
  val = '<span class=json-value>'
  str = '<span class=json-string>'
  r = pIndent or ''
  r = r.replace(/\s/g, '&nbsp;')
  if pKey
    r = r + key + pKey.replace(/[": ]/g, '') + '</span>: '
  if pVal
    r = r + (if pVal[0] is '"' then str else val) + pVal + '</span>'
  r += pEnd or ''
  r

prettyPrint = (obj, simplifiedVersion)->
  replacerToUse =  if simplifiedVersion then replacerSimplified else replacer
  jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,\[\{}\]]*)?$/mg
  JSON.stringify(obj, null, stringifyPadingSize)
  .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(jsonLine, replacerToUse)

load = ->
  try
    return unless document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)
    originBody = if document.body.children.length then $("pre").text() else document.body
    return unless originBody
    bang = JSON.parse originBody
    bangUri = new URI(document.location.href)
    originBangUri = bangUri
  catch ex
    console.log "Document not valid json, bang will not work: #{ex}"
    console.log "Bang can't work on HTML and XML pages"
    return
  render()

load()