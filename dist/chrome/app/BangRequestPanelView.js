
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

  define(["underscore", "backbone", "URI", "d3", "mustache", "app/templates"], function(_, Backbone, URI, d3, Mustache, templates) {
    var BangRequestPanelView;
    return BangRequestPanelView = (function(superClass) {
      extend(BangRequestPanelView, superClass);

      function BangRequestPanelView() {
        return BangRequestPanelView.__super__.constructor.apply(this, arguments);
      }

      BangRequestPanelView.prototype.model = URI;

      BangRequestPanelView.prototype.initialize = function() {
        this.queryStringBlockId = "uriSearch";
        this.queryStringListId = "queryParameters";
        this.keyInputId = "newKey";
        this.valueInputId = "newValue";
        return this.refreshUrlId = "refreshUrl";
      };

      BangRequestPanelView.prototype.events = {
        "change .form-group.urlComponent[data-key] input": "onUpdateUri",
        "change .form-group.queryParameter[data-key] input": "onUpdateQueryParameter",
        "click #uriSearch": "onToggleQueryStringDetail",
        "click #addNewQueryParameter button": "onAddNewQueryParameter"
      };

      BangRequestPanelView.prototype.render = function(root) {
        root = d3.select(this.el);
        this.originQueryParam = this.model.search(true);
        this.renderHeader(root.append("div").attr("class", "panel-heading"));
        this.renderRequestUri(root.append("div").attr("class", "form-horizontal panel-footer").attr("id", "uri"));
        return this.renderFooter(root.append("div").attr("class", "panel-footer"));
      };

      BangRequestPanelView.prototype.renderHeader = function(header) {
        var href;
        href = this.model.href();
        return header.append("span").attr("class", "panel-title").html("Requested URL: <code>" + href + "</code>");
      };

      BangRequestPanelView.prototype.renderFooter = function(footer) {
        return footer.append("span").attr("class", "panel-title").attr("id", this.refreshUrlId);
      };

      BangRequestPanelView.prototype.renderRequestUri = function(root) {
        var page;
        page = {
          protocol: this.model.protocol(),
          hostname: this.model.hostname(),
          port: this.model.port(),
          path: this.model.path(),
          hash: this.model.hash(),
          queryStringBlockId: this.queryStringBlockId,
          queryStringListId: this.queryStringListId,
          keyInputId: this.keyInputId,
          valueInputId: this.valueInputId
        };
        root.html(Mustache.render(templates.BangRequestUri, page));
        root.selectAll(".form-control-feedback").style("display", "none");
        return this.renderQueryParameters();
      };

      BangRequestPanelView.prototype.renderQueryParameters = function() {
        var inputDiv, parameterDiv;
        this.updateRefreshLink();
        $("#" + this.queryStringBlockId).text(this.model.search() || "(no query string)");
        parameterDiv = d3.select("#" + this.queryStringListId).text("").selectAll("div.form-group").data(_.pairs(this.model.search(true))).enter().append("div").attr("class", "form-group has-feedback queryParameter").attr("data-key", function(arg) {
          var key;
          key = arg[0];
          return key;
        });
        parameterDiv.append("label").attr("class", "control-label col-sm-offset-2 col-sm-2").attr("for", function(arg) {
          var key;
          key = arg[0];
          return "query" + key;
        }).text(function(arg) {
          var key;
          key = arg[0];
          return key;
        });
        inputDiv = parameterDiv.append("div").attr("class", "col-sm-7");
        inputDiv.append("span").attr("class", "glyphicon glyphicon-warning-sign form-control-feedback").attr("aria-hidden", "true").style("display", "none");
        inputDiv.append("input").attr({
          placeholder: (function(_this) {
            return function(arg) {
              var key;
              key = arg[0];
              return _this.originQueryParam[key];
            };
          })(this),
          value: function(arg) {
            var key, value;
            key = arg[0], value = arg[1];
            return value;
          },
          type: "text",
          "class": "form-control",
          id: function(arg) {
            var key;
            key = arg[0];
            return "query" + key;
          }
        });
        return parameterDiv.append("div").attr("class", "col-sm-1").append("button").attr("class", "glyphicon glyphicon-remove btn btn-default").on("click", (function(_this) {
          return function(arg) {
            var key;
            key = arg[0];
            _this.model.removeSearch(key);
            return _this.renderQueryParameters();
          };
        })(this));
      };

      BangRequestPanelView.prototype.onUpdateUri = function(ev) {
        var defaultValue, key, value, valueToSet;
        key = $(ev.currentTarget).parent().parent().data("key");
        value = $(ev.currentTarget).val();
        defaultValue = $(ev.currentTarget).attr("placeholder");
        valueToSet = value && value !== defaultValue ? value : defaultValue;
        this.model[key](valueToSet);
        return this.updateUri($(ev.currentTarget), value && value !== defaultValue);
      };

      BangRequestPanelView.prototype.onUpdateQueryParameter = function(ev) {
        var defaultValue, key, value, valueToSet;
        key = $(ev.currentTarget).parent().parent().data("key");
        value = $(ev.currentTarget).val();
        defaultValue = $(ev.currentTarget).attr("placeholder");
        valueToSet = value && value !== defaultValue ? value : defaultValue;
        this.model.setSearch(key, valueToSet);
        return this.updateUri($(ev.currentTarget), value && value !== defaultValue);
      };

      BangRequestPanelView.prototype.updateUri = function(divToUpdate, showFeedbackIcon) {
        if (showFeedbackIcon) {
          divToUpdate.siblings(".form-control-feedback").show();
          divToUpdate.parent().parent().addClass("has-warning");
        } else {
          divToUpdate.siblings(".form-control-feedback").hide();
          divToUpdate.parent().parent().removeClass("has-warning");
        }
        $("#" + this.queryStringBlockId).text(this.model.search() || "(no query string)");
        return this.updateRefreshLink();
      };

      BangRequestPanelView.prototype.updateRefreshLink = function() {
        return $("#" + this.refreshUrlId).html("Updated URL: <a href='" + (this.model.href()) + "'><code>" + (this.model.href()) + "</code></a>");
      };

      BangRequestPanelView.prototype.onToggleQueryStringDetail = function() {
        return $("#" + this.queryStringListId).toggle();
      };

      BangRequestPanelView.prototype.onAddNewQueryParameter = function() {
        var newKey, newValue;
        newKey = $("#" + this.keyInputId).val();
        if (newKey) {
          $("#" + this.keyInputId).parent().removeClass("has-error");
        } else {
          return $("#" + this.keyInputId).parent().addClass("has-error");
        }
        newValue = $("#" + this.valueInputId).val();
        if (newValue) {
          this.model.addSearch(newKey, newValue);
        } else {
          this.model.addSearch(newKey);
        }
        this.renderQueryParameters();
        $("#" + this.keyInputId).val("");
        return $("#" + this.valueInputId).val("");
      };

      return BangRequestPanelView;

    })(Backbone.View);
  });

}).call(this);
