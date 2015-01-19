# Created by Robert Xue on 1/18/15.
bang = null
bangUri = null
queryResult = null
render = ->
  console.log "Bang will make your life with JSON easier!"
  root = d3.select("body").text("").append("div").attr("class", "container")
  renderHeader root.append("div").attr("class", "navbar navbar-default")
  queryRow = root.append("div").attr("class", "row")
  responseRow = root.append("div").attr("class", "row")
  renderQuery queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel")
  renderNavigator queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success").attr("id", "navigatorPanel")
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
  header = root.append("div").attr("class", "panel-heading").html("Response from <code>#{bangUri}</code> stored into bang")
  root.append("div").attr("class", "panel-body").append("pre").text(JSON.stringify(bang, null, 4))

renderQuery = (root)->
  root.append("div").attr("class", "panel-heading").text("Query")
  renderQueryForm root.append("div").attr("class", "panel-body")

renderNavigator = (root)->
  root.append("div").attr("class", "panel-heading").text("Response Navigator")
  panelBody = root.append("div").attr("class", "panel-body")
  panelBody.append("ul").attr("class", "breadcrumb")
  panelBody.append("div").attr("class", "form-inline")
  panelBody.append("pre").style("display", "none")
  root.append("ul").attr("class", "list-group")
  root.append("table").attr("class", "table")
  updateNavigator ["bang"]

didRunQuery = ->
  query = $("#query").val()
  navigator = d3.select("#navigatorPanel .breadcrumb").text ""
  arrayNavigatior = d3.select("#navigatorPanel .form-inline").text ""
  autocomplete = d3.select("#navigatorPanel .list-group").text ""
  autocompleteTable = d3.select("#navigatorPanel table").text ""
  codeBlock = d3.select("#navigatorPanel pre").style("display", "none").text ""
  { error, result } = runQuery query
  if error
    codeBlock.text error
  else
    queryResult = result
    updateNavigator ["queryResult"]

runQuery = (query, options)->
  try
    unless options and options.silent
      $("#query").val query
    result = eval query
    if result is undefined
      return {error: "(undefined)"}
    else
      return {result}
  catch ex
    return {error: ex}

updateNavigator = (path)->
  navigator = d3.select("#navigatorPanel .breadcrumb").text ""
  arrayNavigatior = d3.select("#navigatorPanel .form-inline").text ""
  autocomplete = d3.select("#navigatorPanel .list-group").text ""
  autocompleteTable = d3.select("#navigatorPanel table").text ""
  codeBlock = d3.select("#navigatorPanel pre").style("display", "none").text ""
  query = getQueryFromPath path
  console.log "Update Navigator", path, query
  {error, result} = runQuery query, {silent: true}
  return navigator.text JSON.stringify(error, null, 4) if error
  navigator.selectAll("li").data(path).enter().append("li").each (pathFragment, i)->
    d3.select(this).append("a").attr("href", "#").text(pathFragment).on "click", (currentPathFragment)->
      d3.event.preventDefault()
      if node = pathFragment.match(/^(.*)\[(\d+)]$/)
        updateNavigator path.slice(0, i).concat node[1] + "[]"
      else
        updateNavigator path.slice(0, i + 1)
  if result instanceof Array
    arrayNavigatior.append("div").attr("class", "form-group").html """
    <label for='arrayIndex'>Index (0 - #{result.length-1})</label>
    <input type='number' class='form-control' id='arrayIndex' value='0' min='0' max='#{result.length-1}'>
    """
    arrayNavigatior.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go")
    .on("click", ->
      d3.event.preventDefault()
      arrayIndex = $("#arrayIndex").val()
      node = path[path.length - 1].match(/^(.*)\[(\d*)]$/)
      pathFragment = if node then node[1] else path[path.length - 1]
      updateNavigator path.slice(0, path.length - 1).concat pathFragment + "[#{arrayIndex}]"
    )
  else if result instanceof Object
    autocomplete.selectAll("li").data(Object.keys(result)).enter()
    .append("li").attr("class", "list-group-item").each (key)->
      if not (result[key] instanceof Array or result[key] instanceof Object)
        d3.select(this).append("span").text key
        d3.select(this).append("span").attr("class", "pull-right").text result[key]
      else
        pathFragment = getPathFragmentForKey(result, key)
        d3.select(this).append("a").attr("href", "#").text(pathFragment)
        .on("click", ->
          d3.event.preventDefault()
          updateNavigator path.concat(pathFragment)
        )
  else
    codeBlock.style("display", null).text JSON.stringify(result, null, 4)

getQueryFromPath = (path)->
  query = path.reduce ((pv, cv, index, array)->
    if index isnt 0
      pv += "."
    if node = cv.match /^(.*)\[(\d*)]$/
      console.log node
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
  if bang instanceof Array
    $("#query").val("_.size(bang)")
  else
    $("#query").val("_.keys(bang)")

  $("#runQuery").click didRunQuery

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