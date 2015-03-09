###
Bang, frontend JSON workspace, a chrome extension

Copyright (c) 2015, Groupon, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

Neither the name of GROUPON nor the names of its contributors may be
used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
###

originBody = null

require.load = (context, moduleName, url)->
  xhr = new XMLHttpRequest()
  xhr.open("GET", url, true)
  xhr.onreadystatechange = (e)->
    if xhr.readyState is 4 && xhr.status is 200
      eval(xhr.responseText)
      context.completeLoad(moduleName)
  xhr.send(null)

requirejs.config
  baseUrl: chrome.extension.getURL("lib")
  paths:
    app: chrome.extension.getURL("app")

load = ->
  require ["jquery", "underscore", "backbone"], ($, _, Backbone)->
    bang = null
    try
      bang = JSON.parse originBody
    catch ex
      console.log "Document not valid json, bang will not work: #{ex}"
      console.log "Bang can't work on HTML and XML pages"
      return
    require ["app/BangJsonRouter"], (BangJsonRouter)->
      router = new BangJsonRouter({bang})
      Backbone.history.start()

if document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)
  originBody = if document.body.children.length then document.body.childNodes[0].innerText else document.body
  if originBody
    setTimeout(load, 200)
