describe 'BangJsonPath', ->
  bangFragment = new BangJsonPathFragment { fragment: "bang" }
  keyFragment = new BangJsonPathFragment { fragment: "key" }
  arrayFragment = new BangJsonPathFragment { fragment: "array[]" }
  arrayElementFragment0 = new BangJsonPathFragment { fragment: "array[0]" }
  arrayElementFragment1 = new BangJsonPathFragment { fragment: "array[1]" }
  arrayKeyPluckFragment = new BangJsonPathFragment { fragment: ":key" }
  arrayKeyCountByFragment = new BangJsonPathFragment { fragment: "countBy:key" }
  arrayKeyCountByTypeFragment = new BangJsonPathFragment { fragment: "countByType:key" }

  it 'should be globally visible', ->
    expect(BangJsonPath).to.exist()

  describe '#init', ->
    it 'sets baseExpression to the first element in the array if the options parameter has been omitted', ->
      path = new BangJsonPath [bangFragment]
      expect(path.baseExpression).to.equal(bangFragment.getDisplayName())

    it 'sets baseExpression to the first element in the array if no baseExpression options has been specified', ->
      path = new BangJsonPath [bangFragment], {}
      expect(path.baseExpression).to.equal(bangFragment.getDisplayName())

    it 'set baseExpression to options.baseExpression if specified', ->
      path = new BangJsonPath [bangFragment], { baseExpression: "foo" }
      expect(path.baseExpression).to.equal("foo")

  describe '#getQuery', ->
    it 'can concat object navigation fragments into javascript expression', ->
      path = new BangJsonPath [bangFragment, keyFragment]
      expect(path.getQuery()).to.equal("bang['key']")

      path = new BangJsonPath [bangFragment, arrayFragment]
      expect(path.getQuery()).to.equal("bang.array")

      path = new BangJsonPath [bangFragment, arrayElementFragment1]
      expect(path.getQuery()).to.equal("bang.array[1]")

      path = new BangJsonPath [bangFragment, arrayElementFragment1, keyFragment]
      expect(path.getQuery()).to.equal("bang.array[1]['key']")

      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1]
      expect(path.getQuery()).to.equal("bang['key'].array[1]")

      path = new BangJsonPath [bangFragment, keyFragment, arrayFragment]
      expect(path.getQuery()).to.equal("bang['key'].array")

    it 'can concat underscore fragments into javascript expression', ->
      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1, arrayKeyPluckFragment]
      expect(path.getQuery()).to.equal("_.chain(bang['key'].array[1]).pluck('key').value()")

      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1, arrayKeyCountByFragment]
      expect(path.getQuery()).to.equal("_.chain(bang['key'].array[1]).countBy('key').value()")

      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1, arrayKeyCountByTypeFragment]
      expect(path.getQuery()).to.equal("_.chain(bang['key'].array[1]).countBy(function(row){ return typeof row['key']; }).value()")

    it 'uses the path parameter instead of own contents when specified', ->
      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1, arrayKeyPluckFragment]
      altPath = new BangJsonPath [bangFragment]
      expect(path.getQuery(altPath)).to.equal("bang")

    it 'use the base expression as the first fragment when forDisplay is set to true', ->
      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1, arrayKeyPluckFragment], { baseExpression: "foo" }
      expect(path.getQuery(null, false)).to.equal("_.chain(bang['key'].array[1]).pluck('key').value()")
      expect(path.getQuery(null, true)).to.equal("_.chain(foo['key'].array[1]).pluck('key').value()")

  describe '#navigateTo', ->
    it 'reduce the array size to index + 1 and keep existing elements when navigate to a valid index, and trigger path:update event', (done)->
      expected = new BangJsonPath([bangFragment, keyFragment]).getQuery()
      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1, arrayKeyPluckFragment]
      index = 1
      path.once "path:update", ->
        expect(path.getQuery()).to.deep.equal(expected)
        expect(path.length).to.equal(index + 1)
        done()
      path.navigateTo(index)

    it 'does nothing if the index is greater or equal the array size - 1', ->
      expected = new BangJsonPath([bangFragment, keyFragment, arrayElementFragment1, arrayKeyPluckFragment]).getQuery()
      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1, arrayKeyPluckFragment]
      expect(path.navigateTo(5).getQuery()).to.deep.equal(expected)
      expect(path.navigateTo(3).getQuery()).to.deep.equal(expected)

  describe '#navigateToArrayElement', ->
    it 'navigates to the proper array element if the last fragment is an array', ->
      expected = new BangJsonPath([bangFragment, keyFragment, arrayElementFragment0]).getQuery()
      path = new BangJsonPath [bangFragment, keyFragment, arrayElementFragment1]
      expect(path.navigateToArrayElement(0).getQuery()).to.equal(expected)

    it 'navigates to the proper array element if the last fragment is an array element', ->
      expected = new BangJsonPath([bangFragment, keyFragment, arrayElementFragment0]).getQuery()
      path = new BangJsonPath [bangFragment, keyFragment, arrayFragment]
      expect(path.navigateToArrayElement(0).getQuery()).to.equal(expected)

    it 'does nothing if the last fragment is not an array or array element', ->
      expected = new BangJsonPath([bangFragment, keyFragment, arrayElementFragment0]).getQuery()
      path = new BangJsonPath [bangFragment, keyFragment]
      expect(path.navigateToArrayElement(0).getQuery()).to.not.equal(expected)

