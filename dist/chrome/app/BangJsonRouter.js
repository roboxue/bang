
/*
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
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(["jquery", "underscore", "backbone", "URI", "d3", "mustache", "app/templates", "app/BangJsonPathFragment", "app/BangJsonPath", "app/BangJsonView", "app/BangQueryPanelView", "app/BangRequestPanelView"], function($, _, Backbone, URI, d3, Mustache, templates, BangJsonPathFragment, BangJsonPath, BangJsonView, BangQueryPanelView, BangRequestPanelView) {
    var BangJsonRouter, bangJsonView, bangQueryPanelView, bangRequestPanelView, jsonPath;
    jsonPath = null;
    bangJsonView = null;
    bangQueryPanelView = null;
    bangRequestPanelView = null;
    return BangJsonRouter = (function(superClass) {
      extend(BangJsonRouter, superClass);

      function BangJsonRouter() {
        return BangJsonRouter.__super__.constructor.apply(this, arguments);
      }

      BangJsonRouter.prototype.initialize = function(options) {
        var fade, queryRow, responseRow, root, toggler, wrapper;
        this.bang = options.bang;
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
          "padding-top": 60,
          "padding-bottom": 130,
          left: "3%",
          width: "94%",
          "z-index": 1000
        });
        this.renderNavbar(root.append("div").attr("class", "navbar navbar-default navbar-fixed-top"));
        queryRow = root.append("div").attr("class", "row");
        responseRow = root.append("div").attr("class", "row");
        jsonPath = new BangJsonPath([
          new BangJsonPathFragment({
            fragment: this.bang instanceof Array ? "bang[]" : "bang"
          })
        ], {
          baseExpression: "bang"
        });
        jsonPath.bang = this.bang;
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
          model: new URI(document.location.href)
        });
        bangRequestPanelView.render();
        this.importCss(root);
        this.listenTo(jsonPath, "change:path", function() {
          var error, ref, result;
          chrome.runtime.sendMessage({
            stage: "browse"
          });
          ref = jsonPath.getResult(), error = ref.error, result = ref.result;
          if (error) {
            return bangJsonView.showErrorMessage(error);
          } else {
            bangQueryPanelView.updateQuery(jsonPath.getQuery(null, true));
            return jsonPath.trigger("change:result", result);
          }
        });
        this.listenTo(bangQueryPanelView, "change:query", function(query) {
          var error, ref, result;
          chrome.runtime.sendMessage({
            stage: "query"
          });
          bangJsonView.clear();
          ref = jsonPath.getResult(query), error = ref.error, result = ref.result;
          if (error) {
            return bangJsonView.showErrorMessage(error);
          } else {
            bangJsonView.model.baseExpression = query;
            jsonPath.queryResult = result;
            if (result instanceof Array) {
              jsonPath.set([
                new BangJsonPathFragment({
                  fragment: "queryResult[]"
                })
              ]);
            } else {
              jsonPath.set([
                new BangJsonPathFragment({
                  fragment: "queryResult"
                })
              ]);
            }
            return jsonPath.trigger("change:result", result);
          }
        });
        this.listenTo(bangQueryPanelView, "reset:query", function() {
          jsonPath.baseExpression = "bang";
          jsonPath.set({
            fragment: this.bang instanceof Array ? "bang[]" : "bang"
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
        return navbar.html(Mustache.render(templates.BangNavbar, {}));
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
  });

}).call(this);
