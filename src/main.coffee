$ ->
  window.bang = {}
  $("#apiRequest button[type=submit]").click ->
    requestUrl = $("#requestUrl").val()
    console.log requestUrl
    $.ajax({
      url: requestUrl
    }).fail((jqXHR, textStatus, errorThrown)->
      console.log textStatus, errorThrown
      onRequestFail jqXHR, textStatus, errorThrown
    ).done((data, textStatus, jqXHR)->
      onRequestSuccess data, textStatus, jqXHR
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

onRequestFail = (jqXHR, textStatus, errorThrown)->
  responsePanel = $("#apiResponse")
  if jqXHR.status
    window.bang.data =jqXHR.responseText
    window.bang.status = jqXHR.status
    responsePanel.addClass("panel-warning").removeClass("panel-danger panel-success")
    responsePanel.find(".statusCode span[aria-label=code]").text jqXHR.status
    responsePanel.find(".statusCode span[aria-label=remark]").text window.STATUS_CODES[bang.status] or "Unknown"
    responsePanel.find("pre[aria-label=responseBody]").text window.bang.data
    $("#workspace").show()
  else
    window.bang = {}
    responsePanel.addClass("panel-danger").removeClass("panel-success panel-warning")
    responsePanel.find(".statusCode span[aria-label=code]").text textStatus
    responsePanel.find(".statusCode span[aria-label=remark]").text errorThrown
    responsePanel.find("pre[aria-label=responseBody]").text ""
    $("#workspace").hide()

onRequestSuccess = (data, textStatus, jqXHR)->
  window.bang.data = data
  window.bang.status = jqXHR.status
  responsePanel = $("#apiResponse")
  responsePanel.addClass("panel-success").removeClass("panel-danger panel-warning")
  responsePanel.find(".statusCode span[aria-label=code]").text window.bang.status
  responsePanel.find(".statusCode span[aria-label=remark]").text window.STATUS_CODES[bang.status] or "Unknown"
  responsePanel.find("pre[aria-label=responseBody]").text JSON.stringify(window.bang.data, null, 4)
  $("#workspace").show()
