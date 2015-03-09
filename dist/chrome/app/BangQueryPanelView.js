
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

  define(["underscore", "backbone", "mustache", "app/templates"], function(_, Backbone, Mustache, templates) {
    var BangQueryPanelView;
    return BangQueryPanelView = (function(superClass) {
      extend(BangQueryPanelView, superClass);

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
        return this.$el.html(Mustache.render(templates.BangQueryForm, page));
      };

      BangQueryPanelView.prototype.doRunQuery = function() {
        var query;
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
  });

}).call(this);
