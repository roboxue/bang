# Created by Robert Xue on 1/18/15.
bang = null
bangUri = null
originBangUri = null
queryResult = null
bangJsonView = null
originBody = null

class BangJsonPathFragment extends Backbone.Model
  getQueryFragment: ->
    # return valid javascript json navigation code fragment
    # if the pathFragment is in the form of 'array[]', return 'array'
    # if the pathFragment is in the form of '(method):key', return an udnerscore expression
    # else, return as is. eg. 'array[1]' -> 'array[1]'
    arrayRx = /^(.+)\[]$/
    keyRx = /(^|^countBy|^countByType):(.+)$/
    type = @getFragmentType()
    switch type
      when "ArrayRoot"
        [fullExpression, arrayName] = @get("fragment").match arrayRx
        { value:arrayName }
      when "ArrayKey"
        [fullExpression, method, keyName] = @get("fragment").match keyRx
        switch method
          when "countBy" then { underscore: "countBy('#{keyName}')" }
          when "countByType" then { underscore: "countBy(function(row){return typeof row['#{keyName}']})" }
          else { underscore: "pluck('#{keyName}')" }
      else
        { value: @get("fragment") }

  getFragmentType: ->
    arrayRx = /^(.+)\[]$/
    arrayElementRx = /^(.+)\[(\d+)]$/
    keyRx = /(^|^countBy|^countByType):(.+)$/
    if arrayRx.test @get("fragment")
      "ArrayRoot"
    else if arrayElementRx.test @get("fragment")
      "ArrayElement"
    else if keyRx.test @get("fragment")
      "ArrayKey"
    else
      "Value"

  getArrayKeyName: ->
    keyRx = /(^|^countBy|^countByType):(.+)$/
    if keyRx.test @get("fragment")
      [fullExpression, method, keyName] = @get("fragment").match keyRx
      {method, keyName}

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
    # if the pathFragment is in the form of 'helper:key', return ':key'
    # else, return null
    arrayRx = /^(.+)\[(\d+)]$/
    keyRx = /(^|^countBy|^countByType):(.+)$/
    if arrayRx.test @get("fragment")
      [fullName, arrayName] = @get("fragment").match arrayRx
      arrayName + "[]"
    else if keyRx.test @get("fragment")
      [fullExpression, method, keyName] = @get("fragment").match keyRx
      ":" + keyName if method

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

  getQuery: (path, forDisplay)->
    underscoreWrapped = false
    reducer = ((pv, cv, index, array)->
      if index is 0
        return pv or cv.getQueryFragment().value
      if cv.getFragmentType() is "Value"
        pv + "['#{cv.getQueryFragment().value}']"
      else
        { value, underscore } = cv.getQueryFragment()
        if value or underscoreWrapped
          pv + "." + value
        else
          underscoreWrapped = true
          "_.chain(#{pv})." + underscore
    )
    baseExpression = if forDisplay then @baseExpression or ""
    if path
      toReturn = path.reduce reducer, baseExpression
    else
      toReturn = @reduce reducer, baseExpression
    if underscoreWrapped
      toReturn + ".value()"
    else
      toReturn

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
    header.append("span").attr("class", "panel-title").html("JSON Navigator (Response has been stored into variable <code class='bang'>bang</code>)")
    panelBody = root.append("div").attr("class", "panel-body")
    # For rendering json path
    @breadcrumbUl = panelBody.append("ul").attr("class", "breadcrumb")
    @pageHeader = panelBody.append("div").attr("class", "page-header")
    @arrayToolbar = panelBody.append("div").attr("class", "btn-toolbar").attr("role", "toolbar")
    root.append("div").attr("class", "panel-footer")
    # For rendering actual value
    @codeBlockPre = root.append("div").attr("class", "panel-body").append("pre")
    $(@codeBlockPre.node()).hide()
    # For rendering array contents
    @arrayContentTable = root.append("table").attr("class", "table table-striped")
    # For rendering array index selector
    root.append("div").attr("class", "panel-footer")
    @indexSelectorDiv = root.selectAll(".panel-footer").append("div").attr("class", "form-inline")

    @listenTo @model, "path:update", @update

  update: (option)->
    @clear()
    query = @model.getQuery()
    {error, result} = runQuery query
    $("#query").val @model.getQuery(null, true) unless option and option.silent
    @updateNavigator {error, result}
    type = @model.last().getFragmentType()
    if result instanceof Array
      if type is "ArrayRoot"
        if result.length is 0
          @pageHeader.html "<h3>Empty array</h3>"
        else
          @pageHeader.html "<h3>Array with #{result.length} elements</h3>"
          @updateArrayContent result
      else if type is "ArrayKey"
        {keyName} = @model.last().getArrayKeyName()
        @pageHeader.html "<h3>Key \"#{keyName}\" in Array</h3>"
        @updateArrayPluckView result, keyName
    else if result instanceof Object
      if _.size(result) is 0
        @pageHeader.html "<h3>Empty Object</h3>"
        @codeBlockPre.html "<span>Empty Object</span>"
        $(@codeBlockPre.node()).show()
      else
        if type is "ArrayKey"
          {keyName, method} = @model.last().getArrayKeyName()
          @pageHeader.html "<h3>Count by \"#{keyName}\" in Array</h3>" if method is "countBy"
          @pageHeader.html "<h3>Count by the type of \"#{keyName}\" in Array</h3>" if method is "countByType"
        else
          @pageHeader.html "<h3>Object with #{_.size(result)} keys</h3>"
        @updateKeyValuePair result
    else
      @pageHeader.html "<h3>String Value</h3>"
      @codeBlockPre.html(prettyPrint(result, true))
      $(@codeBlockPre.node()).show()
    if type is "ArrayElement"
      @updateArrayNavigator @model.last().getArrayIndex()

  updateNavigator: ({error, result})->
    path = @model
    return @breadcrumbUl.text JSON.stringify(error, null, 4) if error
    @breadcrumbUl.selectAll("li").data(@model.models).enter().append("li").each (pathFragment, i)->
      if i is path.length - 1
        # return a link to the base from for the last position if it has base form
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

  updateKeyValuePair: (result, option)->
    thead = @arrayContentTable.append("thead").append("tr")
    rows = @arrayContentTable.append("tbody").selectAll("tr").data(Object.keys(result)).enter().append("tr").each (key)->
      if not (result[key] instanceof Array or result[key] instanceof Object)
        d3.select(this).append("th").text key
        d3.select(this).append("td").text if result[key]? then result[key].toString() else "null"
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
    thead.append("th").attr("class", "sortable").html("Key<span class='glyphicon glyphicon-sort'></span>")
    .on "click", ->
      icon = $(this).find(".glyphicon").removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt glyphicon-sort-by-alphabet")
      if icon.attr("aria-sort") is "ascending"
        sortDescription = "descending"
        iconClass = "glyphicon-sort-by-alphabet-alt"
      else
        sortDescription = "ascending"
        iconClass = "glyphicon-sort-by-alphabet"
      icon.attr("aria-sort", sortDescription).addClass(iconClass)
      rows.sort d3[sortDescription]
    thead.append("th").text("Value")

  updateArrayContent: (result)->
    @indexSelectorDiv.append("div").attr("class", "input-group").html """
      <span class="input-group-addon">Element No.</span>
      <input type='number' class='form-control' id='arrayIndex' value='1' min='1' max='#{result.length}'>
      <span class="input-group-addon">/ #{result.length}</span>
    """
    @indexSelectorDiv.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go")
    .on("click", ->
      d3.event.preventDefault()
      index = parseInt($("#arrayIndex").val()) - 1
      bangJsonView.model.navigateToArrayElement(index)
    )
    keyStats = _.chain(result).map((row)-> _.compact(_.keys(row))).flatten().unique().map((key)->
      types = _.countBy result, (row)-> typeof row[key]
      {key, types}
    ).value()
    if keyStats.length > 0
      @updateArraySchemaTable keyStats, result
    else
      @codeBlockPre.html(prettyPrint(result, true))
      $(@codeBlockPre.node()).show()

  updateArrayPluckView: (result, key)->
    thead = @arrayContentTable.append("thead").append("tr")
    tbody = @arrayContentTable.append("tbody")
    # if all values are string, we can display a countBy button
    containsObject = false
    rows = tbody.selectAll("tr").data(result).enter().append("tr").each (value, i)->
      tr = d3.select(this)
      tr.attr "data-index", i
      tr.append("th").append("a").attr("href", "#").text("Element #{i}").on "click", ->
        d3.event.preventDefault()
        bangJsonView.model.pop()
        bangJsonView.model.navigateToArrayElement i
        bangJsonView.model.push({fragment: key}) if value instanceof Object
        bangJsonView.model.trigger "path:update"
      if value instanceof Object
        containsObject = true
        tr.append("td").append("pre").html(prettyPrint(value, true) or "{}")
        tr.attr("data-value", "object")
      else
        valueString = if value? then value.toString() else "null"
        tr.append("td").text valueString
        tr.attr "data-value", valueString
    sortHelper = (iconSpan, field)->
      iconSpan.parents("tr").find(".sortable .glyphicon").removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt glyphicon-sort-by-alphabet")
      if iconSpan.attr("aria-sort") is "ascending"
        sortDescription = "descending"
        iconClass = "glyphicon-sort-by-alphabet-alt"
      else
        sortDescription = "ascending"
        iconClass = "glyphicon-sort-by-alphabet"
      iconSpan.attr("aria-sort", sortDescription).addClass(iconClass)
      $(tbody.node()).children("tr").sort((a,b)->
        d3[sortDescription]($(a).data(field), $(b).data(field))
      ).detach().appendTo($(tbody.node()))
    thead.append("th").attr("class", "sortable").html("Index<span class='glyphicon glyphicon-sort'></span>")
    .on "click", ->
      sortHelper $(this).find(".glyphicon"), "index"
    thead.append("th").attr("class", "sortable").html("Value<span class='glyphicon glyphicon-sort'></span>")
    .on "click", ->
      sortHelper $(this).find(".glyphicon"), "value"
    unless containsObject
      toolbar = @arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group")
      toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Value").on "click", ->
        d3.event.preventDefault()
        bangJsonView.model.pop()
        bangJsonView.model.push new BangJsonPathFragment {fragment: "countBy:#{key}"}
        bangJsonView.model.trigger "path:update"
      toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Type").on "click", ->
        d3.event.preventDefault()
        bangJsonView.model.pop()
        bangJsonView.model.push new BangJsonPathFragment {fragment: "countByType:#{key}"}
        bangJsonView.model.trigger "path:update"

  updateArraySchemaTable: (keyStats, array)->
    thead = @arrayContentTable.append("thead").append("tr")
    rows = @arrayContentTable.append("tbody").selectAll("tr").data(keyStats).enter().append("tr")
    rows.append("th").append("a").attr("href", "#").text(({key})-> key).on "click", ({key})->
      d3.event.preventDefault()
      bangJsonView.model.push new BangJsonPathFragment {fragment: ":#{key}"}
      bangJsonView.model.trigger "path:update"
    rows.append("td").text(({key, types})->
      times = _.reduce(_.values(types), ((memo, num)-> memo + num), 0)
      "#{times} (#{(100 * times / array.length).toFixed(0)}%) -- " + JSON.stringify(types)
    )
    thead.append("th").attr("class", "sortable").html("Key<span class='glyphicon glyphicon-sort'></span>")
    .on "click", ->
      icon = $(this).find(".glyphicon")
      if icon.attr("aria-sort") is "ascending"
        icon.attr("aria-sort", "descending").addClass("glyphicon-sort-by-alphabet-alt").removeClass("glyphicon-sort-by-alphabet")
        rows.sort (a, b)->
          d3.descending a[0], b[0]
      else
        icon.attr("aria-sort", "ascending").addClass("glyphicon-sort-by-alphabet").removeClass("glyphicon-sort-by-alphabet-alt")
        rows.sort (a, b)->
          d3.ascending a[0], b[0]
    thead.append("th").text("Times occurred in elements")

  clear: ->
    @breadcrumbUl.text ""
    @indexSelectorDiv.text ""
    @pageHeader.text ""
    @codeBlockPre.text ""
    @arrayToolbar.text ""
    $(@codeBlockPre.node()).hide()
    @arrayContentTable.text ""

