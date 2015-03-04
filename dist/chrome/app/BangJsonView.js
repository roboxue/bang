(function() {
  var prettyPrint, replacer,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["d3", "underscore", "backbone", "app/BangJsonPathFragment", "app/BangJsonPath"], function(d3, _, Backbone, BangJsonPathFragment, BangJsonPath) {
    var BangJsonView;
    return BangJsonView = (function(_super) {
      __extends(BangJsonView, _super);

      function BangJsonView() {
        return BangJsonView.__super__.constructor.apply(this, arguments);
      }

      BangJsonView.prototype.model = BangJsonPath;


      /*
      |------------------------------|
      |.panel-body ------------------|
      | | breadcrumbUl --------------|
      | | pageHeader ----------------|
      | | arrayToolbar --------------|
      |------------------------------|
      |.panel-footer ----------------|
      | | indexSelectorDiv ----------|
      |------------------------------|
      |.panel-body ------------------|
      | | codeBlockPre --------------|
      | | arrayContentTable ---------|
      |------------------------------|
      |.panel-footer ----------------|
      | | indexSelectorDiv ----------|
      |------------------------------|
       */

      BangJsonView.prototype.render = function() {
        var header, panelBody, root;
        root = d3.select(this.el);
        header = root.append("div").attr("class", "panel-heading");
        this.renderHeader(header);
        panelBody = root.append("div").attr("class", "panel-body");
        root.append("div").attr("class", "panel-footer");
        this.breadcrumbUl = panelBody.append("ul").attr("class", "breadcrumb");
        this.pageHeader = panelBody.append("div").attr("class", "page-header");
        this.arrayToolbar = panelBody.append("div").attr("class", "btn-toolbar").attr("role", "toolbar");
        this.codeBlockPre = root.append("div").attr("class", "panel-body").append("pre");
        $(this.codeBlockPre.node()).hide();
        this.arrayContentTable = root.append("table").attr("class", "table table-striped");
        root.append("div").attr("class", "panel-footer");
        this.indexSelectorDiv = root.selectAll(".panel-footer").append("div").attr("class", "form-inline");
        return this.listenTo(this.model, "change:result", this.update);
      };

      BangJsonView.prototype.renderHeader = function(header) {
        return header.append("span").attr("class", "panel-title").html("JSON Navigator");
      };

      BangJsonView.prototype.update = function(result) {
        var type;
        this.clear();
        type = this.model.last().getFragmentType();
        this.updateBreadcrumb(this.model);
        if (type === "ArrayElement") {
          this.updateArrayEnumerator(this.model.last().getArrayIndex());
        }
        if (result instanceof Array) {
          return this.updateArrayResult(result, type);
        } else if (result instanceof Object) {
          return this.updateObjectResult(result, type);
        } else {
          return this.updateStringResult(result);
        }
      };

      BangJsonView.prototype.updateBreadcrumb = function(path) {
        return this.breadcrumbUl.selectAll("li").data(path.models).enter().append("li").each(function(pathFragment, i) {
          if (i === path.length - 1) {
            if (pathFragment.getBaseFragment()) {
              return d3.select(this).append("a").attr("href", "#").text(pathFragment.getDisplayName()).on("click", function() {
                d3.event.preventDefault();
                path.last().set("fragment", pathFragment.getBaseFragment());
                return path.trigger("change:path");
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

      BangJsonView.prototype.updateArrayResult = function(result, type) {
        var keyName;
        if (type === "ArrayKey") {
          keyName = this.model.last().getArrayKeyName().keyName;
          this.pageHeader.html("<h3>Key \"" + keyName + "\" in Array</h3>");
          return this.updateArrayPluckView(result, keyName);
        } else {
          if (_.isEmpty(result)) {
            return this.pageHeader.html("<h3>Empty array</h3>");
          } else {
            this.pageHeader.html("<h3>Array with " + result.length + " elements</h3>");
            return this.updateArrayContent(result);
          }
        }
      };

      BangJsonView.prototype.updateObjectResult = function(result, type) {
        var keyName, method, _ref;
        if (_.isEmpty(result)) {
          this.pageHeader.html("<h3>Empty Object</h3>");
          return this.updateCodeBlock("<span>Empty Object</span>");
        } else {
          this.updateKeyValuePair(result);
          if (type === "ArrayKey") {
            _ref = this.model.last().getArrayKeyName(), keyName = _ref.keyName, method = _ref.method;
            if (method === "countBy") {
              this.pageHeader.html("<h3>Count by \"" + keyName + "\" in Array</h3>");
            }
            if (method === "countByType") {
              return this.pageHeader.html("<h3>Count by the type of \"" + keyName + "\" in Array</h3>");
            }
          } else {
            return this.pageHeader.html("<h3>Object with " + (_.size(result)) + " keys</h3>");
          }
        }
      };

      BangJsonView.prototype.updateStringResult = function(result) {
        this.pageHeader.html("<h3>String Value</h3>");
        return this.updateCodeBlock(prettyPrint(result, true));
      };

      BangJsonView.prototype.updateCodeBlock = function(htmlContent) {
        this.codeBlockPre.html(htmlContent);
        return $(this.codeBlockPre.node()).show();
      };

      BangJsonView.prototype.updateArrayEnumerator = function(_arg) {
        var arrayName, index, maxLength, pager, query;
        arrayName = _arg.arrayName, index = _arg.index;
        pager = this.indexSelectorDiv.append("nav").append("ul").attr("class", "pager");
        query = this.model.getQuery(this.model.slice(0, this.model.length - 1).concat(new BangJsonPathFragment({
          fragment: arrayName + "[]"
        })));
        maxLength = eval(query).length;
        if (index > 0) {
          pager.append("li").attr("class", "previous").append("a").attr("href", "#").html("&larr;Previous").on("click", (function(_this) {
            return function() {
              d3.event.preventDefault();
              return _this.model.navigateToArrayElement(index - 1);
            };
          })(this));
        } else {
          pager.append("li").attr("class", "previous disabled").append("a").attr("href", "#").html("&larr;Previous");
        }
        pager.append("li").html("" + (index + 1) + " / " + maxLength);
        if (index < maxLength - 1) {
          return pager.append("li").attr("class", "next").append("a").attr("href", "#").html("Next&rarr;").on("click", (function(_this) {
            return function() {
              d3.event.preventDefault();
              return _this.model.navigateToArrayElement(index + 1);
            };
          })(this));
        } else {
          return pager.append("li").attr("class", "next disabled").append("a").attr("href", "#").html("Next&rarr;");
        }
      };

      BangJsonView.prototype.updateArrayNavigator = function(result) {
        this.indexSelectorDiv.append("div").attr("class", "input-group").html("<span class=\"input-group-addon\">Element No.</span>\n<input type='number' class='form-control' id='arrayIndex' value='1' min='1' max='" + result.length + "'>\n<span class=\"input-group-addon\">/ " + result.length + "</span>");
        return this.indexSelectorDiv.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go").on("click", (function(_this) {
          return function() {
            var index;
            d3.event.preventDefault();
            index = parseInt(_this.$("#arrayIndex").val()) - 1;
            return _this.model.navigateToArrayElement(index);
          };
        })(this));
      };

      BangJsonView.prototype.updateKeyValuePair = function(result) {
        var path, rows, thead;
        path = this.model;
        thead = this.arrayContentTable.append("thead").append("tr");
        rows = this.arrayContentTable.append("tbody").selectAll("tr").data(Object.keys(result)).enter().append("tr").each(function(key) {
          var pathFragment;
          if (!(result[key] instanceof Array || result[key] instanceof Object)) {
            d3.select(this).append("th").text(key);
            return d3.select(this).append("td").text(result[key] != null ? result[key].toString() : "null");
          } else {
            pathFragment = BangJsonPathFragment.prototype.getPathFragmentForKey(result, key);
            d3.select(this).append("th").append("a").attr("href", "#").text(pathFragment.get("fragment")).on("click", function() {
              d3.event.preventDefault();
              path.add(pathFragment);
              return path.trigger("change:path");
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
        this.updateArrayNavigator(result);
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
          return this.updateArraySchemaTable(keyStats, result);
        } else {
          return this.updateCodeBlock(prettyPrint(result, true));
        }
      };

      BangJsonView.prototype.updateArrayPluckView = function(result, key) {
        var path, rows, sortHelper, tbody, thead;
        path = this.model;
        thead = this.arrayContentTable.append("thead").append("tr");
        tbody = this.arrayContentTable.append("tbody");
        rows = tbody.selectAll("tr").data(result).enter().append("tr").each(function(value, i) {
          var tr, valueString;
          tr = d3.select(this);
          tr.attr("data-index", i);
          tr.append("th").append("a").attr("href", "#").text("Element " + i).on("click", function() {
            d3.event.preventDefault();
            path.pop();
            path.navigateToArrayElement(i);
            if (value instanceof Object) {
              path.push({
                fragment: key
              });
            }
            return path.trigger("change:path");
          });
          if (value instanceof Object) {
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
        if (_.every(result, function(value) {
          return !_.isObject(value);
        })) {
          return this.updateToolbar();
        }
      };

      BangJsonView.prototype.updateToolbar = function() {
        var keyName, path, toolbar;
        keyName = this.model.last().getArrayKeyName().keyName;
        path = this.model;
        toolbar = this.arrayToolbar.append("div").attr("class", "btn-group").attr("role", "group");
        toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Value").on("click", function() {
          d3.event.preventDefault();
          path.pop();
          path.push(new BangJsonPathFragment({
            fragment: "countBy:" + keyName
          }));
          return path.trigger("change:path");
        });
        return toolbar.append("button").attr("class", "btn btn-default").html("<span class='glyphicon glyphicon-list-alt' aria-hidden='true'></span> Count By Type").on("click", function() {
          d3.event.preventDefault();
          path.pop();
          path.push(new BangJsonPathFragment({
            fragment: "countByType:" + keyName
          }));
          return path.trigger("change:path");
        });
      };

      BangJsonView.prototype.updateArraySchemaList = function(keyStats, array) {
        var path, rows, thead;
        path = this.model;
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
          path.push(new BangJsonPathFragment({
            fragment: ":" + key
          }));
          return path.trigger("change:path");
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
        var dismissRow, keys, path, rows, sortHelper, tbody, thead, titleRow;
        path = this.model;
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
          return path.navigateToArrayElement(i);
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

      BangJsonView.prototype.showErrorMessage = function(errorMessage) {
        this.codeBlockPre.text(errorMessage);
        return $(this.codeBlockPre.node()).show();
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
  });

  replacer = function(match, pIndent, pKey, pVal, pEnd) {
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

  prettyPrint = function(obj) {
    var jsonLine;
    jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,\[\{}\]]*)?$/mg;
    return JSON.stringify(obj, null, 4).replace(/&/g, '&amp;').replace(/\\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(jsonLine, replacer);
  };

}).call(this);
