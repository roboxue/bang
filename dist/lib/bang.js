(function() {
  var BangJsonPath, BangJsonPathFragment, BangJsonView, bang, bangJsonView, bangUri, didReset, didRunQuery, getPathFragmentForKey, load, originBangUri, originBody, prettyPrint, queryResult, render, renderHeader, renderQuery, renderQueryForm, renderQueryParameters, renderRawResponseJSON, renderResponse, renderUri, replacer, replacerSimplified, runQuery, stringifyPadingSize, updateUri,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bang = null;

  bangUri = null;

  originBangUri = null;

  queryResult = null;

  bangJsonView = null;

  originBody = null;

  BangJsonPathFragment = (function(_super) {
    __extends(BangJsonPathFragment, _super);

    function BangJsonPathFragment() {
      return BangJsonPathFragment.__super__.constructor.apply(this, arguments);
    }

    BangJsonPathFragment.prototype.getQueryFragment = function() {
      var arrayName, arrayRx, fullExpression, keyName, keyRx, method, type, _ref, _ref1;
      arrayRx = /^(.+)\[]$/;
      keyRx = /(^|^countBy|^countByType):(.+)$/;
      type = this.getFragmentType();
      switch (type) {
        case "ArrayRoot":
          _ref = this.get("fragment").match(arrayRx), fullExpression = _ref[0], arrayName = _ref[1];
          return {
            value: arrayName
          };
        case "ArrayKey":
          _ref1 = this.get("fragment").match(keyRx), fullExpression = _ref1[0], method = _ref1[1], keyName = _ref1[2];
          switch (method) {
            case "countBy":
              return {
                underscore: "countBy('" + keyName + "')"
              };
            case "countByType":
              return {
                underscore: "countBy(function(row){return typeof row['" + keyName + "']})"
              };
            default:
              return {
                underscore: "pluck('" + keyName + "')"
              };
          }
          break;
        default:
          return {
            value: this.get("fragment")
          };
      }
    };

    BangJsonPathFragment.prototype.getFragmentType = function() {
      var arrayElementRx, arrayRx, keyRx;
      arrayRx = /^(.+)\[]$/;
      arrayElementRx = /^(.+)\[(\d+)]$/;
      keyRx = /(^|^countBy|^countByType):(.+)$/;
      if (arrayRx.test(this.get("fragment"))) {
        return "ArrayRoot";
      } else if (arrayElementRx.test(this.get("fragment"))) {
        return "ArrayElement";
      } else if (keyRx.test(this.get("fragment"))) {
        return "ArrayKey";
      } else {
        return "Value";
      }
    };

    BangJsonPathFragment.prototype.getArrayKeyName = function() {
      var fullExpression, keyName, keyRx, method, _ref;
      keyRx = /(^|^countBy|^countByType):(.+)$/;
      if (keyRx.test(this.get("fragment"))) {
        _ref = this.get("fragment").match(keyRx), fullExpression = _ref[0], method = _ref[1], keyName = _ref[2];
        return {
          method: method,
          keyName: keyName
        };
      }
    };

    BangJsonPathFragment.prototype.getArrayIndex = function() {
      var arrayElementRx, arrayIndex, fullExpression, keyName, _ref;
      arrayElementRx = /^(.+)\[(\d+)]$/;
      if (arrayElementRx.test(this.get("fragment"))) {
        _ref = this.get("fragment").match(arrayElementRx), fullExpression = _ref[0], keyName = _ref[1], arrayIndex = _ref[2];
        return [keyName, parseInt(arrayIndex)];
      }
    };

    BangJsonPathFragment.prototype.getDisplayName = function() {
      return this.get("fragment");
    };

    BangJsonPathFragment.prototype.getBaseFragment = function() {
      var arrayName, arrayRx, fullExpression, fullName, keyName, keyRx, method, _ref, _ref1;
      arrayRx = /^(.+)\[(\d+)]$/;
      keyRx = /(^|^countBy|^countByType):(.+)$/;
      if (arrayRx.test(this.get("fragment"))) {
        _ref = this.get("fragment").match(arrayRx), fullName = _ref[0], arrayName = _ref[1];
        return arrayName + "[]";
      } else if (keyRx.test(this.get("fragment"))) {
        _ref1 = this.get("fragment").match(keyRx), fullExpression = _ref1[0], method = _ref1[1], keyName = _ref1[2];
        if (method) {
          return ":" + keyName;
        }
      }
    };

    BangJsonPathFragment.prototype.getArrayFragment = function(index) {
      var arrayName, arrayRx, fullName, _ref;
      arrayRx = /^(.+)\[\d*]$/;
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

    BangJsonPath.prototype.getQuery = function(path, forDisplay) {
      var baseExpression, reducer, toReturn, underscoreWrapped;
      underscoreWrapped = false;
      reducer = (function(pv, cv, index, array) {
        var underscore, value, _ref;
        if (index === 0) {
          return pv || cv.getQueryFragment().value;
        }
        if (cv.getFragmentType() === "Value") {
          return pv + ("['" + (cv.getQueryFragment().value) + "']");
        } else {
          _ref = cv.getQueryFragment(), value = _ref.value, underscore = _ref.underscore;
          if (value || underscoreWrapped) {
            return pv + "." + value;
          } else {
            underscoreWrapped = true;
            return ("_.chain(" + pv + ").") + underscore;
          }
        }
      });
      baseExpression = forDisplay ? this.baseExpression || "" : void 0;
      if (path) {
        toReturn = path.reduce(reducer, baseExpression);
      } else {
        toReturn = this.reduce(reducer, baseExpression);
      }
      if (underscoreWrapped) {
        return toReturn + ".value()";
      } else {
        return toReturn;
      }
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
      var header, panelBody, root;
      root = d3.select(this.el);
      header = root.append("div").attr("class", "panel-heading");
      header.append("span").attr("class", "panel-title").html("JSON Navigator (Response has been stored into variable <code class='bang'>bang</code>)");
      panelBody = root.append("div").attr("class", "panel-body");
      this.breadcrumbUl = panelBody.append("ul").attr("class", "breadcrumb");
      this.pageHeader = panelBody.append("div").attr("class", "page-header");
      this.arrayToolbar = panelBody.append("div").attr("class", "btn-toolbar").attr("role", "toolbar");
      root.append("div").attr("class", "panel-footer");
      this.codeBlockPre = root.append("div").attr("class", "panel-body").append("pre");
      $(this.codeBlockPre.node()).hide();
      this.arrayContentTable = root.append("table").attr("class", "table table-striped");
      root.append("div").attr("class", "panel-footer");
      this.indexSelectorDiv = root.selectAll(".panel-footer").append("div").attr("class", "form-inline");
      return this.listenTo(this.model, "path:update", this.update);
    };

    BangJsonView.prototype.update = function(option) {
      var error, keyName, method, query, result, type, _ref, _ref1;
      this.clear();
      query = this.model.getQuery();
      _ref = runQuery(query), error = _ref.error, result = _ref.result;
      if (!(option && option.silent)) {
        $("#query").val(this.model.getQuery(null, true));
      }
      this.updateNavigator({
        error: error,
        result: result
      });
      type = this.model.last().getFragmentType();
      if (result instanceof Array) {
        if (type === "ArrayRoot") {
          if (result.length === 0) {
            this.pageHeader.html("<h3>Empty array</h3>");
          } else {
            this.pageHeader.html("<h3>Array with " + result.length + " elements</h3>");
            this.updateArrayContent(result);
          }
        } else if (type === "ArrayKey") {
          keyName = this.model.last().getArrayKeyName().keyName;
          this.pageHeader.html("<h3>Key \"" + keyName + "\" in Array</h3>");
          this.updateArrayPluckView(result, keyName);
        }
      } else if (result instanceof Object) {
        if (_.size(result) === 0) {
          this.pageHeader.html("<h3>Empty Object</h3>");
          this.codeBlockPre.html("<span>Empty Object</span>");
          $(this.codeBlockPre.node()).show();
        } else {
          if (type === "ArrayKey") {
            _ref1 = this.model.last().getArrayKeyName(), keyName = _ref1.keyName, method = _ref1.method;
            if (method === "countBy") {
              this.pageHeader.html("<h3>Count by \"" + keyName + "\" in Array</h3>");
            }
            if (method === "countByType") {
              this.pageHeader.html("<h3>Count by the type of \"" + keyName + "\" in Array</h3>");
            }
          } else {
            this.pageHeader.html("<h3>Object with " + (_.size(result)) + " keys</h3>");
          }
          this.updateKeyValuePair(result);
        }
      } else {
        this.pageHeader.html("<h3>String Value</h3>");
        this.codeBlockPre.html(prettyPrint(result, true));
        $(this.codeBlockPre.node()).show();
      }
      if (type === "ArrayElement") {
        return this.updateArrayNavigator(this.model.last().getArrayIndex());
      }
    };

    BangJsonView.prototype.updateNavigator = function(_arg) {
      var error, path, result;
      error = _arg.error, result = _arg.result;
      path = this.model;
      if (error) {
        return this.breadcrumbUl.text(JSON.stringify(error, null, 4));
      }
      return this.breadcrumbUl.selectAll("li").data(this.model.models).enter().append("li").each(function(pathFragment, i) {
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
    };

    BangJsonView.prototype.updateArrayNavigator = function(_arg) {
      var arrayIndex, arrayName, maxLength, pager, query;
      arrayName = _arg[0], arrayIndex = _arg[1];
      pager = this.indexSelectorDiv.append("nav").append("ul").attr("class", "pager");
      query = bangJsonView.model.getQuery(bangJsonView.model.slice(0, bangJsonView.model.length - 1).concat(new BangJsonPathFragment({
        fragment: arrayName + "[]"
      })));
      maxLength = eval(query).length;
      if (arrayIndex > 0) {
        pager.append("li").attr("class", "previous").append("a").attr("href", "#").html("&larr;Previous").on("click", function() {
          d3.event.preventDefault();
          return bangJsonView.model.navigateToArrayElement(arrayIndex - 1);
        });
      } else {
        pager.append("li").attr("class", "previous disabled").append("a").attr("href", "#").html("&larr;Previous");
      }
      pager.append("li").html("" + (arrayIndex + 1) + " / " + maxLength);
      if (arrayIndex < maxLength - 1) {
        return pager.append("li").attr("class", "next").append("a").attr("href", "#").html("Next&rarr;").on("click", function() {
          d3.event.preventDefault();
          return bangJsonView.model.navigateToArrayElement(arrayIndex + 1);
        });
      } else {
        return pager.append("li").attr("class", "next disabled").append("a").attr("href", "#").html("Next&rarr;");
      }
    };

    BangJsonView.prototype.updateKeyValuePair = function(result, option) {
      var rows, thead;
      thead = this.arrayContentTable.append("thead").append("tr");
      rows = this.arrayContentTable.append("tbody").selectAll("tr").data(Object.keys(result)).enter().append("tr").each(function(key) {
        var pathFragment;
        if (!(result[key] instanceof Array || result[key] instanceof Object)) {
          d3.select(this).append("th").text(key);
          return d3.select(this).append("td").text(result[key] != null ? result[key].toString() : "null");
        } else {
          pathFragment = getPathFragmentForKey(result, key);
          d3.select(this).append("th").append("a").attr("href", "#").text(pathFragment.get("fragment")).on("click", function() {
            d3.event.preventDefault();
            bangJsonView.model.add(pathFragment);
            return bangJsonView.model.trigger("path:update");
          });
          if (result[key] instanceof Array) {
            return d3.select(this).append("td").text("Array with " + result[key].length + " elements");
          } else {
            return d3.select(this).append("td").text("Object with " + (_.size(result[key])) + " key value pairs");
          }
        }
      });
      thead.append("th").attr("class", "sortable").html("Key<span class='glyphicon glyphicon-sort'></span>").on("click", function() {
        var icon, iconClass, sortDescription;
        icon = $(this).find(".glyphicon").removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt glyphicon-sort-by-alphabet");
        if (icon.attr("aria-sort") === "ascending") {
          sortDescription = "descending";
          iconClass = "glyphicon-sort-by-alphabet-alt";
        } else {
          sortDescription = "ascending";
          iconClass = "glyphicon-sort-by-alphabet";
        }
        icon.attr("aria-sort", sortDescription).addClass(iconClass);
        return rows.sort(d3[sortDescription]);
      });
      return thead.append("th").text("Value");
    };

    BangJsonView.prototype.updateArrayContent = function(result) {
      var keyStats;
      this.indexSelectorDiv.append("div").attr("class", "input-group").html("<span class=\"input-group-addon\">Element No.</span>\n<input type='number' class='form-control' id='arrayIndex' value='1' min='1' max='" + result.length + "'>\n<span class=\"input-group-addon\">/ " + result.length + "</span>");
      this.indexSelectorDiv.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go").on("click", function() {
        var index;
        d3.event.preventDefault();
        index = parseInt($("#arrayIndex").val()) - 1;
        return bangJsonView.model.navigateToArrayElement(index);
      });
      keyStats = _.chain(result).map(function(row) {
        return _.compact(_.keys(row));
      }).flatten().unique().map(function(key) {
        var types;
        types = _.countBy(result, function(row) {
          return typeof row[key];
        });
        return {
          key: key,
          types: types
        };
      }).value();
      if (keyStats.length > 0) {
        return this.updateArraySchemaList(keyStats, result);
      } else {
        this.codeBlockPre.html(prettyPrint(result, true));
        return $(this.codeBlockPre.node()).show();
      }
    };

    BangJsonView.prototype.updateArrayPluckView = function(result, key) {
      var containsObject, rows, sortHelper, tbody, thead, toolbar;
      thead = this.arrayContentTable.append("thead").append("tr");
      tbody = this.arrayContentTable.append("tbody");
      containsObject = false;
      rows = tbody.selectAll("tr").data(result).enter().append("tr").each(function(value, i) {
        var tr, valueString;
        tr = d3.select(this);
        tr.attr("data-index", i);
        tr.append("th").append("a").attr("href", "#").text("Element " + i).on("click", function() {
          d3.event.preventDefault();
          bangJsonView.model.pop();
          bangJsonView.model.navigateToArrayElement(i);
          if (value instanceof Object) {
            bangJsonView.model.push({
              fragment: key
            });
          }
          return bangJsonView.model.trigger("path:update");
        });
        if (value instanceof Object) {
          containsObject = true;
          tr.append("td").append("pre").html(prettyPrint(value, true) || "{}");
          return tr.attr("data-value", "object");
        } else {
          valueString = value != null ? value.toString() : "null";
          tr.append("td").text(valueString);
          return tr.attr("data-value", valueString);
        }
      });
      sortHelper = function(iconSpan, field) {
        var iconClass, sortDescription;
        iconSpan.parents("tr").find(".sortable .glyphicon").removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt glyphicon-sort-by-alphabet");
        if (iconSpan.attr("aria-sort") === "ascending") {
          sortDescription = "descending";
          iconClass = "glyphicon-sort-by-alphabet-alt";
        } else {
          sortDescription = "ascending";
          iconClass = "glyphicon-sort-by-alphabet";
        }
        iconSpan.attr("aria-sort", sortDescription).addClass(iconClass);
        return $(tbody.node()).children("tr").sort(function(a, b) {
          return d3[sortDescription]($(a).data(field), $(b).data(field));
        }).detach().appendTo($(tbody.node()));
      };
      thead.append("th").attr("class", "sortable").html("Index<span class='glyphicon glyphicon-sort'></span>").on("click", function() {
        return sortHelper($(this).find(".glyphicon"), "index");
      });
      thead.append("th").attr("class", "sortable").html("Value<span class='glyphicon glyphicon-sort'></span>").on("click", function() {
        return sortHelper($(this).find(".glyphicon"), "value");
      });
      if (!containsObject) {
        toolbar = this.arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group");
        toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Value").on("click", function() {
          d3.event.preventDefault();
          bangJsonView.model.pop();
          bangJsonView.model.push(new BangJsonPathFragment({
            fragment: "countBy:" + key
          }));
          return bangJsonView.model.trigger("path:update");
        });
        return toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Type").on("click", function() {
          d3.event.preventDefault();
          bangJsonView.model.pop();
          bangJsonView.model.push(new BangJsonPathFragment({
            fragment: "countByType:" + key
          }));
          return bangJsonView.model.trigger("path:update");
        });
      }
    };

    BangJsonView.prototype.updateArraySchemaList = function(keyStats, array) {
      var rows, thead;
      this.arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group").append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-th' aria-hidden='true'></span> Table View").on("click", (function(_this) {
        return function() {
          d3.event.preventDefault();
          _this.arrayToolbar.text("");
          _this.arrayContentTable.text("");
          return _this.updateArraySchemaTable(keyStats, array);
        };
      })(this));
      thead = this.arrayContentTable.append("thead").append("tr");
      rows = this.arrayContentTable.append("tbody").selectAll("tr").data(keyStats).enter().append("tr");
      rows.append("th").append("a").attr("href", "#").text(function(_arg) {
        var key;
        key = _arg.key;
        return key;
      }).on("click", function(_arg) {
        var key;
        key = _arg.key;
        d3.event.preventDefault();
        bangJsonView.model.push(new BangJsonPathFragment({
          fragment: ":" + key
        }));
        return bangJsonView.model.trigger("path:update");
      });
      rows.append("td").text(function(_arg) {
        var key, times, types;
        key = _arg.key, types = _arg.types;
        times = _.reduce(_.values(types), (function(memo, num) {
          return memo + num;
        }), 0);
        return ("" + times + " (" + ((100 * times / array.length).toFixed(0)) + "%) -- ") + JSON.stringify(types);
      });
      thead.append("th").attr("class", "sortable").html("Key<span class='glyphicon glyphicon-sort'></span>").on("click", function() {
        var icon;
        icon = $(this).find(".glyphicon");
        if (icon.attr("aria-sort") === "ascending") {
          icon.attr("aria-sort", "descending").addClass("glyphicon-sort-by-alphabet-alt").removeClass("glyphicon-sort-by-alphabet");
          return rows.sort(function(a, b) {
            return d3.descending(a.key, b.key);
          });
        } else {
          icon.attr("aria-sort", "ascending").addClass("glyphicon-sort-by-alphabet").removeClass("glyphicon-sort-by-alphabet-alt");
          return rows.sort(function(a, b) {
            return d3.ascending(a.key, b.key);
          });
        }
      });
      return thead.append("th").text("Times occurred in elements");
    };

    BangJsonView.prototype.updateArraySchemaTable = function(keyStats, array) {
      var dismissRow, keys, rows, sortHelper, tbody, thead, titleRow;
      this.arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group").append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-th-list' aria-hidden='true'></span> List View").on("click", (function(_this) {
        return function() {
          d3.event.preventDefault();
          _this.arrayToolbar.text("");
          _this.arrayContentTable.text("");
          return _this.updateArraySchemaList(keyStats, array);
        };
      })(this));
      keys = _.pluck(keyStats, "key");
      thead = this.arrayContentTable.append("thead");
      titleRow = thead.append("tr");
      dismissRow = thead.append("tr");
      tbody = this.arrayContentTable.append("tbody");
      rows = tbody.selectAll("tr").data(array).enter().append("tr");
      rows.append("th").append("a").attr("href", "#").text(function(d, i) {
        return i + 1;
      }).on("click", function(d, i) {
        d3.event.preventDefault();
        return bangJsonView.model.navigateToArrayElement(i);
      });
      rows.each(function(element, i) {
        var currentRow;
        currentRow = d3.select(this);
        return currentRow.selectAll("td[data-key]").data(keys).enter().append("td").attr("data-key", function(key) {
          return key;
        }).attr("data-value", function(key) {
          return element[key];
        }).html(function(key) {
          if (element[key] instanceof Object) {
            return prettyPrint(element[key], true);
          } else {
            return element[key] || "(null)";
          }
        });
      });
      sortHelper = function(iconSpan, field) {
        var iconClass, sortDescription;
        iconSpan.parents("tr").find(".sortable .glyphicon").removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt glyphicon-sort-by-alphabet");
        if (iconSpan.attr("aria-sort") === "ascending") {
          sortDescription = "descending";
          iconClass = "glyphicon-sort-by-alphabet-alt";
        } else {
          sortDescription = "ascending";
          iconClass = "glyphicon-sort-by-alphabet";
        }
        iconSpan.attr("aria-sort", sortDescription).addClass(iconClass);
        return rows.sort(function(a, b) {
          return d3[sortDescription](a[field] || "(null)", b[field] || "(null)");
        });
      };
      titleRow.append("th").text("Index");
      titleRow.selectAll("th[data-key]").data(keys).enter().append("th").attr("class", "sortable").attr("data-key", function(key) {
        return key;
      }).call(function(header) {
        header.append("span").text(function(key) {
          return key;
        });
        return header.append("span").attr("class", "glyphicon glyphicon-sort");
      }).on("click", function(key) {
        return sortHelper($(this).find(".glyphicon"), key);
      });
      dismissRow.append("td");
      return dismissRow.selectAll("td[data-key]").data(keys).enter().append("td").attr("data-key", function(key) {
        return key;
      }).append("small").attr("class", "glyphicon glyphicon-eye-close dismiss").attr("title", "dismiss").on("click", function(key) {
        thead.selectAll("td[data-key='" + key + "'], th[data-key='" + key + "'").remove();
        return rows.selectAll("td[data-key='" + key + "']").remove();
      });
    };

    BangJsonView.prototype.clear = function() {
      this.breadcrumbUl.text("");
      this.indexSelectorDiv.text("");
      this.pageHeader.text("");
      this.codeBlockPre.text("");
      this.arrayToolbar.text("");
      $(this.codeBlockPre.node()).hide();
      return this.arrayContentTable.text("");
    };

    return BangJsonView;

  })(Backbone.View);

  render = function() {
    var queryRow, responseRow, root;
    console.log("Bang will make your life with JSON easier!");
    chrome.runtime.sendMessage({
      stage: "load"
    });
    root = d3.select("body").text("").append("div").attr("class", "container-fluid");
    renderHeader(root.append("div").attr("class", "navbar navbar-default"));
    queryRow = root.append("div").attr("class", "row");
    responseRow = root.append("div").attr("class", "row");
    bangJsonView = new BangJsonView({
      model: new BangJsonPath([
        new BangJsonPathFragment({
          fragment: bang instanceof Array ? "bang[]" : "bang"
        })
      ], {
        baseExpression: "bang"
      }),
      el: queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default panel-primary").attr("id", "navigatorPanel").node()
    });
    bangJsonView.render();
    renderQuery(queryRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel"));
    renderResponse(responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success"));
    $(".panel-heading");
    $(".panel-toggle").click(function(ev) {
      ev.preventDefault();
      $(ev.currentTarget).parent().siblings(".panel-body").toggle();
      if ($("#rawResponse").is(":visible") && $("#rawResponse").is(":empty")) {
        return renderRawResponseJSON();
      }
    });
    root.append("link").attr({
      rel: "stylesheet",
      href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'),
      type: "text/css"
    });
    root.append("link").attr({
      rel: "stylesheet",
      href: chrome.extension.getURL('lib/bang.css'),
      type: "text/css"
    });
    bangJsonView.model.trigger("path:update");
    $("#runQuery").click(didRunQuery);
    return $("#reset, .bang").click(didReset);
  };

  renderRawResponseJSON = function() {
    $("#rawResponse").html(prettyPrint(bang));
    $("#rawResponse [data-index][data-folded]").each(function() {
      var childSiblings, currentIndex, node;
      node = $(this);
      currentIndex = parseInt(node.data("index"));
      childSiblings = node.nextUntil("[data-index=" + currentIndex + "]").filter(function() {
        return $(this).data("index") > currentIndex;
      });
      if (childSiblings.length) {
        node.find(".glyphicon").addClass("glyphicon-minus");
        return node.css("cursor", "pointer");
      }
    });
    return $("#rawResponse [data-index][data-folded]").click(function(ev) {
      var childSiblings, comment, currentIndex, decreaseFoldedTimes, elements, elementsCount, increaseFoldedTimes, next, node;
      node = $(ev.currentTarget);
      currentIndex = parseInt(node.data("index"));
      childSiblings = node.nextUntil("[data-index=" + currentIndex + "]").filter(function() {
        return $(this).data("index") > currentIndex;
      });
      if (!(childSiblings.length > 0)) {
        return;
      }
      next = node.nextAll("[data-index=" + currentIndex + "]").first();
      if (node.data("folded")) {
        node.data("folded", false);
        node.find(".json-comment").text("");
        node.find(".glyphicon").removeClass("glyphicon-plus").addClass("glyphicon-minus").text("");
        node.find(".json-comment").text("");
        decreaseFoldedTimes = function(row) {
          var foldedTimes;
          foldedTimes = row.data("folds") ? parseInt(row.data("folds")) - 1 : 0;
          row.data("folds", foldedTimes);
          if (foldedTimes === 0) {
            return row.show();
          }
        };
        decreaseFoldedTimes(next);
        return childSiblings.each(function() {
          return decreaseFoldedTimes($(this));
        });
      } else {
        node.data("folded", true);
        node.find(".glyphicon").removeClass("glyphicon-minus").addClass("glyphicon-plus").text("");
        comment = next.text().trim();
        if (/^]/.test(comment)) {
          elements = childSiblings.filter("[data-index=" + (currentIndex + 1) + "]");
          elementsCount = elements.length - elements.filter(function() {
            return $(".glyphicon-minus, .glyphicon-plus", this).length > 0;
          }).length;
          comment = "" + elementsCount + " elements" + comment;
        } else {
          comment = "..." + comment;
        }
        node.find(".json-comment").text(comment);
        next.hide();
        childSiblings.hide();
        increaseFoldedTimes = function(row) {
          var foldedTimes;
          foldedTimes = row.data("folds") ? parseInt(row.data("folds")) + 1 : 1;
          return row.data("folds", foldedTimes);
        };
        increaseFoldedTimes(next);
        return childSiblings.each(function() {
          return increaseFoldedTimes($(this));
        });
      }
    });
  };

  renderHeader = function(root) {
    root.html("<div class=\"navbar-header\">\n  <a class=\"navbar-brand\" href=\"http://github.com/roboxue/bang\">Bang\n    <ruby>\n     棒<rt>Bàng</rt>\n    </ruby>\n    <small>(Awesome)</small>\n  </a>\n</div>\n<div class=\"collapse navbar-collapse\">\n  <p class=\"navbar-text\">Lightweight awesome <code>JSON</code> workspace - the raw response is in variable <code class=\"bang\">bang</code></p>\n  <p class=\"navbar-text navbar-right\"><a href=\"#\" class=\"navbar-link\" id=\"dismiss\">Dismiss Workspace</a></p>\n</div>");
    return $("#dismiss").click(function(ev) {
      ev.preventDefault();
      return d3.select("body").text("").append("pre").html(JSON.stringify(JSON.parse(originBody), null, stringifyPadingSize));
    });
  };

  renderResponse = function(root) {
    var header;
    header = root.append("div").attr("class", "panel-heading");
    header.append("span").attr("class", "panel-title").html("Response from <code>" + (bangUri.href()) + "</code> stored into <code class='bang'>bang</code>");
    header.append("div").attr("class", "panel-toggle pull-right").text("toggle details");
    renderUri(root.append("div").attr("class", "form-horizontal panel-footer").attr("id", "uri"));
    return root.append("div").attr("class", "panel-body").style("display", "none").append("div").attr("id", "rawResponse");
  };

  renderUri = function(root) {
    root.html("<div class=\"form-group\" data-key=\"protocol\">\n  <label class=\"control-label col-sm-2\">Protocol</label>\n  <div class=\"col-sm-10\"><p class=\"form-control-static\">" + (bangUri.protocol()) + "</p></div>\n</div>\n<div class=\"form-group has-feedback\" data-key=\"hostname\">\n  <label for=\"uriHostname\" class=\"control-label col-sm-2\">Hostname</label>\n  <div class=\"col-sm-10\">\n    <input type=\"text\" class=\"form-control\" id=\"uriHstname\" placeholder=\"" + (bangUri.hostname() || 'www.myhost.com') + "\">\n    <span class=\"glyphicon glyphicon-warning-sign form-control-feedback\" aria-hidden=\"true\"></span>\n  </div>\n</div>\n<div class=\"form-group has-feedback\" data-key=\"port\">\n  <label for=\"uriPort\" class=\"control-label col-sm-2\">Port</label>\n  <div class=\"col-sm-10\">\n    <input type=\"number\" min=\"0\" max=\"99999\" class=\"form-control\" id=\"uriPort\" placeholder=\"" + (bangUri.port() || '80') + "\">\n    <span class=\"glyphicon glyphicon-warning-sign form-control-feedback\" aria-hidden=\"true\"></span>\n  </div>\n</div>\n<div class=\"form-group has-feedback\" data-key=\"path\">\n  <label for=\"uriPath\" class=\"col-sm-2 control-label\">Path\n  </label>\n  <div class=\"col-sm-10\">\n    <input type=\"text\" class=\"form-control\" id=\"uriPath\" placeholder=\"" + (bangUri.path() || '(/path)') + "\">\n    <span class=\"glyphicon glyphicon-warning-sign form-control-feedback\" aria-hidden=\"true\"></span>\n  </div>\n</div>\n<div class=\"form-group has-feedback\" data-key=\"hash\">\n  <label for=\"uriHash\" class=\"col-sm-2 control-label\">Hash\n  </label>\n  <div class=\"col-sm-10\">\n    <input type=\"text\" class=\"form-control\" id=\"uriHash\" placeholder=\"" + (bangUri.hash() || '(#hash)') + "\" value=\"" + (bangUri.hash()) + "\">\n    <span class=\"glyphicon glyphicon-warning-sign form-control-feedback\" aria-hidden=\"true\"></span>\n  </div>\n</div>\n<div class=\"form-group\">\n  <label class=\"control-label col-sm-2\">Query String</label>\n  <div class=\"col-sm-10\">\n    <pre class=\"form-control-static\" id=\"search\"></pre>\n  </div>\n</div>\n<div id=\"queryParameters\">\n</div>\n<div class=\"form-group\" id=\"addNewQueryParameter\">\n  <div class=\"col-sm-offset-2 col-sm-2\">\n    <button class=\"btn btn-default control-label glyphicon glyphicon-plus-sign\">Add</button>\n  </div>\n  <div class=\"col-sm-4\">\n    <input type=\"text\" class=\"form-control\" id=\"newKey\" placeholder=\"new key\">\n  </div>\n  <div class=\"col-sm-4\">\n    <input type=\"text\" class=\"form-control\" id=\"newValue\" placeholder=\"new value\">\n  </div>\n</div>\n<div class=\"form-group\">\n  <div class=\"col-sm-offset-2 col=sm-10\">\n    <a id=\"refreshLink\">Refresh</a>\n  </div>\n</div>");
    root.selectAll(".form-control-feedback").style({
      display: "none"
    });
    renderQueryParameters();
    $("#uri .form-group[data-key] input").change(function(ev) {
      var defaultValue, key, value, valueToSet;
      key = $(ev.currentTarget).parent().parent().data("key");
      value = $(ev.currentTarget).val();
      defaultValue = $(ev.currentTarget).attr("placeholder");
      valueToSet = value && value !== defaultValue ? value : defaultValue;
      bangUri[key](valueToSet);
      return updateUri($(ev.currentTarget), value && value !== defaultValue);
    });
    $("#search").click(function() {
      return $("#queryParameters").toggle();
    });
    return $("#addNewQueryParameter button").click(function() {
      var newKey, newValue;
      newKey = $("#newKey").val();
      if (newKey) {
        $("#newKey").parent().removeClass("has-error");
      } else {
        return $("#newKey").parent().addClass("has-error");
      }
      newValue = $("#newValue").val();
      if (newValue) {
        bangUri.addSearch(newKey, newValue);
      } else {
        bangUri.addSearch(newKey);
      }
      renderQueryParameters();
      $("#newKey").val("");
      return $("#newValue").val("");
    });
  };

  renderQueryParameters = function() {
    var parameterDiv;
    $("#refreshLink").attr("href", bangUri.href());
    $("#search").text(bangUri.search() || "(null)");
    parameterDiv = d3.select("#queryParameters").text("").selectAll("div.form-group").data(_.pairs(bangUri.search(true))).enter().append("div").attr("class", "form-group has-feedback queryParameter").attr("data-key", function(_arg) {
      var key;
      key = _arg[0];
      return key;
    });
    parameterDiv.append("label").attr("class", "control-label col-sm-offset-2 col-sm-2").attr("for", function(_arg) {
      var key;
      key = _arg[0];
      return "query" + key;
    }).text(function(_arg) {
      var key;
      key = _arg[0];
      return key;
    });
    parameterDiv.append("div").attr("class", "col-sm-7").call(function(inputDiv) {
      inputDiv.append("span").attr("class", "glyphicon glyphicon-warning-sign form-control-feedback").attr("aria-hidden", "true").style("display", "none");
      return inputDiv.append("input").attr({
        placeholder: function(_arg) {
          var key;
          key = _arg[0];
          return originBangUri.search(true)[key];
        },
        type: "text",
        "class": "form-control",
        id: function(_arg) {
          var key;
          key = _arg[0];
          return "query" + key;
        }
      }).on("change", function(_arg) {
        var defaultValue, key, value, valueToSet;
        key = _arg[0];
        value = $(d3.event.currentTarget).val();
        defaultValue = $(d3.event.currentTarget).attr("placeholder");
        valueToSet = value && value !== defaultValue ? value : defaultValue;
        bangUri.setSearch(key, valueToSet);
        return updateUri($(d3.event.currentTarget), value && value !== defaultValue);
      });
    });
    return parameterDiv.append("div").attr("class", "col-sm-1").append("button").attr("class", "glyphicon glyphicon-remove btn btn-default").on("click", function(_arg) {
      var key;
      key = _arg[0];
      bangUri.removeSearch(key);
      return renderQueryParameters();
    });
  };

  updateUri = function(divToUpdate, toggleOn) {
    if (toggleOn) {
      divToUpdate.siblings(".form-control-feedback").show();
      divToUpdate.parent().parent().addClass("has-warning");
    } else {
      divToUpdate.siblings(".form-control-feedback").hide();
      divToUpdate.parent().parent().removeClass("has-warning");
    }
    $("#search").text(bangUri.search() || "(null)");
    return $("#refreshLink").attr("href", bangUri.href());
  };

  renderQuery = function(root) {
    var header;
    header = root.append("div").attr("class", "panel-heading");
    header.append("span").attr("class", "panel-title").html("Custom JavaScript Query");
    return renderQueryForm(root.append("div").attr("class", "panel-body"));
  };

  didRunQuery = function() {
    var error, query, result, _ref;
    query = $("#query").val();
    bangJsonView.clear();
    _ref = runQuery(query), error = _ref.error, result = _ref.result;
    if (error) {
      bangJsonView.codeBlockPre.text(error);
      bangJsonView.codeBlockPre.text(error);
      return $(bangJsonView.codeBlockPre.node()).show();
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
      fragment: bang instanceof Array ? "bang[]" : "bang"
    });
    return bangJsonView.model.trigger("path:update");
  };

  runQuery = function(query) {
    var ex, result;
    try {
      result = eval(query);
      if (result === void 0) {
        return {
          error: "(null)"
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
    return root.html("<div class=\"form-horizontal\">\n  <div class=\"form-group\">\n    <label for=\"query\" class=\"col-sm-2 control-label\">Query</label>\n    <div class=\"col-sm-10\">\n      <textarea class=\"form-control\" id=\"query\" placeholder=\"Any Javascript Expression!\"></textarea>\n      <span id=\"helpBlock\" class=\"help-block\">Supports native Javascript, <a href=\"http://jquery.com\">jQuery</a>, <a href=\"http://d3js.org\">d3.js</a>, <a href=\"http://underscorejs.org\">underscore.js</a>, <a href=\"http://backbonejs.org\">backbone.js</a></span>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"col-sm-offset-2 col-sm-10\">\n      <button type=\"submit\" class=\"btn btn-default\" id=\"runQuery\">Run it!</button>\n      <button type=\"reset\" class=\"btn btn-default\" id=\"reset\">Reset</button>\n    </div>\n  </div>\n</div>");
  };

  stringifyPadingSize = 4;

  replacer = function(match, pIndent, pKey, pVal, pEnd) {
    var index, key, r, str, val;
    key = '<span class=json-key>';
    val = '<span class=json-value>';
    str = '<span class=json-string>';
    r = pIndent || '';
    index = r.length / stringifyPadingSize;
    r = r.replace(/\s/g, '&nbsp;');
    if (pKey) {
      r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
    }
    if (pVal) {
      r = r + (pVal[0] === '"' ? str : val) + pVal + '</span>';
    }
    r += pEnd || '';
    return "<p data-folded='false' data-index='" + index + "' class='json-row row'><span class='glyphicon col-sm-1'></span><span class='col-sm-11 json-content'>" + r + "<span class='json-comment'></span></span></p>";
  };

  replacerSimplified = function(match, pIndent, pKey, pVal, pEnd) {
    var key, r, str, val;
    key = '<span class=json-key>';
    val = '<span class=json-value>';
    str = '<span class=json-string>';
    r = pIndent || '';
    r = r.replace(/\s/g, '&nbsp;');
    if (pKey) {
      r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
    }
    if (pVal) {
      r = r + (pVal[0] === '"' ? str : val) + pVal + '</span>';
    }
    r += pEnd || '';
    return r;
  };

  prettyPrint = function(obj, simplifiedVersion) {
    var jsonLine, replacerToUse;
    replacerToUse = simplifiedVersion ? replacerSimplified : replacer;
    jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,\[\{}\]]*)?$/mg;
    return JSON.stringify(obj, null, stringifyPadingSize).replace(/&/g, '&amp;').replace(/\\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(jsonLine, replacerToUse);
  };

  load = function() {
    var ex;
    try {
      if (!(document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName === "PRE" || document.body.children.length === 0))) {
        return;
      }
      originBody = document.body.children.length ? $("pre").text() : document.body;
      if (!originBody) {
        return;
      }
      bang = JSON.parse(originBody);
      originBangUri = bangUri = new URI(document.location.href);
    } catch (_error) {
      ex = _error;
      console.log("Document not valid json, bang will not work: " + ex);
      console.log("Bang can't work on HTML and XML pages");
      return;
    }
    return render();
  };

  load();

}).call(this);
