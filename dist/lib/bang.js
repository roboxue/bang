(function() {
  var bang, bangUri, didReset, didRunQuery, getPathFragmentForKey, getQueryFromPath, load, queryResult, render, renderHeader, renderNavigator, renderQuery, renderQueryForm, renderResponse, runQuery, updateNavigator;

  bang = null;

  bangUri = null;

  queryResult = null;

  render = function() {
    var queryRow, responseRow, root;
    console.log("Bang will make your life with JSON easier!");
    root = d3.select("body").text("").append("div").attr("class", "container");
    renderHeader(root.append("div").attr("class", "navbar navbar-default"));
    queryRow = root.append("div").attr("class", "row");
    responseRow = root.append("div").attr("class", "row");
    renderQuery(queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-default").attr("id", "queryPanel"));
    renderNavigator(queryRow.append("div").attr("class", "col-lg-6 col-md-6 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success").attr("id", "navigatorPanel"));
    renderResponse(responseRow.append("div").attr("class", "col-lg-12 col-md-12 col-sm-12 col-xs-12").append("div").attr("class", "panel panel-success"));
    $(".panel-heading").css({
      cursor: "pointer",
      "word-break": "break-all"
    }).click(function(ev) {
      return $(ev.currentTarget).siblings(".panel-body").toggle();
    });
    return root.append("link").attr({
      rel: "stylesheet",
      href: chrome.extension.getURL('lib/bootstrap/bootstrap.css'),
      type: "text/css"
    });
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

  renderNavigator = function(root) {
    var panelBody;
    root.append("div").attr("class", "panel-heading").text("Response Navigator");
    panelBody = root.append("div").attr("class", "panel-body");
    panelBody.append("ul").attr("class", "breadcrumb");
    panelBody.append("div").attr("class", "form-inline");
    panelBody.append("pre").style("display", "none");
    root.append("ul").attr("class", "list-group");
    root.append("table").attr("class", "table");
    return updateNavigator(["bang"]);
  };

  didRunQuery = function() {
    var arrayNavigatior, autocomplete, autocompleteTable, codeBlock, error, navigator, query, result, _ref;
    query = $("#query").val();
    navigator = d3.select("#navigatorPanel .breadcrumb").text("");
    arrayNavigatior = d3.select("#navigatorPanel .form-inline").text("");
    autocomplete = d3.select("#navigatorPanel .list-group").text("");
    autocompleteTable = d3.select("#navigatorPanel table").text("");
    codeBlock = d3.select("#navigatorPanel pre").style("display", "none").text("");
    _ref = runQuery(query), error = _ref.error, result = _ref.result;
    if (error) {
      return codeBlock.text(error);
    } else {
      queryResult = result;
      return updateNavigator(["queryResult"]);
    }
  };

  didReset = function() {
    $("#query").val("bang");
    return updateNavigator(["bang"]);
  };

  runQuery = function(query, options) {
    var ex, result;
    try {
      if (!(options && options.silent)) {
        $("#query").val(query);
      }
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

  updateNavigator = function(path) {
    var arrayNavigatior, autocomplete, autocompleteTable, codeBlock, error, navigator, query, result, _ref;
    navigator = d3.select("#navigatorPanel .breadcrumb").text("");
    arrayNavigatior = d3.select("#navigatorPanel .form-inline").text("");
    autocomplete = d3.select("#navigatorPanel .list-group").text("");
    autocompleteTable = d3.select("#navigatorPanel table").text("");
    codeBlock = d3.select("#navigatorPanel pre").style("display", "none").text("");
    query = getQueryFromPath(path);
    console.log("Update Navigator", path, query);
    _ref = runQuery(query, {
      silent: true
    }), error = _ref.error, result = _ref.result;
    if (error) {
      return navigator.text(JSON.stringify(error, null, 4));
    }
    navigator.selectAll("li").data(path).enter().append("li").each(function(pathFragment, i) {
      return d3.select(this).append("a").attr("href", "#").text(pathFragment).on("click", function(currentPathFragment) {
        var node;
        d3.event.preventDefault();
        if (node = pathFragment.match(/^(.*)\[(\d+)]$/)) {
          return updateNavigator(path.slice(0, i).concat(node[1] + "[]"));
        } else {
          return updateNavigator(path.slice(0, i + 1));
        }
      });
    });
    if (result instanceof Array) {
      arrayNavigatior.append("div").attr("class", "form-group").html("<label for='arrayIndex'>Index (0 - " + (result.length - 1) + ")</label>\n<input type='number' class='form-control' id='arrayIndex' value='0' min='0' max='" + (result.length - 1) + "'>");
      return arrayNavigatior.append("button").attr("type", "submit").attr("class", "btn btn-default").text("Go").on("click", function() {
        var arrayIndex, node, pathFragment;
        d3.event.preventDefault();
        arrayIndex = $("#arrayIndex").val();
        node = path[path.length - 1].match(/^(.*)\[(\d*)]$/);
        pathFragment = node ? node[1] : path[path.length - 1];
        return updateNavigator(path.slice(0, path.length - 1).concat(pathFragment + ("[" + arrayIndex + "]")));
      });
    } else if (result instanceof Object) {
      return autocomplete.selectAll("li").data(Object.keys(result)).enter().append("li").attr("class", "list-group-item").each(function(key) {
        var pathFragment;
        if (!(result[key] instanceof Array || result[key] instanceof Object)) {
          d3.select(this).append("span").text(key);
          return d3.select(this).append("span").attr("class", "pull-right").text(result[key]);
        } else {
          pathFragment = getPathFragmentForKey(result, key);
          return d3.select(this).append("a").attr("href", "#").text(pathFragment).on("click", function() {
            d3.event.preventDefault();
            return updateNavigator(path.concat(pathFragment));
          });
        }
      });
    } else {
      return codeBlock.style("display", null).text(JSON.stringify(result, null, 4));
    }
  };

  getQueryFromPath = function(path) {
    var query;
    query = path.reduce((function(pv, cv, index, array) {
      var node;
      if (index !== 0) {
        pv += ".";
      }
      if (node = cv.match(/^(.*)\[(\d*)]$/)) {
        console.log(node);
        pv += node[1];
        if (node[2]) {
          pv += "[" + node[2] + "]";
        }
        return pv;
      } else {
        return pv += cv;
      }
    }), "");
    return query;
  };

  getPathFragmentForKey = function(data, key) {
    if (data[key] instanceof Array) {
      return key + "[]";
    } else if (data[key] instanceof Object) {
      return key;
    } else {
      return key + "#";
    }
  };

  renderQueryForm = function(root) {
    root.html("<div class=\"form-horizontal\">\n  <div class=\"form-group\">\n    <label for=\"query\" class=\"col-sm-2 control-label\">Query</label>\n    <div class=\"col-sm-10\">\n      <textarea class=\"form-control\" id=\"query\" placeholder=\"Any Javascript Expression!\"></textarea>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"col-sm-offset-2 col-sm-10\">\n      <button type=\"submit\" class=\"btn btn-default\" id=\"runQuery\">Run it!</button>\n      <button type=\"reset\" class=\"btn btn-default\" id=\"reset\">Reset</button>\n    </div>\n  </div>\n</div>");
    if (bang instanceof Array) {
      $("#query").val("_.size(bang)");
    } else {
      $("#query").val("_.keys(bang)");
    }
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
