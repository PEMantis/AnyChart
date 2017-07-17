goog.provide('anychart.ui.chartEditor2.GeoDataSelector');

goog.require('anychart.ui.Component');
goog.require('anychart.ui.chartEditor2.DataSelectorBase');



/**
 * @constructor
 * @extends {anychart.ui.chartEditor2.DataSelectorBase}
 */
anychart.ui.chartEditor2.GeoDataSelector = function(dataModel) {
  anychart.ui.chartEditor2.GeoDataSelector.base(this, 'constructor', dataModel);

  this.jsonUrl = 'https://cdn.anychart.com/anydata/geo/';

  this.baseUrl = 'https://cdn.anychart.com/geodata/1.2.0';

  this.title = 'Choose geo data';

  this.className = 'geo-data-selector';

  this.dataType = anychart.ui.chartEditor2.DataModel.dataType.GEO;
};
goog.inherits(anychart.ui.chartEditor2.GeoDataSelector, anychart.ui.chartEditor2.DataSelectorBase);


anychart.ui.chartEditor2.GeoDataSelector.prototype.createItem = function(itemJson, state) {
  var imgUrl = this.baseUrl + itemJson['logo'];
  var dom = this.getDomHelper();

  var downloadButton = dom.createDom(goog.dom.TagName.A, {'class': 'anychart-button anychart-button-success download'}, 'Download');
  downloadButton.setAttribute('data-set-id', itemJson['id']);

  var removeButton = dom.createDom(goog.dom.TagName.A, {'class': 'anychart-button anychart-button-danger remove'}, 'Remove');
  removeButton.setAttribute('data-set-id', itemJson['id']);

  var item = dom.createDom(
      goog.dom.TagName.DIV, 'data-set data-set-' + itemJson['id'],
      dom.createDom(goog.dom.TagName.DIV, 'content',
          dom.createDom(goog.dom.TagName.IMG, {'src': imgUrl}),
          dom.createDom(goog.dom.TagName.DIV, 'title', itemJson['name']),
          dom.createDom(goog.dom.TagName.DIV, 'buttons', downloadButton, removeButton)));

  if (state == anychart.ui.chartEditor2.DataSelectorBase.DatasetState.LOADED) {
    goog.dom.classlist.add(item, 'loaded');
  }

  return item;
};


anychart.ui.chartEditor2.GeoDataSelector.prototype.getDataSetUrl = function(fileName) {
  return this.baseUrl + fileName;
};


anychart.ui.chartEditor2.GeoDataSelector.prototype.onLoadData = function(json, setId) {
  this.dispatchEvent({
    type: anychart.ui.chartEditor2.events.EventType.ADD_DATA,
    data: json,
    setId: setId,
    dataType: this.dataType
  });
};