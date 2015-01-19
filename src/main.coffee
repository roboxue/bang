$ ->
  window.bang = {}
  $("#apiRequest button[type=submit]").click ->
    requestUrl = $("#requestUrl").val()
    console.log requestUrl
    $.ajax({
      url: requestUrl
      context: $("#apiResponse")
    }).fail((jqXHR, textStatus, errorThrown)->
      console.log textStatus, errorThrown
      if jqXHR.status
        window.bang.data =jqXHR.responseText
        window.bang.status = jqXHR.status
        $(this).addClass("panel-warning").removeClass("panel-danger panel-success")
        $(this).find(".statusCode span[aria-label=code]").text jqXHR.status
        $(this).find(".statusCode span[aria-label=remark]").text window.STATUS_CODES[bang.status] or "Unknown"
        $(this).find("pre[aria-label=responseBody]").text window.bang.data
        $("#workspace").show()
      else
        window.bang = {}
        $(this).addClass("panel-danger").removeClass("panel-success panel-warning")
        $(this).find(".statusCode span[aria-label=code]").text textStatus
        $(this).find(".statusCode span[aria-label=remark]").text errorThrown
        $(this).find("pre[aria-label=responseBody]").text ""
        $("#workspace").hide()
    ).done((data, textStatus, jqXHR)->
      window.bang.data = data
      window.bang.status = jqXHR.status
      $(this).addClass("panel-success").removeClass("panel-danger panel-warning")
      $(this).find(".statusCode span[aria-label=code]").text window.bang.status
      $(this).find(".statusCode span[aria-label=remark]").text window.STATUS_CODES[bang.status] or "Unknown"
      $(this).find("pre[aria-label=responseBody]").text JSON.stringify(window.bang.data, null, 4)
      $("#workspace").show()
    )

  $("#workspace button[type=submit]").click ->
    query = $("#query").val()
    try
      queryResult = eval("bang.data" + query)
      console.log queryResult
      if queryResult is undefined
        $("#workspace pre[aria-label=queryResult]").text "(undefined)"
      else
        $("#workspace pre[aria-label=queryResult]").text JSON.stringify(queryResult, null, 4)
    catch ex
      $("#workspace pre[aria-label=queryResult]").text ex
