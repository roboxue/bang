# Created by Robert Xue on 1/18/15.
bang = null
bangUri = null
queryResult = null
bangJsonView = null
originBody = null

class BangJsonPathFragment extends Backbone.Model
  getQueryFragment: ->
    # return valid javascript json navigation code fragment
    # if the pathFragment is in the form of 'array[]', return 'array'
    # if the pathFragment is in the form of ':key', return map(function(row){return row.key})
    # else, return as is. eg. 'array[1]' -> 'array[1]'
    arrayRx = /^(.+)\[]$/
    keyRx = /^:(.+)$/
    type = @getFragmentType()
    switch type
      when "ArrayRoot"
        [fullExpression, arrayName] = @get("fragment").match arrayRx
        arrayName
      when "ArrayKey"
        [fullExpression, keyName] = @get("fragment").match keyRx
        "map(function(row){return row.#{keyName};})"
      else
        @get("fragment")

  getFragmentType: ->
    arrayRx = /^(.+)\[]$/
    arrayElementRx = /^(.+)\[(\d+)]$/
    keyRx = /^:(.+)$/
    if arrayRx.test @get("fragment")
      "ArrayRoot"
    else if arrayElementRx.test @get("fragment")
      "ArrayElement"
    else if keyRx.test @get("fragment")
      "ArrayKey"
    else
      "Value"

  getArrayKeyName: ->
    keyRx = /^:(.+)$/
    if keyRx.test @get("fragment")
      [fullExpression, keyName] = @get("fragment").match keyRx
      keyName

  getArrayIndex: ->
    arrayElementRx = /^(.+)\[(\d+)]$/
    if arrayElementRx.test @get("fragment")
      [fullExpression, keyName, arrayIndex] = @get("fragment").match arrayElementRx
      [keyName, parseInt(arrayIndex)]

  getDisplayName: ->
    @get("fragment")

  getBaseFragment: ->
    # Determine the javascript json navigation code fragment
    # if the pathFragment is in the form of 'array[0]', return 'array[]'
    # else, return null
    arrayRx = /^(.+)\[(\d+)]$/
    if arrayRx.test @get("fragment")
      [fullName, arrayName] = @get("fragment").match arrayRx
      arrayName + "[]"

  getArrayFragment: (index)->
    # Determine the javascript json navigation code fragment for array element
    # if the pathFragment is in the form of 'array[]', return 'array[i]'
    # else, return null
    arrayRx = /^(.+)\[\d*]$/
    if arrayRx.test @get("fragment")
      [fullName, arrayName] = @get("fragment").match arrayRx
      arrayName + "[#{index}]"


class BangJsonPath extends Backbone.Collection
  model: BangJsonPathFragment

  initialize: (models, option)->
    if option and option.baseExpression
      @baseExpression = option.baseExpression
    else
      @baseExpression = models[0].get("fragment")

  getQuery: (path)->
    reducer = ((pv, cv, index, array)->
      return cv.getQueryFragment() if index is 0
      if cv.getFragmentType() is "Value"
        pv + "['#{cv.getQueryFragment()}']"
      else
        pv + "." + cv.getQueryFragment()
    )
    if path
      path.reduce reducer, ""
    else
      @reduce reducer, ""

  getDisplayedQuery: ->
    reducer = ((pv, cv, index, array)->
      return pv if index is 0
      if cv.getFragmentType() is "Value"
        pv + "['#{cv.getQueryFragment()}']"
      else
        pv + "." + cv.getQueryFragment()
    )
    @reduce reducer, @baseExpression

  navigateTo: (index)->
    while @models.length > Math.max(index + 1, 0)
      @pop()
    @trigger "path:update"

  navigateToArrayElement: (index)->
    if arrayFragment = @last().getArrayFragment(index)
      @last().set "fragment", arrayFragment
      @trigger "path:update"

