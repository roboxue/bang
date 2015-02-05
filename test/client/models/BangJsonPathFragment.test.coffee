describe 'BangJsonPathFragment', ->
  verifyOutputDeepEqualsExpectedValue = (methodToTest)->
    (expectedOutput, input, params...)->
      fragment = new BangJsonPathFragment { fragment: input}
      expect(fragment[methodToTest](params)).to.deep.equal(expectedOutput)
  verifyOutputNotDeepEqualsExpectedValue = (methodToTest)->
    (expectedOutput, input, params...)->
      fragment = new BangJsonPathFragment { fragment: input}
      expect(fragment[methodToTest](params)).to.not.deep.equal(expectedOutput)
  verifyOutputIsUndefined = (methodToTest)->
    (input, params...)->
      fragment = new BangJsonPathFragment { fragment: input}
      expect(fragment[methodToTest](params)).to.be.undefined

  it 'should be globally visible', ->
    expect(BangJsonPathFragment).to.exist()

  describe '#getQueryFragment', ->
    verifier = verifyOutputDeepEqualsExpectedValue('getQueryFragment')

    it 'return "foo" for array fragment like "foo[]"', ->
      verifier { value: "foo" }, "foo[]"

    it 'return as-is for value fragment like "name"', ->
      verifier { value: "name" }, "name"
      verifier { value: "accept-headers" }, "accept-headers"
      verifier { value: "foo[]bar" }, "foo[]bar"

    it 'returns an underscore expression for query fragment like "countyBy:key"', ->
      verifier { underscore: "countBy('key')" }, "countBy:key"

    it 'returns an underscore expression for query fragment like "countByType:key"', ->
      verifier { underscore: "countBy(function(row){ return typeof row['key']; })" }, "countByType:key"

    it 'returns an underscore pluck expression for query fragment like ":key"', ->
      verifier { underscore: "pluck('key')" }, ":key"

  describe '#getFragmentType', ->
    verifier = verifyOutputDeepEqualsExpectedValue('getFragmentType')
    notVerifier = verifyOutputNotDeepEqualsExpectedValue('getFragmentType')

    it 'returns "ArrayRoot" for fragment like "foo[]"', ->
      verifier "ArrayRoot", "foo[]"

    it 'returns ArrayElement for fragment like "foo[1]"', ->
      verifier "ArrayElement", "foo[1]"
      notVerifier "ArrayElement", "foo[a]"

    it 'returns ArrayKey for fragment like ":foo" or "{acceptedMethods}:foo", but not "{anything}:foo", where acceptedMethods = countBy|countByType', ->
      verifier "ArrayKey", ":foo"
      verifier "ArrayKey", "countBy:foo"
      verifier "ArrayKey", "countByType:foo"
      notVerifier "ArrayKey", "bar:foo"

    it 'returns Value for fragment like "foo"', ->
      verifier "Value", "foo"
      verifier "Value", "bar:foo"
      verifier "Value", "foo[a]"

  describe '#getArrayKeyName', ->
    verifier = verifyOutputDeepEqualsExpectedValue('getArrayKeyName')
    undefinedVerifier = verifyOutputIsUndefined('getArrayKeyName')

    it 'returns {method: "countBy", keyName: "foo"} for fragment "countBy:foo"', ->
      verifier { method: "countBy", keyName: "foo"}, "countBy:foo"
      verifier { method: "countByType", keyName: "foo"}, "countByType:foo"
      undefinedVerifier "anything:foo"

    it 'returns {method: "", keyName: "foo"} for fragment ":foo"', ->
      verifier { method: "", keyName: "foo"}, ":foo"

    it 'returns undefined for all other type of fragments', ->
      undefinedVerifier "anything:foo"
      undefinedVerifier "foo"
      undefinedVerifier "foo[]"
      undefinedVerifier "foo[1]"
      undefinedVerifier "foo-bar:"

  describe '#getArrayIndex', ->
    verifier = verifyOutputDeepEqualsExpectedValue('getArrayIndex')
    undefinedVerifier = verifyOutputIsUndefined('getArrayIndex')

    it 'returns {arrayName: "foo", index: 1} for fragment "foo[1]"', ->
      verifier { arrayName: "foo", index: 1}, "foo[1]"

    it 'returns undefined for fragment "foo[]" or "foo[a]"', ->
      undefinedVerifier "foo[]"
      undefinedVerifier "foo[a]"

    it 'returns undefined for all other type of fragments', ->
      undefinedVerifier ":foo"
      undefinedVerifier "foo"
      undefinedVerifier "countBy:foo"
      undefinedVerifier "foo-bar:"

  describe '#getDisplayName', ->
    verifier = verifyOutputDeepEqualsExpectedValue('getDisplayName')

    it 'returns as-is for all fragments', ->
      verifier ":foo", ":foo"
      verifier "foo[]", "foo[]"
      verifier "foo[1]", "foo[1]"
      verifier "foo", "foo"
      verifier "countBy:foo", "countBy:foo"
      verifier "foo-bar", "foo-bar"

  describe '#getBaseFragment', ->
    verifier = verifyOutputDeepEqualsExpectedValue('getBaseFragment')
    undefinedVerifier = verifyOutputIsUndefined('getBaseFragment')

    it 'returns foo[] for foo[1]', ->
      verifier "foo[]", "foo[1]"

    it 'returns :foo for countBy:foo or countByType:foo', ->
      verifier ":foo", "countBy:foo"
      verifier ":foo", "countByType:foo"

    it 'returns undefined for :foo', ->
      undefinedVerifier ":foo"

  describe '#getArrayFragment', ->
    verifier = verifyOutputDeepEqualsExpectedValue('getArrayFragment')
    undefinedVerifier = verifyOutputIsUndefined('getArrayFragment')

    it 'returns foo[1] for (foo[], 1)', ->
      verifier "foo[1]", "foo[]", 1
    it 'returns foo[1] for (foo[0], 1)', ->
      verifier "foo[1]", "foo[0]", 1
    it 'returns undefined for (noneArrayFragment, 1)', ->
      undefinedVerifier "foo", 1
      undefinedVerifier ":foo", 1
      undefinedVerifier "countBy:foo", 1
