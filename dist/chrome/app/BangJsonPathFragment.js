
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

  define(["jquery", "underscore", "backbone"], function($, _, Backbone) {
    var BangJsonPathFragment;
    return BangJsonPathFragment = (function(superClass) {
      var arrayAndArrayElementRx, arrayElementRx, arrayRx, keyRx;

      extend(BangJsonPathFragment, superClass);

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
        var arrayName, fullExpression, keyName, method, ref, ref1, type;
        type = this.getFragmentType();
        switch (type) {
          case "ArrayRoot":
            ref = this.get("fragment").match(arrayRx), fullExpression = ref[0], arrayName = ref[1];
            return {
              value: arrayName
            };
          case "ArrayKey":
            ref1 = this.get("fragment").match(keyRx), fullExpression = ref1[0], method = ref1[1], keyName = ref1[2];
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
        var fullExpression, keyName, method, ref;
        if (keyRx.test(this.get("fragment"))) {
          ref = this.get("fragment").match(keyRx), fullExpression = ref[0], method = ref[1], keyName = ref[2];
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
        var arrayIndex, arrayName, fullExpression, ref;
        if (arrayElementRx.test(this.get("fragment"))) {
          ref = this.get("fragment").match(arrayElementRx), fullExpression = ref[0], arrayName = ref[1], arrayIndex = ref[2];
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
        var arrayName, fullExpression, fullName, keyName, method, ref, ref1;
        if (arrayElementRx.test(this.get("fragment"))) {
          ref = this.get("fragment").match(arrayElementRx), fullName = ref[0], arrayName = ref[1];
          return arrayName + "[]";
        } else if (keyRx.test(this.get("fragment"))) {
          ref1 = this.get("fragment").match(keyRx), fullExpression = ref1[0], method = ref1[1], keyName = ref1[2];
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
        var arrayName, fullName, ref;
        if (arrayAndArrayElementRx.test(this.get("fragment"))) {
          ref = this.get("fragment").match(arrayAndArrayElementRx), fullName = ref[0], arrayName = ref[1];
          return arrayName + ("[" + index + "]");
        }
      };

      return BangJsonPathFragment;

    })(Backbone.Model);
  });

}).call(this);
