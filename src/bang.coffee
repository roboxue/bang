# Created by Robert Xue on 1/18/15.
bang = {}
render = ->
  console.log "Bang will make your life with JSON easier!"
  root = d3.select("body").text("").append("div").attr("class", "container")
  renderHeader root.append("div").attr("class", "navbar navbar-default")
  queryRow = root.append("div").attr("class", "row")
  renderResponse root.append("div").attr("class", "row").append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success")
  renderQuery queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel")
  renderResult queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "resultPanel")
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


runQuery = ->
  query = $("#query").val()
  try
    result = eval query
    if result is undefined
      $("#queryResult").text "(undefined)"
    else
      $("#queryResult").text JSON.stringify(result, null, 4)
  catch ex
    $("#queryResult").text ex

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

  $("#runQuery").click runQuery



load = ->
  try
    if document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)
      data = if document.body.children.length then $("pre").text() else document.body
      if data
        bang.data = JSON.parse data
        bang.uri = document.location.href
        return render()
  catch ex
    console.warn "Document not valid json, bang will not work: #{ex}"
  console.warn "Bang can't work on HTML and XML pages"

load()