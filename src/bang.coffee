# Created by Robert Xue on 1/18/15.
bang = null
bangUri = null
queryResult = null
bangJsonView = null

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
    arrayElementRx = /^(.+)\[\d+]$/
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
    [fullExpression, keyName] = @get("fragment").match keyRx
    keyName

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
    arrayRx = /^(.+)\[]$/
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

  getQuery: ->
    @reduce ((pv, cv, index, array)->
      if index > 0
        pv += "."
      pv += cv.getQueryFragment()
    ), ""

  getDisplayedQuery: ->
    @reduce ((pv, cv, index, array)->
      if index > 0
        pv += "." + cv.getQueryFragment()
      else
        pv
    ), @baseExpression

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
    root.append("div").attr("class", "panel-heading").text("Response Navigator")
    panelBody = root.append("div").attr("class", "panel-body")
    # For rendering json path
    @breadcrumbUl = panelBody.append("ul").attr("class", "breadcrumb")
    # For rendering array index selector
    @indexSelectorDiv = panelBody.append("div").attr("class", "form-inline")
    # For rendering actual value
    @codeBlockPre = panelBody.append("pre").style("display", "none")
    # For rendering key value pairs
    @keyValuePairUl = root.append("ul").attr("class", "list-group")
    # For rendering array contents
    @arrayContentTable = root.append("table").attr("class", "table")

    @listenTo @model, "path:update", @updateNavigator

  updateNavigator: (option)->
    @clear()
    path = @model
    query = path.getQuery()
    console.log "Update Navigator", @model.models, query
    {error, result} = runQuery query
    $("#query").val path.getDisplayedQuery() unless option and option.silent
    return @breadcrumbUl.text JSON.stringify(error, null, 4) if error
    @breadcrumbUl.selectAll("li").data(@model.models).enter().append("li").each (pathFragment, i)->
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

    if result instanceof Array
      type = path.last().getFragmentType()
      switch type
        when "ArrayRoot"
          @updateArrayContent result
        when "ArrayElement"
          @updateArrayContent result
        when "ArrayKey"
          @updateArrayPluckView result, path.last().getArrayKeyName()
    else if result instanceof Object
      @updateKeyValuePair result
    else
      @codeBlockPre.style("display", null).text JSON.stringify(result, null, 4)

  updateKeyValuePair: (result)->
    @keyValuePairUl.selectAll("li").data(Object.keys(result)).enter()
    .append("li").attr("class", "list-group-item").each (key)->
      if not (result[key] instanceof Array or result[key] instanceof Object)
        d3.select(this).append("strong").text key
        d3.select(this).append("span").attr("class", "pull-right").text result[key]
      else
        pathFragment = getPathFragmentForKey(result, key)
        d3.select(this).append("strong").append("a").attr("href", "#").text(pathFragment.get("fragment"))
        .on("click", ->
          d3.event.preventDefault()
          bangJsonView.model.add pathFragment
          console.log "Add", pathFragment, bangJsonView.model.models
          bangJsonView.model.trigger "path:update"
        )
        if result[key] instanceof Array
          d3.select(this).append("span").attr("class", "pull-right").text "Array with #{result[key].length} elements"
        else
          d3.select(this).append("span").attr("class", "pull-right").text "Object with #{_.size(result[key])} key value pairs"

  updateArrayContent: (result)->
    if result.length is 0
      @indexSelectorDiv.append("div").attr("class", "form-group").html "<span>Empty array</span>"
    else
      @indexSelectorDiv.append("div").attr("class", "form-group").html """
        <span>Array with #{result.length} elements</span>
        <input type='number' class='form-control' id='arrayIndex' value='0' min='0' max='#{result.length-1}'>
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

  updateArrayPluckView: (result, key)->
    console.log "Pluck View"
    @keyValuePairUl.selectAll("li").data(result).enter()
    .append("li").attr("class", "list-group-item").each (value, i)->
      d3.select(this).append("strong").append("a").attr("href", "#").text("Element #{i}").on "click", ->
        bangJsonView.model.pop()
        bangJsonView.model.navigateToArrayElement i
        bangJsonView.model.push({fragment: key}) if value instanceof Object
        bangJsonView.model.trigger "path:update"
      if value instanceof Object
        d3.select(this).append("pre").text JSON.stringify(value, null, 4)
      else
        d3.select(this).append("span").attr("class", "pull-right").text value

  updateArraySchemaTable: (keyStats, array)->
    @arrayContentTable.append("thead").html """
      <thead><tr>
        <th>Key</th><th>Times occurred in elements</th>
      </tr></thead>
    """
    rows = @arrayContentTable.append("tfoot").selectAll("tr").data(keyStats).enter().append("tr")
    rows.append("td").append("a").attr("href", "#").text(([key])-> key).on "click", ([key])->
      d3.event.preventDefault()
      bangJsonView.model.push new BangJsonPathFragment {fragment: ":#{key}"}
      bangJsonView.model.trigger "path:update"
    rows.append("td").text(([key, times])-> "#{times} (#{(100 * times / array.length).toFixed(0)}%)")

  clear: ->
    @breadcrumbUl.text ""
    @indexSelectorDiv.text ""
    @codeBlockPre.style("display", "none").text ""
    @keyValuePairUl.text ""
    @arrayContentTable.text ""

render = ->
  console.log "Bang will make your life with JSON easier!"
  root = d3.select("body").text("").append("div").attr("class", "container")
  renderHeader root.append("div").attr("class", "navbar navbar-default")
  queryRow = root.append("div").attr("class", "row")
  responseRow = root.append("div").attr("class", "row")
  renderQuery queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel")
  bangJsonView = new BangJsonView {
    model: new BangJsonPath [new BangJsonPathFragment({fragment: "bang"})]
    el: queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success").attr("id", "navigatorPanel").node()
  }
  bangJsonView.render()
  renderResponse responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success")
  $(".panel-heading").css({cursor: "pointer", "word-break": "break-all"}).click (ev)->
    $(ev.currentTarget).siblings(".panel-body").toggle()
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'), type: "text/css"})
  bangJsonView.model.trigger "path:update"

renderHeader = (root)->
  root.html """
  <div class="navbar-header">
    <a class="navbar-brand" href="http://github.com/roboxue/bang">Bang!</a>
  </div>
  <div class="collapse navbar-collapse">
    <p class="navbar-text">Lightweight frontend json workspace</p>
  </div>
  """

renderResponse = (root)->
  header = root.append("div").attr("class", "panel-heading").html("Response from <code>#{bangUri}</code> stored into <strong>bang</strong>")
  root.append("div").attr("class", "panel-body").append("pre").text(JSON.stringify(bang, null, 4))

renderQuery = (root)->
  root.append("div").attr("class", "panel-heading").text("Query")
  renderQueryForm root.append("div").attr("class", "panel-body")

didRunQuery = ->
  query = $("#query").val()
  bangJsonView.clear()
  { error, result } = runQuery query
  console.log error, result
  if error
    bangJsonView.codeBlockPre.style("display", null).text error
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
  $("#reset").click didReset

load = ->
  try
    return unless document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)
    data = if document.body.children.length then $("pre").text() else document.body
    return unless data
    bang = JSON.parse data
    bangUri = document.location.href
  catch ex
    console.warn "Document not valid json, bang will not work: #{ex}"
  console.warn "Bang can't work on HTML and XML pages"
  render()

load()