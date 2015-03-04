define ["d3"
  "underscore"
  "backbone"
  "app/BangJsonPathFragment"
  "app/BangJsonPath"
], (d3, _, Backbone, BangJsonPathFragment, BangJsonPath)->
  class BangJsonView extends Backbone.View
    model: BangJsonPath

    ###
    |------------------------------|
    |.panel-body ------------------|
    | | breadcrumbUl --------------|
    | | pageHeader ----------------|
    | | arrayToolbar --------------|
    |------------------------------|
    |.panel-footer ----------------|
    | | indexSelectorDiv ----------|
    |------------------------------|
    |.panel-body ------------------|
    | | codeBlockPre --------------|
    | | arrayContentTable ---------|
    |------------------------------|
    |.panel-footer ----------------|
    | | indexSelectorDiv ----------|
    |------------------------------|
    ###
    render: ->
      root  = d3.select(@el)
      header = root.append("div").attr("class", "panel-heading")
      @renderHeader header
      panelBody = root.append("div").attr("class", "panel-body")
      # Array navigator on the top of the panel
      root.append("div").attr("class", "panel-footer")
      # For rendering json path
      @breadcrumbUl = panelBody.append("ul").attr("class", "breadcrumb")
      @pageHeader = panelBody.append("div").attr("class", "page-header")
      @arrayToolbar = panelBody.append("div").attr("class", "btn-toolbar").attr("role", "toolbar")
      # For rendering actual value
      @codeBlockPre = root.append("div").attr("class", "panel-body").append("pre")
      $(@codeBlockPre.node()).hide()
      # For rendering array contents
      @arrayContentTable = root.append("table").attr("class", "table table-striped")
      # Array navigator on the bottom of the panel
      root.append("div").attr("class", "panel-footer")
      @indexSelectorDiv = root.selectAll(".panel-footer").append("div").attr("class", "form-inline")
      @listenTo @model, "change:result", @update

    renderHeader: (header)->
      header.append("span").attr("class", "panel-title").html("JSON Navigator")

    update: (result)->
      @clear()
      type = @model.last().getFragmentType()
      @updateBreadcrumb @model
      if type is "ArrayElement"
        @updateArrayEnumerator @model.last().getArrayIndex()
      if result instanceof Array
        @updateArrayResult result, type
      else if result instanceof Object
        @updateObjectResult result, type
      else
        @updateStringResult result

    updateBreadcrumb: (path)->
      @breadcrumbUl.selectAll("li").data(path.models).enter().append("li").each (pathFragment, i)->
        if i is path.length - 1
          # return a link to the base from for the last position if it has base form
          if pathFragment.getBaseFragment()
            d3.select(this).append("a").attr("href", "#").text(pathFragment.getDisplayName()).on "click", ->
              d3.event.preventDefault()
              path.last().set "fragment", pathFragment.getBaseFragment()
              path.trigger "change:path"
          else
            # return a static span for the last element in the path which is not an array item
            d3.select(this).append("span").text(pathFragment.getDisplayName())
        else
          # return a link to the path for everything else in the path
          d3.select(this).append("a").attr("href", "#").text(pathFragment.getDisplayName()).on "click", ->
            d3.event.preventDefault()
            path.navigateTo i

    updateArrayResult: (result, type)->
      if type is "ArrayKey"
        { keyName } = @model.last().getArrayKeyName()
        @pageHeader.html "<h3>Key \"#{keyName}\" in Array</h3>"
        @updateArrayPluckView result, keyName
      else
        if _.isEmpty(result)
          @pageHeader.html "<h3>Empty array</h3>"
        else
          @pageHeader.html "<h3>Array with #{result.length} elements</h3>"
          @updateArrayContent result

    updateObjectResult: (result, type)->
      if _.isEmpty(result)
        @pageHeader.html "<h3>Empty Object</h3>"
        @updateCodeBlock "<span>Empty Object</span>"
      else
        @updateKeyValuePair result
        if type is "ArrayKey"
          {keyName, method} = @model.last().getArrayKeyName()
          @pageHeader.html "<h3>Count by \"#{keyName}\" in Array</h3>" if method is "countBy"
          @pageHeader.html "<h3>Count by the type of \"#{keyName}\" in Array</h3>" if method is "countByType"
        else
          @pageHeader.html "<h3>Object with #{_.size(result)} keys</h3>"

    updateStringResult: (result)->
      @pageHeader.html "<h3>String Value</h3>"
      @updateCodeBlock prettyPrint(result, true)

    updateCodeBlock: (htmlContent)->
      @codeBlockPre.html htmlContent
      $(@codeBlockPre.node()).show()

    updateArrayEnumerator: ({arrayName, index})->
      pager = @indexSelectorDiv.append("nav").append("ul").attr("class", "pager")
      query = @model.getQuery @model.slice(0, @model.length - 1).concat(new BangJsonPathFragment({fragment: arrayName + "[]"}))
      maxLength = eval(query).length
      # Previous Button
      if index > 0
        pager.append("li").attr("class", "previous").append("a").attr("href", "#").html("&larr;Previous").on "click", =>
          d3.event.preventDefault()
          @model.navigateToArrayElement index - 1
      else
        pager.append("li").attr("class", "previous disabled").append("a").attr("href", "#").html("&larr;Previous")
      # Current Index
      pager.append("li").html("#{index + 1} / #{maxLength}")
      # Next Button
      if index < maxLength - 1
        pager.append("li").attr("class", "next").append("a").attr("href", "#").html("Next&rarr;").on "click", =>
          d3.event.preventDefault()
          @model.navigateToArrayElement index + 1
      else
        pager.append("li").attr("class", "next disabled").append("a").attr("href", "#").html("Next&rarr;")

    updateArrayNavigator: (result)->
      @indexSelectorDiv.append("div").attr("class", "input-group").html """
        <span class="input-group-addon">Element No.</span>
        <input type='number' class='form-control' id='arrayIndex' value='1' min='1' max='#{result.length}'>
        <span class="input-group-addon">/ #{result.length}</span>
      """
      @indexSelectorDiv.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go")
      .on("click", =>
        d3.event.preventDefault()
        index = parseInt(@$("#arrayIndex").val()) - 1
        @model.navigateToArrayElement(index)
      )

    updateKeyValuePair: (result)->
      path = @model
      thead = @arrayContentTable.append("thead").append("tr")
      rows = @arrayContentTable.append("tbody").selectAll("tr").data(Object.keys(result)).enter().append("tr").each (key)->
        if not (result[key] instanceof Array or result[key] instanceof Object)
          d3.select(this).append("th").text key
          d3.select(this).append("td").text if result[key]? then result[key].toString() else "null"
        else
          pathFragment = BangJsonPathFragment.prototype.getPathFragmentForKey(result, key)
          d3.select(this).append("th").append("a").attr("href", "#").text(pathFragment.get("fragment"))
          .on("click", ->
            d3.event.preventDefault()
            path.add pathFragment
            path.trigger "change:path"
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
      @updateArrayNavigator result
      keyStats = _.chain(result).map((row)-> _.compact(_.keys(row))).flatten().unique().map((key)->
        types = _.countBy result, (row)-> typeof row[key]
        {key, types}
      ).value()
      if keyStats.length > 0
        @updateArraySchemaTable keyStats, result
      else
        @updateCodeBlock prettyPrint(result, true)

    updateArrayPluckView: (result, key)->
      path = @model
      thead = @arrayContentTable.append("thead").append("tr")
      tbody = @arrayContentTable.append("tbody")
      # if all values are string, we can display a countBy button
      rows = tbody.selectAll("tr").data(result).enter().append("tr").each (value, i)->
        tr = d3.select(this)
        tr.attr "data-index", i
        tr.append("th").append("a").attr("href", "#").text("Element #{i}").on "click", ->
          d3.event.preventDefault()
          path.pop()
          path.navigateToArrayElement i
          path.push({fragment: key}) if value instanceof Object
          path.trigger "change:path"
        if value instanceof Object
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
      if _.every(result, (value)-> not _.isObject(value))
        @updateToolbar()

    updateToolbar: ->
      { keyName } = @model.last().getArrayKeyName()
      path = @model
      toolbar = @arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group")
      toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Value").on "click", ->
        d3.event.preventDefault()
        path.pop()
        path.push new BangJsonPathFragment {fragment: "countBy:#{keyName}"}
        path.trigger "change:path"
      toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Type").on "click", ->
        d3.event.preventDefault()
        path.pop()
        path.push new BangJsonPathFragment {fragment: "countByType:#{keyName}"}
        path.trigger "change:path"

    updateArraySchemaList: (keyStats, array)->
      path = @model
      @arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group")
      .append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-th' aria-hidden='true'></span> Table View").on "click", =>
        d3.event.preventDefault()
        @arrayToolbar.text ""
        @arrayContentTable.text ""
        @updateArraySchemaTable keyStats, array
      thead = @arrayContentTable.append("thead").append("tr")
      rows = @arrayContentTable.append("tbody").selectAll("tr").data(keyStats).enter().append("tr")
      rows.append("th").append("a").attr("href", "#").text(({key})-> key).on "click", ({key})->
        d3.event.preventDefault()
        path.push new BangJsonPathFragment {fragment: ":#{key}"}
        path.trigger "change:path"
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
            d3.descending a.key, b.key
        else
          icon.attr("aria-sort", "ascending").addClass("glyphicon-sort-by-alphabet").removeClass("glyphicon-sort-by-alphabet-alt")
          rows.sort (a, b)->
            d3.ascending a.key, b.key
      thead.append("th").text("Times occurred in elements")

    updateArraySchemaTable: (keyStats, array)->
      path = @model
      @arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group")
      .append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-th-list' aria-hidden='true'></span> List View").on "click", =>
        d3.event.preventDefault()
        @arrayToolbar.text ""
        @arrayContentTable.text ""
        @updateArraySchemaList keyStats, array
      keys = _.pluck keyStats, "key"
      thead = @arrayContentTable.append("thead")
      titleRow = thead.append("tr")
      dismissRow = thead.append("tr")
      tbody = @arrayContentTable.append("tbody")
      rows = tbody.selectAll("tr").data(array).enter().append("tr")
      rows.append("th").append("a").attr("href", "#").text((d, i)-> i + 1).on "click", (d, i)->
        d3.event.preventDefault()
        path.navigateToArrayElement(i)
      rows.each (element, i)->
        currentRow = d3.select(this)
        currentRow.selectAll("td[data-key]").data(keys).enter()
        .append("td").attr("data-key", (key)-> key).attr("data-value", (key)-> element[key]).html((key)->
          if element[key] instanceof Object
            prettyPrint(element[key], true)
          else
            if element[key]? then element[key].toString() else "(null)"
        )
      sortHelper = (iconSpan, field)->
        iconSpan.parents("tr").find(".sortable .glyphicon").removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt glyphicon-sort-by-alphabet")
        if iconSpan.attr("aria-sort") is "ascending"
          sortDescription = "descending"
          iconClass = "glyphicon-sort-by-alphabet-alt"
        else
          sortDescription = "ascending"
          iconClass = "glyphicon-sort-by-alphabet"
        iconSpan.attr("aria-sort", sortDescription).addClass(iconClass)
        getter = (data)->
          if data[field]? then data[field].toString() else "(null)"
        rows.sort((a,b)->
          d3[sortDescription](getter(a), getter(b))
        )
      titleRow.append("th").text("Index")
      titleRow.selectAll("th[data-key]").data(keys).enter().append("th").attr("class", "sortable").attr("data-key", (key)-> key).call((header)->
        header.append("span").text (key)-> key
        header.append("span").attr("class", "glyphicon glyphicon-sort")
      ).on "click", (key)->
        sortHelper $(this).find(".glyphicon"), key
      dismissRow.append("td")
      dismissRow.selectAll("td[data-key]").data(keys).enter().append("td").attr("data-key", (key)-> key)
      .append("small").attr("class", "glyphicon glyphicon-eye-close dismiss").attr("title", "dismiss").on "click", (key)->
        thead.selectAll("td[data-key='#{key}'], th[data-key='#{key}'").remove()
        rows.selectAll("td[data-key='#{key}']").remove()

    showErrorMessage: (errorMessage)->
      @codeBlockPre.text errorMessage
      $(@codeBlockPre.node()).show()

    clear: ->
      @breadcrumbUl.text ""
      @indexSelectorDiv.text ""
      @pageHeader.text ""
      @codeBlockPre.text ""
      @arrayToolbar.text ""
      $(@codeBlockPre.node()).hide()
      @arrayContentTable.text ""

replacer = (match, pIndent, pKey, pVal, pEnd)->
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

prettyPrint = (obj)->
  jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,\[\{}\]]*)?$/mg
  JSON.stringify(obj, null, 4)
  .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(jsonLine, replacer)