render = ->
  console.log "Bang will make your life with JSON easier!"
  root = d3.select("body").text("").append("div").attr("class", "container")
  renderHeader root.append("div").attr("class", "navbar navbar-default")
  queryRow = root.append("div").attr("class", "row")
  responseRow = root.append("div").attr("class", "row")
  bangJsonView = new BangJsonView {
    model: new BangJsonPath [new BangJsonPathFragment({fragment: if bang instanceof Array then "bang[]" else "bang"})], {baseExpression: "bang"}
    el: queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default panel-primary").attr("id", "navigatorPanel").node()
  }
  bangJsonView.render()
  renderQuery queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel")
  renderResponse responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success")
  $(".panel-heading")
  $(".panel-toggle").click (ev)->
    ev.preventDefault()
    $(ev.currentTarget).parent().siblings(".panel-body").toggle()
    if $("#rawResponse").is(":visible") and $("#rawResponse").is(":empty")
      renderRawResponseJSON()
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'), type: "text/css"})
  root.append("link").attr({rel: "stylesheet", href: chrome.extension.getURL('lib/bang.css'), type: "text/css"})
  bangJsonView.model.trigger "path:update"
  $("#runQuery").click didRunQuery
  $("#reset, .bang").click didReset

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

renderResponse = (root)->
  header = root.append("div").attr("class", "panel-heading")
  header.append("span").attr("class", "panel-title").html("Response from <code>#{bangUri.href()}</code> stored into <code class='bang'>bang</code>")
  header.append("div").attr("class", "panel-toggle pull-right").text("toggle details")
  renderUri root.append("div").attr("class", "form-horizontal panel-footer").attr("id", "uri")
  root.append("div").attr("class", "panel-body").style("display", "none").append("div").attr("id", "rawResponse")

