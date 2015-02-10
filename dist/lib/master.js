
/*
Bang.coffee, frontend JSON workspace, a chrome extension

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
 */
var BangJsonRouter, bang, bangJsonView, bangQueryPanelView, bangRequestPanelView, bangUri, jsonPath, load, originBody, queryResult, runQuery,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

bang = null;

queryResult = null;

bangUri = null;

jsonPath = null;

bangJsonView = null;

bangQueryPanelView = null;

bangRequestPanelView = null;

originBody = null;

BangJsonRouter = (function(_super) {
  __extends(BangJsonRouter, _super);

  function BangJsonRouter() {
    return BangJsonRouter.__super__.constructor.apply(this, arguments);
  }

  BangJsonRouter.prototype.initialize = function() {
    var fade, queryRow, responseRow, root, wrapper;
    console.info("Bang (v" + (chrome.runtime.getManifest().version) + ") will make your life with JSON easier!");
    chrome.runtime.sendMessage({
      stage: "load"
    });
    wrapper = d3.select("body").append("div").attr("id", "bangWrapper").style({
      position: "absolute",
      height: window.innerHeight,
      width: "100%",
      top: "0px",
      left: "0px",
      right: "0px",
      bottom: "0px",
      "z-index": 999
    });
    fade = wrapper.append("div").attr("id", "bangFade").style({
      position: "fixed",
      height: window.innerHeight,
      width: "100%",
      top: "0px",
      left: "0px",
      right: "0px",
      bottom: "0px",
      "z-index": 999,
      opacity: 0.6,
      "background-color": "#777777"
    });
    $(window).resize(function() {
      wrapper.style("height", window.innerHeight);
      return fade.style("height", window.innerHeight);
    });
    root = wrapper.append("div").attr("class", "container-fluid").attr("id", "bang").style({
      position: "absolute",
      top: "20px",
      left: "10%",
      width: "80%",
      "z-index": 1000
    });
    this.renderNavbar(root.append("div").attr("class", "navbar navbar-default"));
    queryRow = root.append("div").attr("class", "row");
    responseRow = root.append("div").attr("class", "row");
    jsonPath = new BangJsonPath([
      new BangJsonPathFragment({
        fragment: bang instanceof Array ? "bang[]" : "bang"
      })
    ], {
      baseExpression: "bang"
    });
    bangJsonView = new BangJsonView({
      model: jsonPath,
      el: queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default panel-primary").attr("id", "navigatorPanel").node()
    });
    bangJsonView.render();
    bangQueryPanelView = new BangQueryPanelView({
      el: queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel").node()
    });
    bangQueryPanelView.render();
    bangRequestPanelView = new BangRequestPanelView({
      el: responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success").attr("id", "requestPanel").node(),
      model: bangUri
    });
    bangRequestPanelView.render();
    this.importCss(root);
    this.listenTo(jsonPath, "change:path", function() {
      var error, query, result, _ref;
      query = jsonPath.getQuery();
      _ref = runQuery(query), error = _ref.error, result = _ref.result;
      if (error) {
        return bangJsonView.showErrorMessage(error);
      } else {
        bangQueryPanelView.updateQuery(jsonPath.getQuery(null, true));
        return jsonPath.trigger("change:result", result);
      }
    });
    this.listenTo(bangQueryPanelView, "change:query", function(query) {
      var error, result, _ref;
      bangJsonView.clear();
      _ref = runQuery(query), error = _ref.error, result = _ref.result;
      if (error) {
        return bangJsonView.showErrorMessage(error);
      } else {
        bangJsonView.model.baseExpression = query;
        queryResult = result;
        if (result instanceof Array) {
          jsonPath.set({
            fragment: "queryResult[]"
          });
        } else {
          jsonPath.set({
            fragment: "queryResult"
          });
        }
        return jsonPath.trigger("change:result", result);
      }
    });
    this.listenTo(bangQueryPanelView, "reset:query", function() {
      jsonPath.baseExpression = "bang";
      jsonPath.set({
        fragment: bang instanceof Array ? "bang[]" : "bang"
      });
      return jsonPath.trigger("change:path");
    });
    return jsonPath.trigger("change:path");
  };

  BangJsonRouter.prototype.renderNavbar = function(navbar) {
    navbar.html(window.Milk.render(bangTemplates.BangNavbar, {}));
    return $("#dismiss").click(function(ev) {
      ev.preventDefault();
      return $("#bangWrapper").hide();
    });
  };

  BangJsonRouter.prototype.importCss = function(root) {
    root.append("link").attr({
      rel: "stylesheet",
      href: chrome.extension.getURL('css/bootstrap.css'),
      type: "text/css"
    });
    return root.append("link").attr({
      rel: "stylesheet",
      href: chrome.extension.getURL('css/bang.css'),
      type: "text/css"
    });
  };

  return BangJsonRouter;

})(Backbone.Router);

runQuery = function(query) {
  var ex, result;
  try {
    result = eval(query);
    if (result === void 0) {
      return {
        error: "(undefined)"
      };
    } else {
      return {
        result: result
      };
    }
  } catch (_error) {
    ex = _error;
    return {
      error: ex
    };
  }
};

load = function() {
  var ex, router;
  try {
    bang = JSON.parse(originBody);
    bangUri = new URI(document.location.href);
  } catch (_error) {
    ex = _error;
    console.log("Document not valid json, bang will not work: " + ex);
    console.log("Bang can't work on HTML and XML pages");
    return;
  }
  router = new BangJsonRouter();
  return Backbone.history.start();
};

if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName === "PRE" || document.body.children.length === 0)) {
  originBody = document.body.children.length ? $("pre").text() : document.body;
  if (originBody) {
    setTimeout(load, 200);
  }
}
