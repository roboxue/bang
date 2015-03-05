(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "backbone", "app/BangJsonPathFragment"], function(_, Backbone, BangJsonPathFragment) {
    var BangJsonPath, runQuery;
    runQuery = function(query, _arg) {
      var bang, ex, queryResult, result;
      bang = _arg.bang, queryResult = _arg.queryResult;
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
    return BangJsonPath = (function(_super) {
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

      BangJsonPath.prototype.getResult = function(query) {
        if (query) {
          return runQuery(query, {
            bang: this.bang,
            queryResult: this.queryResult
          });
        } else {
          return runQuery(this.getQuery(), {
            bang: this.bang,
            queryResult: this.queryResult
          });
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
  });

}).call(this);
