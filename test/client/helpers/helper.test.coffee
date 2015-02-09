describe 'Helper Function', ->
  describe '#prettyPrint', ->
    verifier = (expected, toPrint)->
      actual = prettyPrint toPrint
      expect(actual).to.equal(expected)

    it 'should be globally visible', ->
      expect(prettyPrint).to.exist()

    it 'should print string correctly', ->
      toPrint = "foobar"
      expected = """<span class=json-string>"foobar"</span>"""
      verifier expected, toPrint

    it 'should print array correctly', ->
      toPrint = [1, 2, 3]
      expected = """[\n&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-value>1</span>,\n&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-value>2</span>,\n&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-value>3</span>\n]"""
      verifier expected, toPrint
      toPrint = {foo: [1, 2, 3]}
      expected = """{\n&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-key>foo</span>: [\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-value>1</span>,\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-value>2</span>,\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-value>3</span>\n&nbsp;&nbsp;&nbsp;&nbsp;]\n}"""
      verifier expected, toPrint

    it 'should print number correctly', ->
      toPrint = 1
      expected = """<span class=json-value>1</span>"""
      verifier expected, toPrint
      toPrint = 1.1
      expected = """<span class=json-value>1.1</span>"""
      verifier expected, toPrint

    it 'should print object correctly', ->
      toPrint = {foo: "bar"}
      expected = """{\n&nbsp;&nbsp;&nbsp;&nbsp;<span class=json-key>foo</span>: <span class=json-string>"bar"</span>\n}"""
      verifier expected, toPrint
