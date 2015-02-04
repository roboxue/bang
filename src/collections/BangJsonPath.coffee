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

class BangJsonPath extends Backbone.Collection
  model: BangJsonPathFragment

  initialize: (models, option)->
    if option and option.baseExpression
      @baseExpression = option.baseExpression
    else
      @baseExpression = models[0].get("fragment")

  getQuery: (path, forDisplay)->
    underscoreWrapped = false
    reducer = ((pv, cv, index, array)->
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

  navigateTo: (index)->
    while @models.length > Math.max(index + 1, 0)
      @pop()
    @trigger "path:update"

  navigateToArrayElement: (index)->
    if arrayFragment = @last().getArrayFragment(index)
      @last().set "fragment", arrayFragment
      @trigger "path:update"