renderUri = (root)->
  root.html """
    <div class="form-group" data-key="protocol">
      <label class="control-label col-sm-2">Protocol</label>
      <div class="col-sm-10"><p class="form-control-static">#{bangUri.protocol()}</p></div>
    </div>
    <div class="form-group has-feedback" data-key="hostname">
      <label for="uriHostname" class="control-label col-sm-2">Hostname</label>
      <div class="col-sm-10">
        <input type="text" class="form-control" id="uriHstname" placeholder="#{bangUri.hostname() or 'www.myhost.com'}">
        <span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span>
      </div>
    </div>
    <div class="form-group has-feedback" data-key="port">
      <label for="uriPort" class="control-label col-sm-2">Port</label>
      <div class="col-sm-10">
        <input type="number" min="0" max="99999" class="form-control" id="uriPort" placeholder="#{bangUri.port() or '80'}">
        <span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span>
      </div>
    </div>
    <div class="form-group has-feedback" data-key="path">
      <label for="uriPath" class="col-sm-2 control-label">Path
      </label>
      <div class="col-sm-10">
        <input type="text" class="form-control" id="uriPath" placeholder="#{bangUri.path() or '(/path)'}">
        <span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span>
      </div>
    </div>
    <div class="form-group has-feedback" data-key="hash">
      <label for="uriHash" class="col-sm-2 control-label">Hash
      </label>
      <div class="col-sm-10">
        <input type="text" class="form-control" id="uriHash" placeholder="#{bangUri.hash() or '(#hash)'}" value="#{bangUri.hash()}">
        <span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-2">Query String</label>
      <div class="col-sm-10">
        <pre class="form-control-static" id="search"></pre>
      </div>
    </div>
    <div id="queryParameters">
    </div>
    <div class="form-group" id="addNewQueryParameter">
      <div class="col-sm-offset-2 col-sm-2">
        <button class="btn btn-default control-label glyphicon glyphicon-plus-sign">Add</button>
      </div>
      <div class="col-sm-4">
        <input type="text" class="form-control" id="newKey" placeholder="new key">
      </div>
      <div class="col-sm-4">
        <input type="text" class="form-control" id="newValue" placeholder="new value">
      </div>
    </div>
    <div class="form-group">
      <div class="col-sm-offset-2 col=sm-10">
        <a id="refreshLink">Refresh</a>
      </div>
    </div>
  """
  root.selectAll(".form-control-feedback").style({display: "none"})
  renderQueryParameters()
  $("#uri .form-group[data-key] input").change (ev)->
    key = $(ev.currentTarget).parent().parent().data("key")
    value = $(ev.currentTarget).val()
    defaultValue = $(ev.currentTarget).attr("placeholder")
    valueToSet = if value and value isnt defaultValue then value else defaultValue
    bangUri[key](valueToSet)
    updateUri $(ev.currentTarget), (value and value isnt defaultValue)
  $("#search").click ->
    $("#queryParameters").toggle()
  $("#addNewQueryParameter button").click ->
    newKey = $("#newKey").val()
    if newKey
      $("#newKey").parent().removeClass("has-error")
    else
      return $("#newKey").parent().addClass("has-error")
    newValue = $("#newValue").val()
    if newValue
      bangUri.addSearch(newKey, newValue)
    else
      bangUri.addSearch(newKey)
    renderQueryParameters()
    $("#newKey").val("")
    $("#newValue").val("")

