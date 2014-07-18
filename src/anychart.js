goog.provide('anychart');
goog.provide('anychart.globalLock');

goog.require('acgraphexport');
goog.require('anychart.cartesian');
goog.require('anychart.data');
goog.require('anychart.elements.Axis');
goog.require('anychart.elements.Background');
goog.require('anychart.elements.Grid');
goog.require('anychart.elements.Label');
goog.require('anychart.elements.LabelsFactory');
goog.require('anychart.elements.LabelsFactory.Label');
goog.require('anychart.elements.Legend');
goog.require('anychart.elements.LineMarker');
goog.require('anychart.elements.Marker');
goog.require('anychart.elements.MarkersFactory');
goog.require('anychart.elements.MarkersFactory.Marker');
goog.require('anychart.elements.RangeMarker');
goog.require('anychart.elements.Separator');
goog.require('anychart.elements.Table');
goog.require('anychart.elements.TextMarker');
goog.require('anychart.elements.Ticks');
goog.require('anychart.elements.Title');
goog.require('anychart.elements.Tooltip');
goog.require('anychart.math');
goog.require('anychart.pie');
goog.require('anychart.ui');
goog.require('anychart.utils');
goog.require('anychart.utils.DistinctColorPalette');
goog.require('anychart.utils.MarkerPalette');
goog.require('anychart.utils.RangeColorPalette');
goog.require('goog.json.hybrid');

/**
 @namespace
 @name anychart
 */


/**
 * Current version of the framework, replaced on compile time.
 * @define {string} Current version of the framework.
 */
anychart.VERSION = '';


/**
 * If the globalLock is locked.
 * @type {number}
 */
anychart.globalLock.locked = 0;


/**
 * An array of subscribers for the globalLock free.
 * @type {!Array.<Function>}
 */
anychart.globalLock.subscribers = [];


/**
 * Locks the globalLock. You should then free the lock. The lock should be freed the same number of times that it
 * was locked.
 */
anychart.globalLock.lock = function() {
  anychart.globalLock.locked++;
};


/**
 * Registers a callback for the globalLock free.
 * @param {!Function} handler Handler function.
 * @param {Object=} opt_context Handler context.
 */
anychart.globalLock.onUnlock = function(handler, opt_context) {
  if (anychart.globalLock.locked) {
    anychart.globalLock.subscribers.push(goog.bind(handler, opt_context));
  } else {
    handler.apply(opt_context);
  }
};


/**
 * Frees the lock and fires unlock callbacks if it was the last free.
 */
