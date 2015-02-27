bangTemplates = {
    "BangQueryForm" : '<div class="container-fluid"><div class="collapse navbar-collapse row"><div class="form-horizontal navbar-left col-md-10"><div class="form-group"><label for="{{textAreaId}}" class="col-md-3 control-label"><span class="navbar-text">Javascript Query</span></label><div class="col-md-9"><textarea class="form-control" id="{{textAreaId}}" placeholder="{{textAreaPlaceholder}}"></textarea><span id="helpBlock" class="help-block">Raw JSON Object is in variable <code class="bang">bang</code>. Supports native Javascript, plus&nbsp;{{#supportedFrameworks}}<a href="{{url}}">{{name}}</a>&nbsp;{{/supportedFrameworks}}</span></div></div></div><div class="navbar-right"><button type="submit" class="btn btn-default" id="runQuery">Run it!</button><button type="reset" class="btn btn-default" id="reset">Reset</button></div></div></div>',
    "BangRequestUri" : '<div class="form-group urlComponent" data-key="protocol"><label class="control-label col-sm-2">Protocol</label><div class="col-sm-10"><p id="uriProtocol" class="form-control-static">{{protocol}}</p></div></div><div class="form-group urlComponent has-feedback" data-key="hostname"><label for="uriHostname" class="control-label col-sm-2">Hostname</label><div class="col-sm-10"><input type="text" class="form-control" id="uriHostname" placeholder="{{hostname}}" value="{{hostname}}"><span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span></div></div><div class="form-group urlComponent has-feedback" data-key="port"><label for="uriPort" class="control-label col-sm-2">Port</label><div class="col-sm-10"><input type="number" min="0" max="99999" class="form-control" id="uriPort" placeholder="{{#port}}{{port}}{{/port}}{{^port}}80{{/port}}" {{#port}}value="{{port}}"{{/port}}><span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span></div></div><div class="form-group urlComponent has-feedback" data-key="path"><label for="uriPath" class="col-sm-2 control-label">Path</label><div class="col-sm-10"><input type="text" class="form-control" id="uriPath" placeholder="{{#path}}{{path}}{{/path}}{{^path}}/path{{/path}}" {{#path}}value="{{path}}"{{/path}}><span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span></div></div><div class="form-group urlComponent has-feedback" data-key="hash"><label for="uriHash" class="col-sm-2 control-label">Hash</label><div class="col-sm-10"><input type="text" class="form-control" id="uriHash" placeholder="{{#hash}}{{hash}}{{/hash}}{{^hash}}#hash{{/hash}}" {{#hash}}value="{{hash}}"{{/hash}}><span class="glyphicon glyphicon-warning-sign form-control-feedback" aria-hidden="true"></span></div></div><div class="form-group"><label class="control-label col-sm-2">Query String</label><div class="col-sm-10"><pre class="form-control-static" id="{{queryStringBlockId}}"></pre></div></div><div id="{{queryStringListId}}"></div><div class="form-group" id="addNewQueryParameter"><div class="col-sm-offset-2 col-sm-2"><input type="text" class="form-control" id="{{keyInputId}}" placeholder="new key"></div><div class="col-sm-7"><input type="text" class="form-control" id="{{valueInputId}}" placeholder="new value"></div><div class="col-sm-1"><button class="btn btn-default control-label glyphicon glyphicon-plus"></button></div></div>',
    "done": "true"
  };

/*
BangJsonPath.coffee
  A collection of BangJsonPath, which composes a javascript expression that queries the root object

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
var Backbone, BangJsonPath, BangJsonPathFragment, BangJsonView, BangQueryPanelView, BangRequestPanelView, prettyPrint, replacer, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof require !== "undefined" && require !== null) {
  Backbone = require('backbone');
  _ = require('underscore');
  BangJsonPathFragment = require('../models/BangJsonPathFragment');
}

BangJsonPath = (function(_super) {
  __extends(BangJsonPath, _super);

  function BangJsonPath() {
    return BangJsonPath.__super__.constructor.apply(this, arguments);
  }

  BangJsonPath.prototype.model = BangJsonPathFragment;


  /*
   * Initialize the path with a collection of path fragments. Need at least one
   * The first path fragment in the collection will be treated as the root object
   * BaseExpression option will override the display name of the root object
   * BaseExpression is useful to hide a complex query under a friendly name
   * @param {[BangJsonPathFragment], {baseExpression}}
   */

  BangJsonPath.prototype.initialize = function(models, option) {
    if (option && option.baseExpression) {
      return this.baseExpression = option.baseExpression;
    } else {
      return this.baseExpression = models[0].getDisplayName();
    }
  };


  /*
   * Connect each PathFragment in the array to form a valid javascript expression.
   * Wrap with underscore chain function if some query fragment needs an underscore function
   * Path: optional BangJsonPathFragment array. If path is provided, getQuery will work on this array. Otherwise will be applied onto itself
   * For Display: If set to true, Use base expression as the first component in the query. Otherwise use the value of first component
   * @param {[BangJsonPathFragment], Bool}
   */

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


  /*
   * Navigate back to the index-th fragment
   * @param {int}
   * @return {BangJsonPath}
   */

  BangJsonPath.prototype.navigateTo = function(index) {
    while (this.models.length > Math.max(index + 1, 0)) {
      this.pop();
    }
    this.trigger("change:path");
    return this;
  };


  /*
   * If the last path fragment is in array form, modify the fragment to navigate to the index-th element
   * @param {int}
   * @return {BangJsonPath}
   */

  BangJsonPath.prototype.navigateToArrayElement = function(index) {
    var arrayFragment;
    if (arrayFragment = this.last().getArrayFragment(index)) {
      this.last().set("fragment", arrayFragment);
      this.trigger("change:path");
    }
    return this;
  };

  return BangJsonPath;

})(Backbone.Collection);

