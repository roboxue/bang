###
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
###

class BangJsonPathFragment extends Backbone.Model
  getQueryFragment: ->
    # return valid javascript json navigation code fragment
    # if the pathFragment is in the form of 'array[]', return 'array'
    # if the pathFragment is in the form of '(method):key', return an udnerscore expression
    # else, return as is. eg. 'array[1]' -> 'array[1]'
    arrayRx = /^(.+)\[]$/
    keyRx = /(^|^countBy|^countByType):(.+)$/
    type = @getFragmentType()
    switch type
      when "ArrayRoot"
        [fullExpression, arrayName] = @get("fragment").match arrayRx
        { value:arrayName }
      when "ArrayKey"
        [fullExpression, method, keyName] = @get("fragment").match keyRx
        switch method
          when "countBy" then { underscore: "countBy('#{keyName}')" }
          when "countByType" then { underscore: "countBy(function(row){return typeof row['#{keyName}']})" }
          else { underscore: "pluck('#{keyName}')" }
      else
        { value: @get("fragment") }

  getFragmentType: ->
    arrayRx = /^(.+)\[]$/
    arrayElementRx = /^(.+)\[(\d+)]$/
    keyRx = /(^|^countBy|^countByType):(.+)$/
    if arrayRx.test @get("fragment")
      "ArrayRoot"
    else if arrayElementRx.test @get("fragment")
      "ArrayElement"
    else if keyRx.test @get("fragment")
      "ArrayKey"
    else
      "Value"

  getArrayKeyName: ->
    keyRx = /(^|^countBy|^countByType):(.+)$/
    if keyRx.test @get("fragment")
      [fullExpression, method, keyName] = @get("fragment").match keyRx
      {method, keyName}

  getArrayIndex: ->
    arrayElementRx = /^(.+)\[(\d+)]$/
    if arrayElementRx.test @get("fragment")
      [fullExpression, keyName, arrayIndex] = @get("fragment").match arrayElementRx
      [keyName, parseInt(arrayIndex)]

  getDisplayName: ->
    @get("fragment")

  getBaseFragment: ->
    # Determine the javascript json navigation code fragment
    # if the pathFragment is in the form of 'array[0]', return 'array[]'
    # if the pathFragment is in the form of 'helper:key', return ':key'
    # else, return null
    arrayRx = /^(.+)\[(\d+)]$/
    keyRx = /(^|^countBy|^countByType):(.+)$/
    if arrayRx.test @get("fragment")
      [fullName, arrayName] = @get("fragment").match arrayRx
      arrayName + "[]"
    else if keyRx.test @get("fragment")
      [fullExpression, method, keyName] = @get("fragment").match keyRx
      ":" + keyName if method

  getArrayFragment: (index)->
    # Determine the javascript json navigation code fragment for array element
    # if the pathFragment is in the form of 'array[]', return 'array[i]'
    # else, return null
    arrayRx = /^(.+)\[\d*]$/
    if arrayRx.test @get("fragment")
      [fullName, arrayName] = @get("fragment").match arrayRx
      arrayName + "[#{index}]"
