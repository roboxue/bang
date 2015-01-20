(function() {
  var BangJsonPath, BangJsonPathFragment, BangJsonView, bang, bangJsonView, bangUri, didReset, didRunQuery, getPathFragmentForKey, load, queryResult, render, renderHeader, renderQuery, renderQueryForm, renderResponse, runQuery,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bang = null;

  bangUri = null;

  queryResult = null;

  bangJsonView = null;

  BangJsonPathFragment = (function(_super) {
    __extends(BangJsonPathFragment, _super);

    function BangJsonPathFragment() {
      return BangJsonPathFragment.__super__.constructor.apply(this, arguments);
    }

    BangJsonPathFragment.prototype.getQueryFragment = function() {
      var arrayName, arrayRx, fullName, _ref;
      arrayRx = /^(.+)\[]$/;
      if (arrayRx.test(this.get("fragment"))) {
        _ref = this.get("fragment").match(arrayRx), fullName = _ref[0], arrayName = _ref[1];
        return arrayName;
      } else {
        return this.get("fragment");
      }
    };

    BangJsonPathFragment.prototype.getDisplayName = function() {
      return this.get("fragment");
    };

    BangJsonPathFragment.prototype.getBaseFragment = function() {
      var arrayName, arrayRx, fullName, _ref;
      arrayRx = /^(.+)\[(\d+)]$/;
      if (arrayRx.test(this.get("fragment"))) {
        _ref = this.get("fragment").match(arrayRx), fullName = _ref[0], arrayName = _ref[1];
        return arrayName + "[]";
      }
    };

    BangJsonPathFragment.prototype.getArrayFragment = function(index) {
      var arrayName, arrayRx, fullName, _ref;
      arrayRx = /^(.+)\[]$/;
      if (arrayRx.test(this.get("fragment"))) {
        _ref = this.get("fragment").match(arrayRx), fullName = _ref[0], arrayName = _ref[1];
        return arrayName + ("[" + index + "]");
      }
    };

    return BangJsonPathFragment;

  })(Backbone.Model);

  BangJsonPath = (function(_super) {
    __extends(BangJsonPath, _super);

    function BangJsonPath() {
      return BangJsonPath.__super__.constructor.apply(this, arguments);
    }

    BangJsonPath.prototype.model = BangJsonPathFragment;

    BangJsonPath.prototype.initialize = function(models, option) {
      if (option && option.baseExpression) {
        return this.baseExpression = option.baseExpression;
      } else {
        return this.baseExpression = models[0].get("fragment");
      }
    };

    BangJsonPath.prototype.getQuery = function() {
      return this.reduce((function(pv, cv, index, array) {
        if (index > 0) {
          pv += ".";
        }
        return pv += cv.getQueryFragment();
      }), "");
    };

    BangJsonPath.prototype.getDisplayedQuery = function() {
      return this.reduce((function(pv, cv, index, array) {
        if (index > 0) {
          return pv += "." + cv.getQueryFragment();
        } else {
          return pv;
        }
      }), this.baseExpression);
    };

    BangJsonPath.prototype.navigateTo = function(index) {
      while (this.models.length > Math.max(index + 1, 0)) {
        this.pop();
      }
      return this.trigger("path:update");
    };

    BangJsonPath.prototype.navigateToArrayElement = function(index) {
      var arrayFragment;
      if (arrayFragment = this.last().getArrayFragment(index)) {
        this.last().set("fragment", arrayFragment);
        return this.trigger("path:update");
      }
    };

    return BangJsonPath;

  })(Backbone.Collection);

  BangJsonView = (function(_super) {
    __extends(BangJsonView, _super);

    function BangJsonView() {
      return BangJsonView.__super__.constructor.apply(this, arguments);
    }

    BangJsonView.prototype.model = BangJsonPath;

    BangJsonView.prototype.render = function() {
      var panelBody, root;
      root = d3.select(this.el);
      root.append("div").attr("class", "panel-heading").text("Response Navigator");
      panelBody = root.append("div").attr("class", "panel-body");
      this.breadcrumbUl = panelBody.append("ul").attr("class", "breadcrumb");
      this.indexSelectorDiv = panelBody.append("div").attr("class", "form-inline");
      this.codeBlockPre = panelBody.append("pre").style("display", "none");
      this.keyValuePairUl = root.append("ul").attr("class", "list-group");
      this.arrayContentTable = root.append("table").attr("class", "table");
      return this.listenTo(this.model, "path:update", this.updateNavigator);
    };

    BangJsonView.prototype.updateNavigator = function(option) {
      var error, path, query, result, _ref;
      this.clear();
      path = this.model;
      query = path.getQuery();
      console.log("Update Navigator", this.model.models, query);
      _ref = runQuery(query), error = _ref.error, result = _ref.result;
      if (!(option && option.silent)) {
        $("#query").val(path.getDisplayedQuery());
      }
      if (error) {
        return this.breadcrumbUl.text(JSON.stringify(error, null, 4));
      }
      this.breadcrumbUl.selectAll("li").data(this.model.models).enter().append("li").each(function(pathFragment, i) {
        if (i === path.length - 1) {
          if (pathFragment.getBaseFragment()) {
            return d3.select(this).append("a").attr("href", "#").text(pathFragment.getDisplayName()).on("click", function() {
              d3.event.preventDefault();
              path.last().set("fragment", pathFragment.getBaseFragment());
              return path.trigger("path:update");
            });
          } else {
            return d3.select(this).append("span").text(pathFragment.getDisplayName());
          }
        } else {
          return d3.select(this).append("a").attr("href", "#").text(pathFragment.getDisplayName()).on("click", function() {
            d3.event.preventDefault();
            return path.navigateTo(i);
          });
        }
      });
      if (result instanceof Array) {
        return this.updateArrayContent(result);
      } else if (result instanceof Object) {
        return this.updateKeyValuePair(result);
      } else {
        return this.codeBlockPre.style("display", null).text(JSON.stringify(result, null, 4));
      }
    };

    BangJsonView.prototype.updateKeyValuePair = function(result) {
      return this.keyValuePairUl.selectAll("li").data(Object.keys(result)).enter().append("li").attr("class", "list-group-item").each(function(key) {
        var pathFragment;
        if (!(result[key] instanceof Array || result[key] instanceof Object)) {
          d3.select(this).append("span").text(key);
          return d3.select(this).append("span").attr("class", "pull-right").text(result[key]);
        } else {
          pathFragment = getPathFragmentForKey(result, key);
          d3.select(this).append("a").attr("href", "#").text(pathFragment.get("fragment")).on("click", function() {
            d3.event.preventDefault();
            bangJsonView.model.add(pathFragment);
            console.log("Add", pathFragment, bangJsonView.model.models);
            return bangJsonView.model.trigger("path:update");
          });
          if (result[key] instanceof Array) {
            return d3.select(this).append("span").attr("class", "pull-right").text("Array with " + result[key].length + " elements");
          } else {
            return d3.select(this).append("span").attr("class", "pull-right").text("Object with " + (_.size(result[key])) + " key value pairs");
          }
        }
      });
    };

    BangJsonView.prototype.updateArrayContent = function(result) {
      if (result.length === 0) {
        return this.indexSelectorDiv.append("div").attr("class", "form-group").html("<span>Empty array</span>");
      } else {
        this.indexSelectorDiv.append("div").attr("class", "form-group").html("<span>Array with " + result.length + " elements</span>\n<input type='number' class='form-control' id='arrayIndex' value='0' min='0' max='" + (result.length - 1) + "'>");
        return this.indexSelectorDiv.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go").on("click", function() {
          var index;
          d3.event.preventDefault();
          index = $("#arrayIndex").val();
          return bangJsonView.model.navigateToArrayElement(index);
        });
      }
    };

    BangJsonView.prototype.clear = function() {
      this.breadcrumbUl.text("");
      this.indexSelectorDiv.text("");
      this.codeBlockPre.style("display", "none").text("");
      this.keyValuePairUl.text("");
      return this.arrayContentTable.text("");
    };

    return BangJsonView;

  })(Backbone.View);

  render = function() {
    var queryRow, responseRow, root;
    console.log("Bang will make your life with JSON easier!");
    root = d3.select("body").text("").append("div").attr("class", "container");
    renderHeader(root.append("div").attr("class", "navbar navbar-default"));
    queryRow = root.append("div").attr("class", "row");
    responseRow = root.append("div").attr("class", "row");
    renderQuery(queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel"));
    bangJsonView = new BangJsonView({
      model: new BangJsonPath([
        new BangJsonPathFragment({
          fragment: "bang"
        })
      ]),
      el: queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success").attr("id", "navigatorPanel").node()
    });
    bangJsonView.render();
    renderResponse(responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success"));
    $(".panel-heading").css({
      cursor: "pointer",
      "word-break": "break-all"
    }).click(function(ev) {
      return $(ev.currentTarget).siblings(".panel-body").toggle();
    });
    root.append("link").attr({
      rel: "stylesheet",
      href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'),
      type: "text/css"
    });
    return bangJsonView.model.trigger("path:update");
  };

  renderHeader = function(root) {
    return root.html("<div class=\"navbar-header\">\n  <a class=\"navbar-brand\" href=\"http://github.com/roboxue/bang\">Bang!</a>\n</div>\n<div class=\"collapse navbar-collapse\">\n  <p class=\"navbar-text\">Lightweight frontend json workspace</p>\n</div>");
  };

  renderResponse = function(root) {
    var header;
    header = root.append("div").attr("class", "panel-heading").html("Response from <code>" + bangUri + "</code> stored into bang");
    return root.append("div").attr("class", "panel-body").append("pre").text(JSON.stringify(bang, null, 4));
  };

  renderQuery = function(root) {
    root.append("div").attr("class", "panel-heading").text("Query");
    return renderQueryForm(root.append("div").attr("class", "panel-body"));
  };

  didRunQuery = function() {
    var error, query, result, _ref;
    query = $("#query").val();
    bangJsonView.clear();
    _ref = runQuery(query), error = _ref.error, result = _ref.result;
    console.log(error, result);
    if (error) {
      return bangJsonView.codeBlockPre.style("display", null).text(error);
    } else {
      queryResult = result;
      bangJsonView.model.baseExpression = query;
      if (queryResult instanceof Array) {
        bangJsonView.model.set({
          fragment: "queryResult[]"
        });
      } else {
        bangJsonView.model.set({
          fragment: "queryResult"
        });
      }
      return bangJsonView.model.trigger("path:update");
    }
  };

  didReset = function() {
    $("#query").val("bang");
    bangJsonView.model.baseExpression = "bang";
    bangJsonView.model.set({
      fragment: "bang"
    });
    return bangJsonView.model.trigger("path:update");
  };

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

  getPathFragmentForKey = function(data, key) {
    if (data[key] instanceof Array) {
      if (data[key].length === 1) {
        return new BangJsonPathFragment({
          fragment: key + "[0]"
        });
      } else {
        return new BangJsonPathFragment({
          fragment: key + "[]"
        });
      }
    } else {
      return new BangJsonPathFragment({
        fragment: key
      });
    }
  };

  renderQueryForm = function(root) {
    root.html("<div class=\"form-horizontal\">\n  <div class=\"form-group\">\n    <label for=\"query\" class=\"col-sm-2 control-label\">Query</label>\n    <div class=\"col-sm-10\">\n      <textarea class=\"form-control\" id=\"query\" placeholder=\"Any Javascript Expression!\"></textarea>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"col-sm-offset-2 col-sm-10\">\n      <button type=\"submit\" class=\"btn btn-default\" id=\"runQuery\">Run it!</button>\n      <button type=\"reset\" class=\"btn btn-default\" id=\"reset\">Reset</button>\n    </div>\n  </div>\n</div>");
    $("#runQuery").click(didRunQuery);
    return $("#reset").click(didReset);
  };

  load = function() {
    var data, ex;
    try {
      if (!(document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName === "PRE" || document.body.children.length === 0))) {
        return;
      }
      data = document.body.children.length ? $("pre").text() : document.body;
      if (!data) {
        return;
      }
      bang = JSON.parse(data);
      bangUri = document.location.href;
    } catch (_error) {
      ex = _error;
      console.warn("Document not valid json, bang will not work: " + ex);
    }
    console.warn("Bang can't work on HTML and XML pages");
    return render();
  };

  load();

}).call(this);
