$ ->
  window.bang = {}
  $("#apiRequest button[type=submit]").click (ev)->
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
      else
        window.bang = {}
        $(this).addClass("panel-danger").removeClass("panel-success panel-warning")
        $(this).find(".statusCode span[aria-label=code]").text textStatus
        $(this).find(".statusCode span[aria-label=remark]").text errorThrown
        $(this).find("pre[aria-label=responseBody]").text ""
    ).done((data, textStatus, jqXHR)->
      window.bang.data = data
      window.bang.status = jqXHR.status
      $(this).addClass("panel-success").removeClass("panel-danger panel-warning")
      $(this).find(".statusCode span[aria-label=code]").text window.bang.status
      $(this).find(".statusCode span[aria-label=remark]").text window.STATUS_CODES[bang.status] or "Unknown"
      $(this).find("pre[aria-label=responseBody]").text JSON.stringify(window.bang.data, null, 4)
    )