renderQueryParameters = ->
  $("#refreshLink").attr("href", bangUri.href())
  $("#search").text bangUri.search() or "(none)"
  parameterDiv = d3.select("#queryParameters").text("").selectAll("div.form-group").data(_.pairs(bangUri.search(true))).enter()
  .append("div").attr("class", "form-group has-feedback queryParameter").attr("data-key", ([key])-> key)
  parameterDiv.append("label").attr("class", "control-label col-sm-offset-2 col-sm-2").attr("for", ([key])-> "query#{key}").text(([key])-> key)
  parameterDiv.append("div").attr("class", "col-sm-7").call (inputDiv)->
    inputDiv.append("span").attr("class", "glyphicon glyphicon-warning-sign form-control-feedback").attr("aria-hidden", "true").style("display", "none")
    inputDiv.append("input").attr(
      placeholder: ([key])-> originBangUri.search(true)[key]
      type: "text"
      class: "form-control"
      id: ([key])-> "query#{key}"
    ).on "change", ([key])->
      value = $(d3.event.currentTarget).val()
      defaultValue = $(d3.event.currentTarget).attr("placeholder")
      valueToSet = if value and value isnt defaultValue then value else defaultValue
      bangUri.setSearch(key, valueToSet)
      updateUri $(d3.event.currentTarget), (value and value isnt defaultValue)
  parameterDiv.append("div").attr("class", "col-sm-1").append("button").attr("class", "glyphicon glyphicon-remove btn btn-default").on "click", ([key])->
    bangUri.removeSearch key
    renderQueryParameters()

updateUri = (divToUpdate, toggleOn)->
  if toggleOn
    divToUpdate.siblings(".form-control-feedback").show()
    divToUpdate.parent().parent().addClass("has-warning")
  else
    divToUpdate.siblings(".form-control-feedback").hide()
    divToUpdate.parent().parent().removeClass("has-warning")
  $("#search").text bangUri.search() or "(none)"
  $("#refreshLink").attr("href", bangUri.href())

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
  bangJsonView.model.set {fragment: if bang instanceof Array then "bang[]" else "bang"}
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
      <span id="helpBlock" class="help-block">Supports native Javascript, <a href="http://jquery.com">jQuery</a>, <a href="http://d3js.org">d3.js</a>, <a href="http://underscorejs.org">underscore.js</a>, <a href="http://backbonejs.org">backbone.js</a></span>
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
    originBangUri = bangUri = new URI(document.location.href)
  catch ex
    console.log "Document not valid json, bang will not work: #{ex}"
    console.log "Bang can't work on HTML and XML pages"
    return
  render()

load()