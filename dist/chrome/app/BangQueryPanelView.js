(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "backbone", "mustache", "app/templates"], function(_, Backbone, Mustache, templates) {
    var BangQueryPanelView;
    return BangQueryPanelView = (function(_super) {
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