class BangJsonView extends Backbone.View
  model: BangJsonPath

  render: ->
    root  = d3.select(@el)
    header = root.append("div").attr("class", "panel-heading")
    header.append("span").attr("class", "panel-title").text("JSON Navigator")
    panelBody = root.append("div").attr("class", "panel-body")
    # For rendering json path
    @breadcrumbUl = panelBody.append("ul").attr("class", "breadcrumb")
    # For rendering actual value
    @codeBlockPre = panelBody.append("pre")
    $(@codeBlockPre.node()).hide()
    # For rendering array contents
    @arrayContentTable = root.append("table").attr("class", "table")
    # For rendering array index selector
    @indexSelectorDiv = root.append("div").attr("class", "panel-footer").append("div").attr("class", "form-inline")

    @listenTo @model, "path:update", @updateNavigator

  updateNavigator: (option)->
    @clear()
    path = @model
    query = path.getQuery()
    {error, result} = runQuery query
    $("#query").val path.getDisplayedQuery() unless option and option.silent
    return @breadcrumbUl.text JSON.stringify(error, null, 4) if error
    @breadcrumbUl.selectAll("li").data(@model.models).enter().append("li").each (pathFragment, i)->
      if i is 0 and pathFragment.getDisplayName() is "bang"
        return d3.select(this).append("strong").text(pathFragment.getDisplayName())
      if i is path.length - 1
        # return a link to the array base for an array item at the last position
        if pathFragment.getBaseFragment()
          d3.select(this).append("a").attr("href", "#").text(pathFragment.getDisplayName()).on "click", ->
            d3.event.preventDefault()
            path.last().set "fragment", pathFragment.getBaseFragment()
            path.trigger "path:update"
        else
          # return a static span for the last element in the path which is not an array item
          d3.select(this).append("span").text(pathFragment.getDisplayName())
      else
        # return a link to the path for everything in the path
        d3.select(this).append("a").attr("href", "#").text(pathFragment.getDisplayName()).on "click", ->
          d3.event.preventDefault()
          path.navigateTo i

    type = path.last().getFragmentType()
    if result instanceof Array
      if type is "ArrayRoot"
        @updateArrayContent result
      else if type is "ArrayKey"
        @updateArrayPluckView result, path.last().getArrayKeyName()
    else if result instanceof Object
      @updateKeyValuePair result
    else
      @codeBlockPre.html(prettyPrint(result))
      $(@codeBlockPre.node()).show()
    if type is "ArrayElement"
      @updateArrayNavigator path.last().getArrayIndex()

  updateArrayNavigator: ([arrayName, arrayIndex])->
    pager = @indexSelectorDiv.append("nav").append("ul").attr("class", "pager")
    query = bangJsonView.model.getQuery bangJsonView.model.slice(0, bangJsonView.model.length - 1).concat(new BangJsonPathFragment({fragment: arrayName + "[]"}))
    maxLength = eval(query).length
    if arrayIndex > 0
      pager.append("li").attr("class", "previous").append("a").attr("href", "#").html("&larr;Previous").on "click", ->
        d3.event.preventDefault()
        bangJsonView.model.navigateToArrayElement arrayIndex - 1
    else
      pager.append("li").attr("class", "previous disabled").append("a").attr("href", "#").html("&larr;Previous")
    pager.append("li").html("#{arrayIndex + 1} / #{maxLength}")
    if arrayIndex < maxLength - 1
      pager.append("li").attr("class", "next").append("a").attr("href", "#").html("Next&rarr;").on "click", ->
        d3.event.preventDefault()
        bangJsonView.model.navigateToArrayElement arrayIndex + 1
    else
      pager.append("li").attr("class", "next disabled").append("a").attr("href", "#").html("Next&rarr;")

  updateKeyValuePair: (result)->
    @arrayContentTable.append("thead").html """
      <thead><tr>
        <th>Key</th><th>Value</th>
      </tr></thead>
    """
    @arrayContentTable.append("tfoot").selectAll("tr").data(Object.keys(result)).enter().append("tr").each (key)->
      if not (result[key] instanceof Array or result[key] instanceof Object)
        d3.select(this).append("th").text key
        d3.select(this).append("td").text(result[key] or "(empty)")
      else
        pathFragment = getPathFragmentForKey(result, key)
        d3.select(this).append("th").append("a").attr("href", "#").text(pathFragment.get("fragment"))
        .on("click", ->
          d3.event.preventDefault()
          bangJsonView.model.add pathFragment
          bangJsonView.model.trigger "path:update"
        )
        if result[key] instanceof Array
          d3.select(this).append("td").text "Array with #{result[key].length} elements"
        else
          d3.select(this).append("td").text "Object with #{_.size(result[key])} key value pairs"

  updateArrayContent: (result)->
    if result.length is 0
      @indexSelectorDiv.html "<span>Empty array</span>"
    else
      @indexSelectorDiv.append("div").attr("class", "input-group").html """
        <span class="input-group-addon">Element No.</span>
        <input type='number' class='form-control' id='arrayIndex' value='0' min='0' max='#{result.length-1}'>
        <span class="input-group-addon">/ #{result.length}</span>
      """
      @indexSelectorDiv.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go")
      .on("click", ->
        d3.event.preventDefault()
        index = $("#arrayIndex").val()
        bangJsonView.model.navigateToArrayElement(index)
      )
      keyStats = {}
      result.forEach (row)->
        _.keys(row).forEach (key)->
          keyStats[key] = (keyStats[key] or 0) + 1
      if _.size(keyStats) > 0
        @updateArraySchemaTable _.pairs(keyStats), result
      else
        @codeBlockPre.html(prettyPrint(result))
        $(@codeBlockPre.node()).show()

  updateArrayPluckView: (result, key)->
    @arrayContentTable.append("thead").html """
      <thead><tr>
        <th>Index</th><th>Value</th>
      </tr></thead>
    """
    @arrayContentTable.append("tfoot").selectAll("tr").data(result).enter().append("tr").each (value, i)->
      d3.select(this).append("th").append("a").attr("href", "#").text("Element #{i}").on "click", ->
        d3.event.preventDefault()
        bangJsonView.model.pop()
        bangJsonView.model.navigateToArrayElement i
        bangJsonView.model.push({fragment: key}) if value instanceof Object
        bangJsonView.model.trigger "path:update"
      if value instanceof Object
        d3.select(this).append("td").append("pre").html(prettyPrint(value) or "(empty)")
      else
        d3.select(this).append("td").text(value or "(empty)")

  updateArraySchemaTable: (keyStats, array)->
    @arrayContentTable.append("thead").html """
      <thead><tr>
        <th>Key</th><th>Times occurred in elements</th>
      </tr></thead>
    """
    rows = @arrayContentTable.append("tfoot").selectAll("tr").data(keyStats).enter().append("tr")
    rows.append("th").append("a").attr("href", "#").text(([key])-> key).on "click", ([key])->
      d3.event.preventDefault()
      bangJsonView.model.push new BangJsonPathFragment {fragment: ":#{key}"}
      bangJsonView.model.trigger "path:update"
    rows.append("td").text(([key, times])-> "#{times} (#{(100 * times / array.length).toFixed(0)}%)")

  clear: ->
    @breadcrumbUl.text ""
    @indexSelectorDiv.text ""
    @codeBlockPre.text ""
    $(@codeBlockPre.node()).hide()
    @arrayContentTable.text ""

