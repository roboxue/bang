(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["jquery", "underscore", "backbone"], function($, _, Backbone) {
    var BangJsonPathFragment;
    return BangJsonPathFragment = (function(_super) {
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
  });

}).call(this);