if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
  module.exports = BangJsonPath;
}


/*
BangJsonPathFragment.coffee
  The basic component of a JSON query. Each specifies a single operation
  to be applied onto the current query

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

if (typeof require !== "undefined" && require !== null) {
  Backbone = require('backbone');
  _ = require('underscore');
}

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


  /*
   * Class function BangJsonPathFragment.prototype.getPathFragmentForKey
   * @param {parent} parent Object
   * @param {key} the key of parent object to browse
   * @return {BangJsonPathFragment} The PathFragment for parent[key]
   */

  BangJsonPathFragment.prototype.getPathFragmentForKey = function(parent, key) {
    if (_.isArray(parent[key])) {
      return new BangJsonPathFragment({
        fragment: key + "[]"
      });
    } else {
      return new BangJsonPathFragment({
        fragment: key
      });
    }
  };


  /*
   * Return valid javascript json navigation code fragment to be appended to parent expression
   * @return {String}
   * if the pathFragment is in the form of 'array[]', return 'array'
   * if the pathFragment is in the form of '(method):key', return an underscore expression
   * else, return as is. eg. 'array[1]' -> 'array[1]'
   */

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


  /*
   * Return the type of the fragment
   * @return {ArrayRoot|ArrayElement|ArrayKey|Value}
   */

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


  /*
   * For a map function, return the name of the function and the key applied on
   * @return {String, String}
   */

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


  /*
   * For an array element, return the arrayname and the index of the element
   * @return {String, Int}
   */

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


  /*
   * @return {String} override this function to browser use to print user friendly descriptions
   */

  BangJsonPathFragment.prototype.getDisplayName = function() {
    return this.get("fragment");
  };


  /*
   * Determine the javascript json navigation code fragment
   * @return {String}
   * if the pathFragment is in the form of 'array[0]', return 'array[]'
   * if the pathFragment is in the form of 'helper:key', return ':key'
   * else, return null
   */

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


  /*
   * Determine the javascript json navigation code fragment for array element
   * if the pathFragment is in the form of 'array[]' or 'array[1]', return 'array[i]'
   * else, return null
   * @param {Int}
   * @return {String}
   */

  BangJsonPathFragment.prototype.getArrayFragment = function(index) {
    var arrayName, fullName, _ref;
    if (arrayAndArrayElementRx.test(this.get("fragment"))) {
      _ref = this.get("fragment").match(arrayAndArrayElementRx), fullName = _ref[0], arrayName = _ref[1];
      return arrayName + ("[" + index + "]");
    }
  };

  return BangJsonPathFragment;

})(Backbone.Model);

if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
  module.exports = BangJsonPathFragment;
}


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
    return this.$el.html(window.Milk.render(bangTemplates.BangQueryForm, page));
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

BangRequestPanelView = (function(_super) {
  __extends(BangRequestPanelView, _super);

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
    root.html(window.Milk.render(bangTemplates.BangRequestUri, page));
    root.selectAll(".form-control-feedback").style("display", "none");
    return this.renderQueryParameters();
  };

  BangRequestPanelView.prototype.renderQueryParameters = function() {
    var inputDiv, parameterDiv;
    this.updateRefreshLink();
    $("#" + this.queryStringBlockId).text(this.model.search() || "(no query string)");
    parameterDiv = d3.select("#" + this.queryStringListId).text("").selectAll("div.form-group").data(_.pairs(this.model.search(true))).enter().append("div").attr("class", "form-group has-feedback queryParameter").attr("data-key", function(_arg) {
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
    });
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
