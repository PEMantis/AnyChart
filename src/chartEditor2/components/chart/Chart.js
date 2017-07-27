goog.provide('anychart.chartEditor2Module.Chart');

goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.EditorModel');
goog.require('anychart.chartEditor2Module.DataModel');



/**
 * Chart widget.
 * @param {anychart.chartEditor2Module.Editor} editor
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.Chart = function(editor) {
  anychart.chartEditor2Module.Chart.base(this, 'constructor');

  /**
   * @type {anychart.chartEditor2Module.Editor}
   * @private
   */
  this.editor_ = editor;

  this.anychart = /** @type {Object} */(goog.dom.getWindow()['anychart']);
};
goog.inherits(anychart.chartEditor2Module.Chart, anychart.chartEditor2Module.Component);



/** @inheritDoc */
anychart.chartEditor2Module.Chart.prototype.createDom = function() {
  goog.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), 'chart-container');
  // var dom = this.getDomHelper();

  this.getDomHelper().setProperties(this.getElement(), {'id': 'chart-container'});
};


anychart.chartEditor2Module.Chart.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this.editor_.getEditorModel(), anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE, this.update_);
};


anychart.chartEditor2Module.Chart.prototype.update_ = function(evt) {
  if (evt.isDataConsistent) {
    console.log("Build chart!");
    var editorModel = this.editor_.getEditorModel();
    var dataModel = this.editor_.getDataModel();

    var inputs = editorModel.getInputs();
    console.log(inputs);

    // Create data set
    var dsCtor = anychart.chartEditor2Module.EditorModel.chartTypes[inputs['chart']['ctor']]['dataSetCtor'];
    var dataSet = this.anychart['data'][dsCtor](dataModel.getRawData());

    // Chart creation
    if (this.chart_ && typeof this.chart_['dispose'] == 'function') {
      this.chart_['dispose']();
    }

    this.chart_ = this.anychart[inputs['chart']['ctor']]();

    // create mapping and series
    // var mappings = [];
    for (var i = 0; i < inputs['plot'].length; i++) {
      // mappings.push([]);
      for (var j = 0; j < inputs['plot'][i]['series'].length; j++) {
        var seriesMapping = inputs['plot'][i]['series'][j]['mapping'];
        var mappingObj = this.deepClone_(inputs['plot'][0]['mapping']);
        for (var k in seriesMapping) {
          if (seriesMapping.hasOwnProperty(k))
            mappingObj[k] = seriesMapping[k];
        }
        var mappingInstance = dataSet['mapAs'](mappingObj);
        //mappings[i].push(mappingInstance);

        // Create series
        // todo: process stock too
        this.chart_[inputs['plot'][i]['series'][j]['ctor']](mappingInstance);
      }
    }
    this.chart_['container']('chart-container');
    this.chart_['draw']();
  }
};


anychart.chartEditor2Module.Chart.prototype.deepClone_ = function(obj) {
  if (goog.typeOf(obj) == 'object') {
    var res = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        res[key] = anychart.themes.merging.deepClone_(obj[key]);
    }
    return res;
  } else {
    return obj;
  }
};