render = ->
  console.log "Bang will make your life with JSON easier!"
  root = d3.select("body").text("").append("div").attr("class", "container")
  renderHeader root.append("div").attr("class", "navbar navbar-default")
  queryRow = root.append("div").attr("class", "row")
  responseRow = root.append("div").attr("class", "row")
  bangJsonView = new BangJsonView {
    model: new BangJsonPath [new BangJsonPathFragment({fragment: "bang"})]
    el: queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "navigatorPanel").node()
  }
  bangJsonView.render()
  renderQuery queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel")
  renderResponse responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success")
  $(".panel-heading")
  $(".panel-toggle").click (ev)->
    ev.preventDefault()
    $(ev.currentTarget).parent().siblings(".panel-body").toggle()
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'), type: "text/css"})
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bang.css'), type: "text/css"})
  bangJsonView.model.trigger "path:update"

renderHeader = (root)->
  root.html """
  <div class="navbar-header">
    <a class="navbar-brand" href="http://github.com/roboxue/bang">Bang
      <ruby>
       棒 <rt> Bàng</rt>
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

renderResponse = (root)->
  header = root.append("div").attr("class", "panel-heading")
  header.append("span").attr("class", "panel-title").html("Response from <code>#{bangUri}</code> stored into <code class='bang'>bang</code>")
  header.append("div").attr("class", "panel-toggle pull-right").text("toggle")
  root.append("div").attr("class", "panel-body").append("div").attr("id", "rawResponse").html prettyPrint(bang)
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
    if childSiblings
      if node.data("folded") is false
        node.data("folded", true)
        node.find(".glyphicon").removeClass("glyphicon-minus").addClass("glyphicon-plus").text("")
        childSiblings.hide()
        childSiblings.each ->
          foldedTimes = if $(this).data("folds") then parseInt($(this).data("folds")) + 1 else 1
          $(this).data("folds", foldedTimes)
      else
        node.data("folded", false)
        node.find(".glyphicon").removeClass("glyphicon-plus").addClass("glyphicon-minus").text("")
        childSiblings.each ->
          foldedTimes = if $(this).data("folds") then parseInt($(this).data("folds")) - 1 else 0
          $(this).data("folds", foldedTimes)
          $(this).show() if foldedTimes is 0

renderQuery = (root)->
  header = root.append("div").attr("class", "panel-heading")
  header.append("span").attr("class", "panel-title").html("Custom JavaScript Query")
  renderQueryForm root.append("div").attr("class", "panel-body")

didRunQuery = ->
  query = $("#query").val()
  bangJsonView.clear()
  { error, result } = runQuery query
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

didReset = ->
  $("#query").val "bang"
  bangJsonView.model.baseExpression = "bang"
  bangJsonView.model.set {fragment: "bang"}
  bangJsonView.model.trigger "path:update"

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

renderQueryForm = (root)->
  root.html("""
<div class="form-horizontal">
  <div class="form-group">
    <label for="query" class="col-sm-2 control-label">Query</label>
    <div class="col-sm-10">
      <textarea class="form-control" id="query" placeholder="Any Javascript Expression!"></textarea>
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button type="submit" class="btn btn-default" id="runQuery">Run it!</button>
      <button type="reset" class="btn btn-default" id="reset">Reset</button>
    </div>
  </div>
</div>
""")

  $("#runQuery").click didRunQuery
  $("#reset, .bang").click didReset

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
  "<p data-folded='false' data-index='#{index}' class='json-row'><span class='glyphicon col-sm-1'></span><span class='col-sm-11 json-content'>#{r + (pEnd or '')}</span></p>"

prettyPrint = (obj)->
  jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,\[\{}\]]*)?$/mg
  JSON.stringify(obj, null, stringifyPadingSize)
  .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(jsonLine, replacer)

load = ->
  try
    return unless document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)
    originBody = if document.body.children.length then $("pre").text() else document.body
    return unless originBody
    bang = JSON.parse originBody
    bangUri = document.location.href
  catch ex
    console.log "Document not valid json, bang will not work: #{ex}"
  console.log "Bang can't work on HTML and XML pages"
  render()

load()