anychart.globalLock.unlock = function() {
  anychart.globalLock.locked--;
  if (!anychart.globalLock.locked) {
    var arr = anychart.globalLock.subscribers.slice(0);
    anychart.globalLock.subscribers.length = 0;
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
};


/**
 * Validates correctness of the json.
 * @param {Object} json JSON object.
 * @return {boolean} Is json valid.
 * @private
 */
anychart.isJsonValid_ = function(json) {
  return true;
};



/**
 * Factory for creating class constructors by json config.
 * @constructor
 */
anychart.ClassFactory = function() {
};
goog.addSingletonGetter(anychart.ClassFactory);


/**
 * Returns an instance of the class.
 * @param {Object} json json config.
 * @return {*} Class constructor.
 */
anychart.ClassFactory.prototype.getClass = function(json) {
  if (json['chart'] && json['chart']['type'] == 'pie') return new anychart.pie.Chart();
  else if (json['chart'] && json['chart']['type'] == 'cartesian') return new anychart.cartesian.Chart();
  return null;
};


/**
 * Returns an instance of the scale.
 * @param {Object} json json config.
 * @return {anychart.scales.Base} Class constructor.
 */
anychart.ClassFactory.prototype.getScale = function(json) {
  var type = json['type'];
  if (type) {
    var scale;
    if (type == 'ordinal') {
      scale = new anychart.scales.Ordinal();
    } else if (type == 'linear') {
      scale = new anychart.scales.Linear();
    } else if (type == 'datetime') {
      scale = new anychart.scales.DateTime();
    }
    if (scale) return /** @type {anychart.scales.Base}*/(scale.deserialize(json));
  }
  return null;
};


/**
 * Creates an element by config.
 * @param {(Object|string)} jsonConfig Config.
 * @return {*} Element created by config.
 */
anychart.fromJson = function(jsonConfig) {
  /**
   * Parsed json config.
   * @type {Object}
   */
  var json;
  if (goog.isString(jsonConfig)) {
    json = goog.json.hybrid.parse(jsonConfig);
  } else if (goog.isObject(jsonConfig) && !goog.isFunction(jsonConfig)) {
    json = jsonConfig;
  } else {
    json = {};
  }

  if (anychart.isJsonValid_(json)) {
    var cls = anychart.ClassFactory.getInstance().getClass(json);
    if (cls) {
      cls.deserialize(json);
      return cls;
    }
    else return null;
  } else return null;
};


/**
 * Creates an element by config.
 * @param {string|Node} xmlConfig Config.
 * @return {*} Element created by config.
 */
anychart.fromXml = function(xmlConfig) {
  return anychart.fromJson(anychart.utils.xml2json(xmlConfig));
};
//----------------------------------------------------------------------------------------------------------------------
//
//  Default font settings
//
//----------------------------------------------------------------------------------------------------------------------
goog.global['anychart'] = goog.global['anychart'] || {};


/**
 * Default value for the font size.
 * @type {string|number}
 *
 */
goog.global['anychart']['fontSize'] = '12px';


/**
 * Default value for the font color.
 * @type {string}
 *
 */
goog.global['anychart']['fontColor'] = '#000';


/**
 * Default value for the font style.
 * @type {string}
 *
 */
goog.global['anychart']['fontFamily'] = 'Arial';


/**
 * Default value for the text direction. Text direction may be left-to-right or right-to-left.
 * @type {string}
 *
 */
goog.global['anychart']['textDirection'] = acgraph.vector.Text.Direction.LTR;
//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  Document load event.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @type {Array.<Array>}
 * @private
 */
anychart.documentLoadCallbacks_;


/**
 * Add callback for the document load event.
 * @param {Function} func Function which will be called on document load event.
 * @param {*=} opt_scope Function call context.
 */
anychart.onDocumentLoad = function(func, opt_scope) {
  if (!anychart.documentLoadCallbacks_) {
    anychart.documentLoadCallbacks_ = [];
  }
  anychart.documentLoadCallbacks_.push([func, opt_scope]);

  goog.events.listen(goog.dom.getWindow(), goog.events.EventType.LOAD, function() {
    for (var i = 0, count = anychart.documentLoadCallbacks_.length; i < count; i++) {
      var item = anychart.documentLoadCallbacks_[i];
      item[0].apply(item[1]);
    }
  });
};


/**
 * Attaching DOM load events.
 * @private
 */
anychart.attachDomEvents_ = function() {
  var window = goog.dom.getWindow();
  var document = window['document'];

  // goog.events.EventType.DOMCONTENTLOADED - for browsers that support DOMContentLoaded event. IE9+
  // goog.events.EventType.READYSTATECHANGE - for IE9-
  acgraph.events.listen(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);

  // A fallback to window.onload that will always work
  acgraph.events.listen(/** @type {EventTarget}*/ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Detaching DOM load events.
 * @private
 */
anychart.detachDomEvents_ = function() {
  var window = goog.dom.getWindow();
  var document = window['document'];

  acgraph.events.unlisten(document, [goog.events.EventType.DOMCONTENTLOADED, goog.events.EventType.READYSTATECHANGE], anychart.completed_, false);
  acgraph.events.unlisten(/** @type {EventTarget}*/ (window), goog.events.EventType.LOAD, anychart.completed_, false);
};


/**
 * Function called when one of [ DOMContentLoad , onreadystatechanged ] events fired on document or onload on window.
 * @param {acgraph.events.Event} event Event object.
 * @private
 */
anychart.completed_ = function(event) {
  var document = goog.dom.getWindow()['document'];
  // readyState === "complete" is good enough for us to call the dom ready in oldIE
  if (document.addEventListener || window['event']['type'] === 'load' || document['readyState'] === 'complete') {
    anychart.detachDomEvents_();
    anychart.ready_(event);
  }
};


/**
 * Identifies that document is loaded.
 * @type {boolean}
 * @private
 */
anychart.isReady_ = false;


/**
 * Function called when document content loaded.
 * @private
 * @param {acgraph.events.Event} event Event object.
 * @return {*} Nothing if document already loaded or timeoutID.
 */
anychart.ready_ = function(event) {
  if (anychart.isReady_) {
    return;
  }

  var document = goog.dom.getWindow()['document'];

  // Make sure the document body at least exists in case IE gets a little overzealous (ticket #5443).
  if (!document['body']) {
    return setTimeout(function() {
      anychart.ready_(event);
    }, 1);
  }

  anychart.isReady_ = true;

  for (var i = 0, count = anychart.documentReadyCallbacks_.length; i < count; i++) {
    var item = anychart.documentReadyCallbacks_[i];
    item[0].apply(item[1], [event]);
  }
};


/**
 * Please be watchful and careful with this method.
 * Callback is invoked prior to full page LOAD, which means you
 * have no access to CSS and other elemnents outside page head and async loaded elements
 *
 * Add callback for document load event.
 * @param {Function} func Function which will called on document load event.
 * @param {*=} opt_scope Function call context.
 */
anychart.onDocumentReady = function(func, opt_scope) {
  if (anychart.isReady_) {
    func.call(opt_scope);
  }

  if (!anychart.documentReadyCallbacks_) {
    anychart.documentReadyCallbacks_ = [];
  }
  anychart.documentReadyCallbacks_.push([func, opt_scope]);

  var document = goog.dom.getWindow()['document'];

  if (document['readyState'] === 'complete') {
    setTimeout(anychart.ready_, 1);
  } else {
    anychart.attachDomEvents_();
  }
};

//----------------------------------------------------------------------------------------------------------------------
//
//  AnyChart defaults for basic types of charts and series.
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Default empty chart.
 * @return {anychart.cartesian.Chart} Empty chart.
 */
anychart.chart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


/**
 * Default scatter chart.
 * @return {anychart.cartesian.Chart} Scatter chart.
 */
anychart.scatterChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xAxis();
  chart.yAxis();

  chart.grid()
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.VERTICAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.VERTICAL);

  return chart;
};


/**
 * Default pie chart.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @return {anychart.pie.Chart} Default pie chart.
 */
anychart.pieChart = function(opt_data) {
  var chart = new anychart.pie.Chart(opt_data);

  chart.title()
      .text('Pie Chart')
      .fontWeight('bold');

  chart.labels()
      .enabled(true);

  chart.legend()
      .enabled(true)
      .position('right')
      .align('left')
      .itemsLayout('vertical');

  chart.legend().title()
      .enabled(false);

  chart.legend().titleSeparator()
      .enabled(false)
      .margin(3, 0);

  return chart;
};


/**
 * Default line chart.
 * xAxis, yAxis, grids.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.lineChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title');

  chart.xAxis();
  chart.yAxis();

  chart.grid()
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.1')
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.VERTICAL);

  return chart;
};


/**
 * Default column chart.
 * xAxis, yAxis, grids.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.columnChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xAxis();
  chart.yAxis();

  chart.grid()
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.VERTICAL);

  return chart;
};


/**
 * Default bar chart.
 * xAxis, yAxis, grids.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.barChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xScale().inverted(true);

  chart.xAxis().orientation('left');
  chart.yAxis().orientation('bottom');

  chart.grid()
      .direction(anychart.utils.Direction.VERTICAL).scale(/** @type {anychart.scales.Base} */ (chart.yScale()));

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.VERTICAL).scale(/** @type {anychart.scales.Base} */ (chart.yScale()));

  chart.grid()
      .drawFirstLine(true)
      .drawLastLine(true)
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.HORIZONTAL).scale(/** @type {anychart.scales.Base} */ (chart.xScale()));

  return chart;
};


/**
 * Default area chart.
 * xAxis, yAxis, grids.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.areaChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xAxis();
  chart.yAxis();

  chart.grid()
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.VERTICAL);

  return chart;
};


/**
 * Default financial chart.
 * xAxis, yAxis, grids.
 * @return {anychart.cartesian.Chart} Chart with defaults for line series.
 */
anychart.financialChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().text('Chart Title').fontWeight('bold');
  var scale = new anychart.scales.DateTime();

  chart.xScale(scale);

  var axis = chart.xAxis();

  axis.labels()
      .textFormatter(function(value) {
        var date = new Date(value['value']);
        var options = {year: 'numeric', month: 'short', day: 'numeric'};
        return date.toLocaleDateString('en-US', options);
      });

  chart.yAxis();

  chart.grid()
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .direction(anychart.utils.Direction.HORIZONTAL);

  chart.grid()
      .evenFill('none')
      .oddFill('none')
      .direction(anychart.utils.Direction.VERTICAL);

  return chart;
};
