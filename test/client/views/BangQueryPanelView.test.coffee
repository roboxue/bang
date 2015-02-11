describe 'BangQueryPanelView', ->
  queryPanel = new BangQueryPanelView {
    el: document.createElement("div")
  }

  it 'should be globally visible', ->
    expect(BangQueryPanelView).to.exist()

  describe '#render', ->
    it 'renders all important components', ->
      queryPanel.render()
      expect(queryPanel.$("#bangQuery")).not.to.be.null
