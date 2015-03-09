###
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
###

define ["underscore", "backbone", "app/BangJsonPathFragment"], (_, Backbone, BangJsonPathFragment)->
  runQuery = (query, {bang, queryResult})->
    try
      result = eval query
      if result is undefined
        return {error: "(undefined)"}
      else
        return {result}
    catch ex
      return {error: ex}

  # A collection of BangJsonPath, which composes a javascript expression that queries the root object
  class BangJsonPath extends Backbone.Collection
    model: BangJsonPathFragment

    ###
    # Initialize the path with a collection of path fragments. Need at least one
    # The first path fragment in the collection will be treated as the root object
    # BaseExpression option will override the display name of the root object
    # BaseExpression is useful to hide a complex query under a friendly name
    # @param {[BangJsonPathFragment], {baseExpression}}
    ###
    initialize: (models, option)->
      if option and option.baseExpression
        @baseExpression = option.baseExpression
      else
        @baseExpression = models[0].getDisplayName()

    ###
    # Connect each PathFragment in the array to form a valid javascript expression.
    # Wrap with underscore chain function if some query fragment needs an underscore function
    # Path: optional BangJsonPathFragment array. If path is provided, getQuery will work on this array. Otherwise will be applied onto itself
    # For Display: If set to true, Use base expression as the first component in the query. Otherwise use the value of first component
    # @param {[BangJsonPathFragment], Bool}
    ###
    getQuery: (path, forDisplay)->
      underscoreWrapped = false
      reducer = ((pv, cv, index)->
        if index is 0
          return pv or cv.getQueryFragment().value
        if cv.getFragmentType() is "Value"
          pv + "['#{cv.getQueryFragment().value}']"
        else
          { value, underscore } = cv.getQueryFragment()
          if value or underscoreWrapped
            pv + "." + value
          else
            underscoreWrapped = true
            "_.chain(#{pv})." + underscore
      )
      baseExpression = if forDisplay then @baseExpression or ""
      if path
        toReturn = path.reduce reducer, baseExpression
      else
        toReturn = @reduce reducer, baseExpression
      if underscoreWrapped
        toReturn + ".value()"
      else
        toReturn

    # Run the query in this context. If query is not provided, use @getQuery()
    getResult: (query)->
      if query
        runQuery query, {bang: @bang, queryResult: @queryResult}
      else
        runQuery @getQuery(), {bang: @bang, queryResult: @queryResult}

    ###
    # Navigate back to the index-th fragment
    # @param {int}
    # @return {BangJsonPath}
    ###
    navigateTo: (index)->
      while @models.length > Math.max(index + 1, 0)
        @pop()
      @trigger "change:path"
      return this

    ###
    # If the last path fragment is in array form, modify the fragment to navigate to the index-th element
    # @param {int}
    # @return {BangJsonPath}
    ###
    navigateToArrayElement: (index)->
      if arrayFragment = @last().getArrayFragment(index)
        @last().set "fragment", arrayFragment
        @trigger "change:path"
      return this
