var BangJsonPath, BangJsonPathFragment, BangJsonView, BangQueryPanelView, BangRequestPanelView, keyInputId, newQueryParameterFormId, queryStringBlockId, queryStringListId, refreshLinkId, valueInputId,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BangJsonPathFragment = (function(_super) {
  var arrayAndArrayElementRx, arrayElementRx, arrayRx, keyRx;

  __extends(BangJsonPathFragment, _super);

  function BangJsonPathFragment() {
    return BangJsonPathFragment.__super__.constructor.apply(this, arguments);
  }

  keyRx = /(^|^countBy|^countByType):(.+)$/;

  arrayRx = /^(.+)\[]$/;

  arrayElementRx = /^(.+)\[(\d+)]$/;

  arrayAndArrayElementRx = /^(.+)\[\d*]$/;

  keyRx = /(^|^countBy|^countByType):(.+)$/;

  BangJsonPathFragment.prototype.getQueryFragment = function() {
    var arrayName, fullExpression, keyName, method, type, _ref, _ref1;
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
              underscore: "countBy(function(row){ return typeof row['" + keyName + "']; })"
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
    var fullExpression, keyName, method, _ref;
    if (keyRx.test(this.get("fragment"))) {
      _ref = this.get("fragment").match(keyRx), fullExpression = _ref[0], method = _ref[1], keyName = _ref[2];
      return {
        method: method,
        keyName: keyName
      };
    }
  };

  BangJsonPathFragment.prototype.getArrayIndex = function() {
    var arrayIndex, arrayName, fullExpression, _ref;
    if (arrayElementRx.test(this.get("fragment"))) {
      _ref = this.get("fragment").match(arrayElementRx), fullExpression = _ref[0], arrayName = _ref[1], arrayIndex = _ref[2];
      return {
        arrayName: arrayName,
        index: parseInt(arrayIndex)
      };
    }
  };

  BangJsonPathFragment.prototype.getDisplayName = function() {
    return this.get("fragment");
  };

  BangJsonPathFragment.prototype.getBaseFragment = function() {
    var arrayName, fullExpression, fullName, keyName, method, _ref, _ref1;
    if (arrayElementRx.test(this.get("fragment"))) {
      _ref = this.get("fragment").match(arrayElementRx), fullName = _ref[0], arrayName = _ref[1];
      return arrayName + "[]";
    } else if (keyRx.test(this.get("fragment"))) {
      _ref1 = this.get("fragment").match(keyRx), fullExpression = _ref1[0], method = _ref1[1], keyName = _ref1[2];
      if (method) {
        return ":" + keyName;
      }
    }
  };

  BangJsonPathFragment.prototype.getArrayFragment = function(index) {
    var arrayName, fullName, _ref;
    if (arrayAndArrayElementRx.test(this.get("fragment"))) {
      _ref = this.get("fragment").match(arrayAndArrayElementRx), fullName = _ref[0], arrayName = _ref[1];
      return arrayName + ("[" + index + "]");
    }
  };

  return BangJsonPathFragment;

})(Backbone.Model);


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
      return this.baseExpression = models[0].getDisplayName();
    }
  };

  BangJsonPath.prototype.getQuery = function(path, forDisplay) {
    var baseExpression, reducer, toReturn, underscoreWrapped;
    underscoreWrapped = false;
    reducer = (function(pv, cv, index) {
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
    this.trigger("path:update");
    return this;
  };

  BangJsonPath.prototype.navigateToArrayElement = function(index) {
    var arrayFragment;
    if (arrayFragment = this.last().getArrayFragment(index)) {
      this.last().set("fragment", arrayFragment);
      this.trigger("path:update");
    }
    return this;
  };

  return BangJsonPath;

})(Backbone.Collection);


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
    var arrayName, index, maxLength, pager, query;
    arrayName = _arg.arrayName, index = _arg.index;
    pager = this.indexSelectorDiv.append("nav").append("ul").attr("class", "pager");
    query = bangJsonView.model.getQuery(bangJsonView.model.slice(0, bangJsonView.model.length - 1).concat(new BangJsonPathFragment({
      fragment: arrayName + "[]"
    })));
    maxLength = eval(query).length;
    if (index > 0) {
      pager.append("li").attr("class", "previous").append("a").attr("href", "#").html("&larr;Previous").on("click", function() {
        d3.event.preventDefault();
        return bangJsonView.model.navigateToArrayElement(index - 1);
      });
    } else {
      pager.append("li").attr("class", "previous disabled").append("a").attr("href", "#").html("&larr;Previous");
    }
    pager.append("li").html("" + (index + 1) + " / " + maxLength);
    if (index < maxLength - 1) {
      return pager.append("li").attr("class", "next").append("a").attr("href", "#").html("Next&rarr;").on("click", function() {
        d3.event.preventDefault();
        return bangJsonView.model.navigateToArrayElement(index + 1);
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
          if (element[key] != null) {
            return element[key].toString();
          } else {
            return "(null)";
          }
        }
      });
    });
    sortHelper = function(iconSpan, field) {
      var getter, iconClass, sortDescription;
      iconSpan.parents("tr").find(".sortable .glyphicon").removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt glyphicon-sort-by-alphabet");
      if (iconSpan.attr("aria-sort") === "ascending") {
        sortDescription = "descending";
        iconClass = "glyphicon-sort-by-alphabet-alt";
      } else {
        sortDescription = "ascending";
        iconClass = "glyphicon-sort-by-alphabet";
      }
      iconSpan.attr("aria-sort", sortDescription).addClass(iconClass);
      getter = function(data) {
        if (data[field] != null) {
          return data[field].toString();
        } else {
          return "(null)";
        }
      };
      return rows.sort(function(a, b) {
        return d3[sortDescription](getter(a), getter(b));
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
    "click #rest": "doReset"
  };

  BangQueryPanelView.prototype.render = function() {
    var root;
    root = d3.select(this.el);
    this.renderHeader(root.append("div").attr("class", "panel-heading"));
    return this.renderQueryForm(root.append("div").attr("class", "panel-body"));
  };

  BangQueryPanelView.prototype.renderHeader = function(header) {
    return header.append("span").attr("class", "panel-title").html("Custom JavaScript Query");
  };

  BangQueryPanelView.prototype.renderQueryForm = function(body) {
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
    return body.html(window.Milk.render(bangTemplates.BangQueryForm, page));
  };

  BangQueryPanelView.prototype.doRunQuery = function() {
    var query;
    chrome.runtime.sendMessage({
      stage: "query"
    });
    query = $("#" + this.textAreaId).val();
    return this.trigger("runQuery", query);
  };

  BangQueryPanelView.prototype.doReset = function() {
    $("#" + this.textAreaId).val("bang");
    bangJsonView.model.baseExpression = "bang";
    bangJsonView.model.set({
      fragment: bang instanceof Array ? "bang[]" : "bang"
    });
    return bangJsonView.model.trigger("path:update");
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

queryStringBlockId = "uriSearch";

queryStringListId = "queryParameters";

newQueryParameterFormId = "addNewQueryParameter";

keyInputId = "newKey";

valueInputId = "newValue";

refreshLinkId = "refreshLink";

BangRequestPanelView = (function(_super) {
  __extends(BangRequestPanelView, _super);

  function BangRequestPanelView() {
    return BangRequestPanelView.__super__.constructor.apply(this, arguments);
  }

  BangRequestPanelView.prototype.model = URI;

  BangRequestPanelView.prototype.events = {
    "change .form-group[data-key] input": "onUpdateUri",
    "click #uriSearch": "onToggleQueryStringDetail",
    "click #addNewQueryParameter button": "onAddNewQueryParameter"
  };

  BangRequestPanelView.prototype.render = function(root) {
    root = d3.select(this.el);
    this.renderHeader(root.append("div").attr("class", "panel-heading"));
    this.renderRequestUri(root.append("div").attr("class", "form-horizontal panel-footer").attr("id", "uri"));
    return root.append("div").attr("class", "panel-body").style("display", "none").append("div").attr("id", "rawResponse");
  };

  BangRequestPanelView.prototype.renderHeader = function(header) {
    var href;
    href = this.model.href();
    header.append("span").attr("class", "panel-title").html("Response from <code>" + href + "</code> stored into <code class='bang'>bang</code>");
    return header.append("div").attr("class", "panel-toggle pull-right").text("toggle details");
  };

  BangRequestPanelView.prototype.renderRequestUri = function(root) {
    var page;
    page = {
      protocol: this.model.protocol(),
      hostname: this.model.hostname(),
      port: this.model.port(),
      path: this.model.path(),
      hash: this.model.hash(),
      queryStringBlockId: queryStringBlockId,
      queryStringListId: queryStringListId,
      newQueryParameterFormId: newQueryParameterFormId,
      keyInputId: keyInputId,
      valueInputId: valueInputId,
      refreshLinkId: refreshLinkId
    };
    this.originQueryParam = this.model.search(true);
    root.html(window.Milk.render(bangTemplates.BangRequestUri, page));
    root.selectAll(".form-control-feedback").style("display", "none");
    return this.renderQueryParameters();
  };

  BangRequestPanelView.prototype.renderQueryParameters = function() {
    var inputDiv, parameterDiv;
    $("#" + refreshLinkId).attr("href", this.model.href());
    $("#" + queryStringBlockId).text(this.model.search() || "(no query string)");
    parameterDiv = d3.select("#" + queryStringListId).text("").selectAll("div.form-group").data(_.pairs(this.model.search(true))).enter().append("div").attr("class", "form-group has-feedback queryParameter").attr("data-key", function(_arg) {
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
    inputDiv = parameterDiv.append("div").attr("class", "col-sm-7");
    inputDiv.append("span").attr("class", "glyphicon glyphicon-warning-sign form-control-feedback").attr("aria-hidden", "true").style("display", "none");
    inputDiv.append("input").attr({
      placeholder: (function(_this) {
        return function(_arg) {
          var key;
          key = _arg[0];
          return _this.originQueryParam[key];
        };
      })(this),
      value: function(_arg) {
        var key, value;
        key = _arg[0], value = _arg[1];
        return value;
      },
      type: "text",
      "class": "form-control",
      id: function(_arg) {
        var key;
        key = _arg[0];
        return "query" + key;
      }
    }).on("change", (function(_this) {
      return function(_arg) {
        var defaultValue, key, value, valueToSet;
        key = _arg[0];
        value = $(d3.event.currentTarget).val();
        defaultValue = $(d3.event.currentTarget).attr("placeholder");
        valueToSet = value && value !== defaultValue ? value : defaultValue;
        _this.model.setSearch(key, valueToSet);
        return _this.updateUri($(d3.event.currentTarget), value && value !== defaultValue);
      };
    })(this));
    return parameterDiv.append("div").attr("class", "col-sm-1").append("button").attr("class", "glyphicon glyphicon-remove btn btn-default").on("click", (function(_this) {
      return function(_arg) {
        var key;
        key = _arg[0];
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

  BangRequestPanelView.prototype.updateUri = function(divToUpdate, toggleOn) {
    if (toggleOn) {
      divToUpdate.siblings(".form-control-feedback").show();
      divToUpdate.parent().parent().addClass("has-warning");
    } else {
      divToUpdate.siblings(".form-control-feedback").hide();
      divToUpdate.parent().parent().removeClass("has-warning");
    }
    $("#" + queryStringBlockId).text(this.model.search() || "(no query string)");
    return $("#" + refreshLinkId).attr("href", this.model.href());
  };

  BangRequestPanelView.prototype.onToggleQueryStringDetail = function() {
    return $("#" + queryStringListId).toggle();
  };

  BangRequestPanelView.prototype.onAddNewQueryParameter = function() {
    var newKey, newValue;
    newKey = $("#" + keyInputId).val();
    if (newKey) {
      $("#" + keyInputId).parent().removeClass("has-error");
    } else {
      return $("#" + keyInputId).parent().addClass("has-error");
    }
    newValue = $("#" + valueInputId).val();
    if (newValue) {
      this.model.addSearch(newKey, newValue);
    } else {
      this.model.addSearch(newKey);
    }
    this.renderQueryParameters();
    $("#" + keyInputId).val("");
    return $("#" + valueInputId).val("");
  };

  return BangRequestPanelView;

})(Backbone.View);
