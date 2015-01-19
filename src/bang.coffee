# Created by Robert Xue on 1/18/15.
bang = {}
render = ->
  console.log "Bang will make your life with JSON easier!"
  root = d3.select("body").text("").append("div").attr("class", "container")
  renderHeader root.append("div").attr("class", "navbar navbar-default")
  queryRow = root.append("div").attr("class", "row")
  navigatorRow = root.append("div").attr("class", "row")
  responseRow = root.append("div").attr("class", "row")
  renderQuery queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel")
  renderResult queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "resultPanel")
  renderNavigator navigatorRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success").attr("id", "navigatorPanel")
  renderResponse responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success")
  $(".panel-heading").css({cursor: "pointer", "word-break": "break-all"}).click (ev)->
    $(ev.currentTarget).siblings(".panel-body").toggle()
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'), type: "text/css"})

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
  {data, uri} = bang
  header = root.append("div").attr("class", "panel-heading").html("Response from <code>#{uri}</code> stored into bang.data")
  root.append("div").attr("class", "panel-body").append("pre").text(JSON.stringify(data, null, 4))

renderQuery = (root)->
  root.append("div").attr("class", "panel-heading").text("Query")
  renderQueryForm root.append("div").attr("class", "panel-body")

renderResult = (root)->
  root.append("div").attr("class", "panel-heading").text("Result")
  root.append("div").attr("class", "panel-body").append("pre").attr("id", "queryResult")

renderNavigator = (root)->
  root.append("div").attr("class", "panel-heading").text("Response Navigator")
  panelBody = root.append("div").attr("class", "panel-body")
  panelBody.append("ul").attr("class", "breadcrumb")
  panelBody.append("div").attr("class", "form-inline")
  panelBody.append("pre")
  root.append("ul").attr("class", "list-group")
  root.append("table").attr("class", "table")
  updateNavigator ["bang.data"]

didRunQuery = ->
  query = $("#query").val()
  runQuery query

runQuery = (query)->
  try
    $("#query").val query
    result = eval query
    if result is undefined
      $("#queryResult").text "(undefined)"
      return {error: "(undefined)"}
    else
      $("#queryResult").text JSON.stringify(result, null, 4)
      return {result}
  catch ex
    $("#queryResult").text ex
    return {error: ex}

updateNavigator = (path)->
  navigator = d3.select("#navigatorPanel .breadcrumb").text ""
  arrayNavigatior = d3.select("#navigatorPanel .form-inline").text ""
  autocomplete = d3.select("#navigatorPanel .list-group").text ""
  autocompleteTable = d3.select("#navigatorPanel table").text ""
  codeBlock = d3.select("#navigatorPanel pre").text ""
  query = getQueryFromPath path
  console.log "Update Navigator", path, query
  {error, result} = runQuery query
  return navigator.text JSON.stringify(error, null, 4) if error
  navigator.selectAll("li").data(path).enter().append("li").each (pathFragment, i)->
    if i is path.length - 1
      d3.select(this).attr("class", "active").text(pathFragment)
    else
      d3.select(this).append("a").attr("href", "#").text(pathFragment).on "click", (currentPathFragment)->
        console.log path, i
        updateNavigator path.slice(0, i + 1)
  if result instanceof Array
    arrayNavigatior.append("div").attr("class", "form-group").html """
    <label for='arrayIndex'>Name</label>
    <input type='number' class='form-control' id='arrayIndex' value='0' min='0' max='#{result.length-1}'>
    """
    arrayNavigatior.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go")
    .on("click", ->
      d3.event.preventDefault()
      arrayIndex = $("#arrayIndex").val()
      node = path[path.length - 1].match /(\w*)\[(\d*)]$/
      updateNavigator path.slice(0, path.length - 1).concat node[1] + "[#{arrayIndex}]"
    )
  else if result instanceof Object
    autocomplete.selectAll("li").data(Object.keys(result)).enter()
    .append("li").attr("class", "list-group-item").append("a").attr("href", "#").text((key)-> getPathFragmentForKey(result, key))
    .on("click", (key, i)->
      d3.event.preventDefault()
      pathFragment = getPathFragmentForKey result, key
      updateNavigator path.concat(pathFragment)
    )
  else
    codeBlock.text JSON.stringify(result, null, 4)

getQueryFromPath = (path)->
  query = path.reduce ((pv, cv, index, array)->
    if index isnt 0
      pv += "."
    if node = cv.match /(\w*)#$/
      pv += node[1]
    else if node = cv.match /(\w*)\[(\d*)]$/
      pv += node[1]
      pv += "[#{node[2]}]" if node[2]
      pv
    else
      pv += cv
  ), ""
  query

getPathFragmentForKey = (data, key)->
  if data[key] instanceof Array
    return key + "[]"
  else if data[key] instanceof Object
    return key
  else
    return key + "#"

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
    </div>
  </div>
</div>
""")
  if bang.data instanceof Array
    $("#query").val("_.size(bang.dat)")
  else
    $("#query").val("_.keys(bang.data)")

  $("#runQuery").click didRunQuery

load = ->
  try
    return unless document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)
    data = if document.body.children.length then $("pre").text() else document.body
    return unless data
    bang.data = JSON.parse data
    bang.uri = document.location.href
  catch ex
    console.warn "Document not valid json, bang will not work: #{ex}"
  console.warn "Bang can't work on HTML and XML pages"
  render()

load()