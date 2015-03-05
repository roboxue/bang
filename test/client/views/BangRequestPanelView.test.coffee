define ['app/BangRequestPanelView', 'URI'], (BangRequestPanelView, URI)->

  describe 'BangRequestPanelView', ->
    model = new URI("http://www.foo.com:8080/path/to/bar?query=string#hashTag")
    requestPanelView = new BangRequestPanelView {
      el: document.createElement("div")
      model: model
    }

    it 'should be globally visible', ->
      expect(BangRequestPanelView).to.exist()

    describe '#render', ->
      requestPanelView.render()

      it 'renders all important components', ->
        expect(requestPanelView.$("#uriProtocol")).not.to.be.null
        expect(requestPanelView.$("#uriHostname")).not.to.be.null
        expect(requestPanelView.$("#uriPort")).not.to.be.null
        expect(requestPanelView.$("#uriPath")).not.to.be.null
        expect(requestPanelView.$("#uriHash")).not.to.be.null
        expect(requestPanelView.$("#addNewQueryParameter")).not.to.be.null

      it 'outputs protocal correctly', ->
        expect(requestPanelView.$("#uriProtocol").text()).to.equal(model.protocol())

      it 'outputs hostname correctly', ->
        expect(requestPanelView.$("#uriHostname").val()).to.equal(model.hostname())

      it 'outputs port correctly', ->
        expect(requestPanelView.$("#uriPort").val()).to.equal(model.port())

      it 'outputs path correctly', ->
        expect(requestPanelView.$("#uriPath").val()).to.equal(model.path())

      it 'outputs hash correctly', ->
        expect(requestPanelView.$("#uriHash").val()).to.equal(model.hash())
