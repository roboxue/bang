define ["jquery"
  "underscore"
  "backbone"
], ($, _, Backbone)->
  # Given the parent JSON object, describe an operation to be applied
  class BangJsonPathFragment extends Backbone.Model
    # JsonPathFragment's raw value can be on of the following format or a normal string
    # normal string, key, returns parent[key] as a JSON object
    # map function, :key, countBy:key, countByType:key, returns an array of result of applying
    # a function onto each element in parent[key]
    keyRx = /(^|^countBy|^countByType):(.+)$/
    # array root form, key[], returns parent[key] as JSON array
    arrayRx = /^(.+)\[]$/
    # array element form, key[index], returns parent[key][i] as JSON object
    arrayElementRx = /^(.+)\[(\d+)]$/
    # array form, the combination of key[] or key[index]
    arrayAndArrayElementRx = /^(.+)\[\d*]$/

    ###
    # Class function BangJsonPathFragment.prototype.getPathFragmentForKey
    # @param {parent} parent Object
    # @param {key} the key of parent object to browse
    # @return {BangJsonPathFragment} The PathFragment for parent[key]
    ###
    getPathFragmentForKey: (parent, key)->
      if _.isArray parent[key]
        return new BangJsonPathFragment { fragment: key + "[]" }
      else
        return new BangJsonPathFragment {fragment: key }

    ###
    # Return valid javascript json navigation code fragment to be appended to parent expression
    # @return {String}
    # if the pathFragment is in the form of 'array[]', return 'array'
    # if the pathFragment is in the form of '(method):key', return an underscore expression
    # else, return as is. eg. 'array[1]' -> 'array[1]'
    ###
    getQueryFragment: ->
      type = @getFragmentType()
      switch type
        when "ArrayRoot"
          [fullExpression, arrayName] = @get("fragment").match arrayRx
          { value:arrayName }
        when "ArrayKey"
          [fullExpression, method, keyName] = @get("fragment").match keyRx
          switch method
            when "countBy" then { underscore: "countBy('#{keyName}')" }
            when "countByType" then { underscore: "countBy(function(row){ return typeof row['#{keyName}']; })" }
            else { underscore: "pluck('#{keyName}')" }
        else
          { value: @get("fragment") }

    ###
    # Return the type of the fragment
    # @return {ArrayRoot|ArrayElement|ArrayKey|Value}
    ###
    getFragmentType: ->
      if arrayRx.test @get("fragment")
        "ArrayRoot"
      else if arrayElementRx.test @get("fragment")
        "ArrayElement"
      else if keyRx.test @get("fragment")
        "ArrayKey"
      else
        "Value"

    ###
    # For a map function, return the name of the function and the key applied on
    # @return {String, String}
    ###
    getArrayKeyName: ->
      if keyRx.test @get("fragment")
        [fullExpression, method, keyName] = @get("fragment").match keyRx
        {method, keyName}

    ###
    # For an array element, return the arrayname and the index of the element
    # @return {String, Int}
    ###
    getArrayIndex: ->
      if arrayElementRx.test @get("fragment")
        [fullExpression, arrayName, arrayIndex] = @get("fragment").match arrayElementRx
        { arrayName, index: parseInt(arrayIndex) }

    ###
    # @return {String} override this function to browser use to print user friendly descriptions
    ###
    getDisplayName: ->
      @get("fragment")

    ###
    # Determine the javascript json navigation code fragment
    # @return {String}
    # if the pathFragment is in the form of 'array[0]', return 'array[]'
    # if the pathFragment is in the form of 'helper:key', return ':key'
    # else, return null
    ###
    getBaseFragment: ->
      if arrayElementRx.test @get("fragment")
        [fullName, arrayName] = @get("fragment").match arrayElementRx
        arrayName + "[]"
      else if keyRx.test @get("fragment")
        [fullExpression, method, keyName] = @get("fragment").match keyRx
        ":" + keyName if method

    ###
    # Determine the javascript json navigation code fragment for array element
    # if the pathFragment is in the form of 'array[]' or 'array[1]', return 'array[i]'
    # else, return null
    # @param {Int}
    # @return {String}
    ###
    getArrayFragment: (index)->
      if arrayAndArrayElementRx.test @get("fragment")
        [fullName, arrayName] = @get("fragment").match arrayAndArrayElementRx
        arrayName + "[#{index}]"
