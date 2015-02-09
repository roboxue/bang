describe 'BangJsonView', ->
  bang = {}
  model = new BangJsonPath [new BangJsonPathFragment({fragment: "bang"})]
  jsonView = new BangJsonView {
    el: document.createElement("div")
    model: model
  }

  it 'should be globally visible', ->
    expect(BangJsonView).to.exist()

  describe '#render', ->
    it 'renders all important components', ->
      jsonView.render()
      expect(jsonView.breadcrumbUl).not.to.be.null
      expect(jsonView.indexSelectorDiv).not.to.be.null
      expect(jsonView.pageHeader).not.to.be.null
      expect(jsonView.codeBlockPre).not.to.be.null
      expect(jsonView.arrayToolbar).not.to.be.null
      expect(jsonView.arrayContentTable).not.to.be.null
