bangExtensionTemplates = {
    "BangNavbar" : '<div class="container-fluid"><div class="navbar-header"><a class="navbar-brand" href="http://github.com/roboxue/bang" target="_blank">Bang&nbsp;<ruby>棒<rt>Bàng</rt></ruby></a></div><div class="collapse navbar-collapse"><p class="navbar-text">Lightweight <code>JSON</code> workspace - made for developers</p><p class="navbar-text navbar-right"><a href="#" class="navbar-link" id="dismissBang"><span class="glyphicon glyphicon-remove">Dismiss</span></a></p></div></div>',
    "BangQueryForm" : '<div class="container-fluid"><div class="collapse navbar-collapse row"><div class="form-horizontal navbar-left col-md-10"><div class="form-group"><label for="{{textAreaId}}" class="col-md-3 control-label"><span class="navbar-text">Javascript Query</span></label><div class="col-md-9"><textarea class="form-control" id="{{textAreaId}}" placeholder="{{textAreaPlaceholder}}"></textarea><span id="helpBlock" class="help-block">Raw JSON Object is in variable <code class="bang">bang</code>. Supports native Javascript, plus&nbsp;{{#supportedFrameworks}}<a href="{{url}}">{{name}}</a>&nbsp;{{/supportedFrameworks}}</span></div></div></div><div class="navbar-right"><button type="submit" class="btn btn-default" id="runQuery">Run it!</button><button type="reset" class="btn btn-default" id="reset">Reset</button></div></div></div>',
    "done": "true"
  };

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
var BangJsonRouter, BangQueryPanelView, bang, bangJsonView, bangQueryPanelView, bangRequestPanelView, bangUri, jsonPath, load, originBody, queryResult, runQuery,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BangQueryPanelView = (function(_super) {
  __extends(BangQueryPanelView, _super);

  function BangQueryPanelView() {
    return BangQueryPanelView.__super__.constructor.apply(this, arguments);
  }

  BangQueryPanelView.prototype.initialize = function() {
    return this.textAreaId = "bangQuery";
  };

  BangQueryPanelView.prototype.events = {
    "click #runQuery": "doRunQuery",
    "click #reset": "doReset"
  };

  BangQueryPanelView.prototype.render = function() {
    var page;
    page = {
      textAreaPlaceholder: "Any Javascript Expression!",
      textAreaId: this.textAreaId,
      supportedFrameworks: [
        {
          name: "jQuery",
          url: "http://jquery.com"
        }, {
          name: "d3.js",
          url: "http://d3js.org"
        }, {
          name: "underscore.js",
          url: "http://underscorejs.org"
        }, {
          name: "backbone.js",
          url: "http://backbonejs.org"
        }
      ]
    };
    return this.$el.html(window.Milk.render(bangExtensionTemplates.BangQueryForm, page));
  };

  BangQueryPanelView.prototype.doRunQuery = function() {
    var query;
    chrome.runtime.sendMessage({
      stage: "query"
    });
    query = $("#" + this.textAreaId).val();
    return this.trigger("change:query", query);
  };

  BangQueryPanelView.prototype.doReset = function() {
    this.updateQuery("bang");
    return this.trigger("reset:query");
  };

  BangQueryPanelView.prototype.updateQuery = function(query) {
    return $("#" + this.textAreaId).val(query);
  };

  return BangQueryPanelView;

})(Backbone.View);


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
    var fade, queryRow, responseRow, root, toggler, wrapper;
    console.info("Bang (v" + (chrome.runtime.getManifest().version) + ") will make your life with JSON easier!");
    chrome.runtime.sendMessage({
      stage: "load"
    });
    toggler = d3.select("body").append("div").attr("id", "showBang").style({
      position: "fixed",
      top: 40,
      right: 40,
      display: "none"
    }).append("button").attr("class", "btn btn-default btn-lg").text("Open Bang Workspace");
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
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
      top: 60,
      bottom: 130,
      left: "3%",
      width: "94%",
      "z-index": 1000
    });
    this.renderNavbar(root.append("div").attr("class", "navbar navbar-default navbar-fixed-top"));
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
      el: root.append("div").attr("class", "navbar navbar-default navbar-fixed-bottom").attr("id", "queryPanel").node()
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
    $("#dismissBang").click(function(ev) {
      ev.preventDefault();
      chrome.runtime.sendMessage({
        stage: "dismiss"
      });
      $("#bangWrapper").hide();
      return $("#showBang").show();
    });
    $("#showBang button").click(function() {
      chrome.runtime.sendMessage({
        stage: "activate"
      });
      $("#bangWrapper").show();
      return $("#showBang").hide();
    });
    return jsonPath.trigger("change:path");
  };

  BangJsonRouter.prototype.renderNavbar = function(navbar) {
    return navbar.html(window.Milk.render(bangExtensionTemplates.BangNavbar, {}));
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
