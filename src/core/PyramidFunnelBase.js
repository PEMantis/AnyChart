goog.provide('anychart.core.PyramidFunnelBase');

goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.PointContextProvider');
goog.require('anychart.core.utils.TypedLayer');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('anychart.palettes');
goog.require('anychart.utils');



/**
 * Pyramid/Funnel Base Chart Class.<br/>
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 * @constructor
 */
anychart.core.PyramidFunnelBase = function(opt_data, opt_csvSettings) {
  goog.base(this);
  this.suspendSignalsDispatching();


  /**
   * The width of the connector compared to the ((bounds.width - baseWidth) / 2), or the pixel width if it is a number.
   * Defaults to 20 px.
   * @type {!(string|number)}
   * @private
   */
  this.connectorLength_;


  /**
   * @type {!acgraph.vector.Stroke}
   * @private
   */
  this.connectorStroke_;


  /**
   * Default fill function.
   * this {{index:number, sourceColor: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a chart point.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.fill_;


  /**
   * Hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean}
   * @private
   */
  this.hatchFill_ = null;


  /**
   * @type {anychart.palettes.HatchFills}
   * @private
   */
  this.hatchFillPalette_ = null;


  /**
   * The width of the pyramid/funnel compared to the width of the bounds, or the pixel width if it is a number.
   * Defaults to 90%.
   * @type {(string|number)}
   * @private
   */
  this.baseWidth_;


  /**
   * Default fill function for hover state.
   * this {{index:number, sourceColor: acgraph.vector.Fill}}
   * return {acgraph.vector.Fill} Fill for a chart point in hover state.
   * @type {acgraph.vector.Fill|Function}
   * @private
   */
  this.hoverFill_;


  /**
   * Hover hatch fill.
   * @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean}
   * @private
   */
  this.hoverHatchFill_;


  /**
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.hoverMarkers_ = null;


  /**
   * Default stroke function for hover state.
   * this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * return {acgraph.vector.Stroke} Stroke for a chart point in hover state.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.hoverStroke_;


  /**
   * @type {!anychart.data.Iterator}
   * @private
   */
  this.iterator_;


  /**
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labels_ = null;


  /**
   * List of all label domains
   * @type {Array.<anychart.core.PyramidFunnelBase.LabelsDomain>}
   */
  this.labelDomains = [];


  /**
   * @type {anychart.palettes.Markers}
   * @private
   */
  this.markerPalette_ = null;


  /**
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.markers_ = null;


  /**
   * The minimum height of the point.
   * @type {number}
   * @private
   */
  this.minHeightOfPoint_ = 1;


  /**
   * The height of the neck. (for funnel)
   * @type {!(string|number)}
   * @private
   */
  this.neckHeight_ = NaN;

  /**
   * The width of the neck. (for funnel)
   * @type {!(string|number)}
   * @private
   */
  this.neckWidth_ = NaN;


  /**
   * Chart default palette.
   * @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors}
   * @private
   */
  this.palette_ = null;


  /**
   * Original view for the chart data.
   * @type {anychart.data.View}
   * @private
   */
  this.parentView_ = null;


  /**
   * Chart point provider.
   * @type {anychart.core.utils.PointContextProvider}
   * @private
   */
  this.pointProvider_;


  /**
   * The distance between points in pixels (or percent) of the bounds height.
   * Defaults to 5.
   * @type {!(string|number)}
   * @private
   */
  this.pointsPadding_ = 3;


  /**
   * Specifies that the pyramid is inverted base up.
   * @type {boolean}
   * @private
   */
  this.reversed_ = false;


  /**
   * Object with information about chart.
   * (bounds, sum of values, neckWidth/neckHeight normalized, neckY, centerX, ...).
   * @type {Object}
   * @private
   */
  this.statistics_;


  /**
   * Default stroke function.
   * this {{index:number, sourceColor: acgraph.vector.Stroke}}
   * return {acgraph.vector.Stroke} Stroke for a chart point.
   * @type {acgraph.vector.Stroke|Function}
   * @private
   */
  this.stroke_ = (function() {
    return /** @type {acgraph.vector.Stroke} */ (anychart.color.darken(this['sourceColor'], .2));
  });

  this.data(opt_data || null, opt_csvSettings);

  this.resumeSignalsDispatching(false);
  this.bindHandlersToComponent(this, this.handleMouseOverAndMove_, this.handleMouseOut_, null, this.handleMouseOverAndMove_);
};
goog.inherits(anychart.core.PyramidFunnelBase, anychart.core.SeparateChart);


/**
 * Series element z-index in series root layer.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.ZINDEX_PYRAMID_FUNNEL = 30;


/**
 * Hatch fill z-index in series root layer.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.ZINDEX_HATCH_FILL = 31;


/**
 * Z-index for labels connectors.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.ZINDEX_LABELS_CONNECTOR = 32;


/**
 * The length of the connector may not be less than the value of this constant.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH = 5;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.PyramidFunnelBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
    anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS;


/**
 * Gets current chart data.
 *
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed by first param, you can pass CSV parser settings here as a hash map.
 * @return {!anychart.data.View|!anychart.core.PyramidFunnelBase} {@link anychart.core.cartesian.series.Base} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.data.View|!anychart.core.PyramidFunnelBase)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.core.PyramidFunnelBase.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.parentView_ != opt_value || goog.isNull(opt_value)) {

      // drop data cache
      goog.dispose(this.parentViewToDispose_);
      delete this.iterator_;

      this.statistics_ = null;

      /**
       * @type {anychart.data.View}
       */
      var parentView;
      if (opt_value instanceof anychart.data.View) {
        parentView = opt_value;
        this.parentViewToDispose_ = null;
      } else {
        if (opt_value instanceof anychart.data.Set)
          parentView = (this.parentViewToDispose_ = opt_value).mapAs();
        else if (goog.isArray(opt_value) || goog.isString(opt_value))
          parentView = (this.parentViewToDispose_ = new anychart.data.Set(opt_value, opt_csvSettings)).mapAs();
        else
          parentView = (this.parentViewToDispose_ = new anychart.data.Set(null)).mapAs();
        this.registerDisposable(this.parentViewToDispose_);
      }
      this.parentView_ = parentView.derive();
    }

    goog.dispose(this.view_);
    this.view_ = this.parentView_;
    this.view_.listenSignals(this.dataInvalidated_, this);
    this.registerDisposable(this.view_);
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
        anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW |
        anychart.Signal.DATA_CHANGED
    );
    return this;
  }
  return this.view_;
};


/**
 * Internal data invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS |
        anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS |
        anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW |
        anychart.Signal.DATA_CHANGED
    );

  }
};


/**
 * Returns current view iterator.
 * @return {!anychart.data.Iterator} Current chart view iterator.
 */
anychart.core.PyramidFunnelBase.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Color.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function|boolean} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.normalizeColor = function(color, var_args) {
  var fill;
  var index = this.getIterator().getIndex();
  var sourceColor, scope;
  if (goog.isFunction(color)) {
    sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.palette().colorAt(index);
    scope = {
      'index': index,
      'sourceColor': sourceColor,
      'iterator': this.getIterator()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * Method that gets final fill color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the fill should be a hover fill.
 * @return {!acgraph.vector.Fill} Final hover fill for the current point.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getFillColor = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      (usePointSettings && acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(iterator.get('fill')))) || this.fill());

  return /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
          (usePointSettings && acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(iterator.get('hoverFill')))) || this.hoverFill() || normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current point.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getStrokeColor = function(usePointSettings, hover) {
  var iterator = this.getIterator();

  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      (usePointSettings && acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke} */(iterator.get('stroke')))) ||
      this.stroke());

  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
          (usePointSettings && acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke} */(iterator.get('hoverStroke')))) || this.hoverStroke() || normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Colorizes shape in accordance to current point colorization settings.
 * Shape is get from current meta 'shape'.
 * @param {boolean} hover If the point is hovered.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.colorizePoint_ = function(hover) {
  var point = /** @type {acgraph.vector.Path} */ (this.getIterator().meta('point'));
  if (goog.isDef(point)) {
    var fillColor = this.getFillColor(true, hover);
    point.fill(fillColor);

    var strokeColor = this.getStrokeColor(true, hover);
    point.stroke(strokeColor);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Palette.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the current chart palette.
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} Color palette instance.
 *//**
 * Setter for a chart palette.
 * @example
 *  var data = [7, 7, 7, 7, 7, 7, 7];
 *  anychart.pyramid(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds(0,0,'33%', '100%')
 *     .draw();
 *  anychart.pyramid(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds('33%',0,'33%', '100%')
 *     .palette(['#00F', '#00E', '#00D', '#00C', '#00B', '#00A', '#009', '#008'])
 *     .draw();
 *  anychart.pyramid(data)
 *     .labels(null)
 *     .legend(null)
 *     .container(stage)
 *     .bounds('66%',0,'33%', '100%')
 *     .palette(
 *          anychart.palettes.rangeColors()
 *              .colors(['red', 'yellow'])
 *              .count(data.length)
 *      )
 *     .draw();
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value Color palette instance.
 * @return {!anychart.core.PyramidFunnelBase} An instance of {@link anychart.core.PyramidFunnelBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.core.PyramidFunnelBase)} .
 */
anychart.core.PyramidFunnelBase.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * Chart markers palette settings.
 * @param {(anychart.palettes.Markers|Object|Array.<anychart.enums.MarkerType>)=} opt_value Chart marker palette settings to set.
 * @return {!(anychart.palettes.Markers|anychart.core.PyramidFunnelBase)} Return current chart markers palette or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.markerPalette = function(opt_value) {
  if (!this.markerPalette_) {
    this.markerPalette_ = new anychart.palettes.Markers();
    this.markerPalette_.listenSignals(this.markerPaletteInvalidated_, this);
    this.registerDisposable(this.markerPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.markerPalette_.setup(opt_value);
    return this;
  } else {
    return this.markerPalette_;
  }
};


/**
 * Chart hatch fill palette settings.
 * @param {(Array.<acgraph.vector.HatchFill.HatchFillType>|Object|anychart.palettes.HatchFills)=} opt_value Chart
 * hatch fill palette settings to set.
 * @return {!(anychart.palettes.HatchFills|anychart.core.PyramidFunnelBase)} Return current chart hatch fill palette or itself
 * for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.hatchFillPalette = function(opt_value) {
  if (!this.hatchFillPalette_) {
    this.hatchFillPalette_ = new anychart.palettes.HatchFills();
    this.hatchFillPalette_.listenSignals(this.hatchFillPaletteInvalidated_, this);
    this.registerDisposable(this.hatchFillPalette_);
  }

  if (goog.isDef(opt_value)) {
    this.hatchFillPalette_.setup(opt_value);
    return this;
  } else {
    return this.hatchFillPalette_;
  }
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();

    if (opt_cloneFrom) {
      this.palette_.setup(opt_cloneFrom);
    }

    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(this.palette_);
    if (doDispatch) {
      this.invalidate(anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.markerPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal marker palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.hatchFillPaletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Fill.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the chart points fill in normal state.
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill)} Current fill in the normal state.
 *//**
 * Setter for the chart points fill in the normal state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pyramid(data);
 *  chart.fill(function(){
 *     return 'rgba(210,' + (50 * (this.index + 1) - 10) + ',100,1)';
 *  });
 *  chart.legend(null);
 *  chart.stroke('none');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value [// return the fill from the default pallete.
 * function() {
 *   return this.sourceColor;
 * };] or Fill, or fill-function, which should look like this:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Fill - fill of the current point
 *  // }
 *  return myFill; //acgraph.vector.Fill
 * };</code>.
 * @return {!anychart.core.PyramidFunnelBase} An instance of {@link anychart.core.PyramidFunnelBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.PyramidFunnelBase|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = /** @type {acgraph.vector.Fill}*/(fill);
      this.invalidate(anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter for the chart points fill in the hover state.
 * @return {(acgraph.vector.Fill|function():acgraph.vector.Fill)} Current fill in the hover state.
 *//**
 * Setter for the chart points fill in the hover state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pyramid(data);
 *  chart.hoverFill(['red', 'blue']);
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Fill|function():acgraph.vector.Fill)=} opt_value [// return lighter fill of the default pallete.
 * function() {
 *   return anychart.color.lighten(this.sourceColor);
 * };] or Fill, or fill-function, which should look like:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Fill - fill of the current point
 *  // }
 *  return myFill; //acgraph.vector.Fill
 * };</code>.
 * @return {!anychart.core.PyramidFunnelBase} An instance of {@link anychart.core.PyramidFunnelBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.PyramidFunnelBase|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.hoverFill_) {
      this.hoverFill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hoverFill_;
};


/**
 * Method that gets final stroke color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getFinalFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      (usePointSettings && acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(iterator.get('fill')))) || this.fill());
  var result = /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
          (usePointSettings && acgraph.vector.normalizeFill(/** @type {acgraph.vector.Fill} */(iterator.get('hoverFill')))) || this.hoverFill() || normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
  return acgraph.vector.normalizeFill(result);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  HatchFill.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hatch fill.
 *//**
 * Setter for hatch fill settings.
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pyramid(data);
 *  chart.hatchFill('diagonalbrick');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.PyramidFunnelBase|Function|boolean} Hatch fill.
 */
anychart.core.PyramidFunnelBase.prototype.hatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE |
          anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean} */ (this.hatchFill_);
};


/**
 * Getter for current hover hatch fill settings.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} Current hover hatch fill.
 *//**
 * Setter for hover hatch fill settings.
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pyramid(data);
 *  chart.hoverHatchFill('diagonalbrick');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string|boolean)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.PyramidFunnelBase|Function|boolean} Hatch fill.
 */
anychart.core.PyramidFunnelBase.prototype.hoverHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) || goog.isBoolean(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);

    if (this.hoverHatchFill_ != hatchFill)
      this.hoverHatchFill_ = hatchFill;

    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|boolean} */ (this.hoverHatchFill_);
};


/**
 * Method that gets the final hatch fill for a current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getFinalHatchFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();

  var normalHatchFill;
  if (usePointSettings && goog.isDef(iterator.get('hatchFill'))) {
    normalHatchFill = iterator.get('hatchFill');
  } else {
    normalHatchFill = this.hatchFill();
  }

  var hatchFill;
  if (hover) {
    if (usePointSettings && goog.isDef(iterator.get('hoverHatchFill'))) {
      hatchFill = iterator.get('hoverHatchFill');
    } else if (goog.isDef(this.hoverHatchFill())) {
      hatchFill = this.hoverHatchFill();
    } else {
      hatchFill = normalHatchFill;
    }
  } else {
    hatchFill = normalHatchFill;
  }

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} */(hatchFill)));
};


/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function|boolean|string} hatchFill Normal state hatch fill.
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.normalizeHatchFill = function(hatchFill) {
  var fill;
  var index = this.getIterator().getIndex();
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = acgraph.vector.normalizeHatchFill(
        /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)));
    var scope = {
      'index': index,
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = acgraph.vector.normalizeHatchFill(hatchFill.call(scope));
  } else if (goog.isBoolean(hatchFill)) {
    fill = hatchFill ? /** @type {acgraph.vector.PatternFill} */(this.hatchFillPalette().itemAt(index)) : null;
  } else
    fill = acgraph.vector.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Apply hatch fill to shape in accordance to current point colorization settings.
 * Shape is get from current meta 'hatchFillShape'.
 * @param {boolean} hover If the point is hovered.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.applyHatchFill = function(hover) {
  var hatchPoint = /** @type {acgraph.vector.Path} */(this.getIterator().meta('hatchPoint'));
  if (goog.isDefAndNotNull(hatchPoint)) {
    hatchPoint
        .stroke(null)
        .fill(this.getFinalHatchFill(true, hover));
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Stroke.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the chart points stroke in the normal state.
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)} Current stroke in the normal state.
 *//**
 * Setter for the chart points stroke in the normal state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pyramid(data);
 *  chart.stroke('2 white');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value [// return stroke from the default pallete.
 * function() {
 *   return anychart.color.darken(this.sourceColor);
 * };] or Stroke, or stroke-function, which should look like:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Stroke - stroke of the current point
 *  // }
 *  return myStroke; //acgraph.vector.Stroke
 * };</code>.
 * @return {!anychart.core.PyramidFunnelBase} An instance of {@link anychart.core.PyramidFunnelBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.PyramidFunnelBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.stroke_) {
      this.stroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.stroke_;
};


/**
 * Getter for the chart points stroke in the hover state.
 * @return {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)} Current stroke in the hover state.
 *//**
 * Setter for the chart points stroke in the hover state.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example
 *  var data = [10, 1, 7, 10];
 *  var chart = anychart.pyramid(data);
 *  chart.hoverStroke('2 #CC0088');
 *  chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|function():acgraph.vector.Stroke)=} opt_value [// return stroke from the default pallete.
 * function() {
 *   return anychart.color.darken(this.sourceColor);
 * };] or Stroke, or stroke-function, which should look like:<code>function() {
 *  //  this: {
 *  //  index : number  - the index of the current point
 *  //  sourceColor : acgraph.vector.Stroke - stroke of the current point
 *  // }
 *  return myStroke; //acgraph.vector.Stroke
 * };</code>.
 * @return {!anychart.core.PyramidFunnelBase} An instance of {@link anychart.core.PyramidFunnelBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.PyramidFunnelBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.hoverStroke_) {
      this.hoverStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Method that gets final line color for the current point, with all fallbacks taken into account.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.getFinalStroke = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      (usePointSettings && acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke} */(iterator.get('stroke')))) ||
      this.stroke());
  var result = /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
          (acgraph.vector.normalizeStroke(/** @type {acgraph.vector.Stroke} */(iterator.get('hoverStroke'))) && usePointSettings) ||
          this.hoverStroke() ||
          normalColor),
          normalColor) :
      this.normalizeColor(normalColor));

  return acgraph.vector.normalizeStroke(result);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.remove = function() {
  this.markers().container(null);
  this.labels().container(null);
  this.clearLabelDomains_();

  if (this.dataLayer_) this.dataLayer_.parent(null);

  goog.base(this, 'remove');
};


/**
 * Draw chart chart content items.
 * @param {anychart.math.Rect} bounds Bounds of chart content area.
 */
anychart.core.PyramidFunnelBase.prototype.drawContent = function(bounds) {
  if (this.isConsistent()) return;

  var iterator = this.getIterator();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    if (this.dataLayer_) {
      this.dataLayer_.clear();
    } else {
      this.dataLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.registerDisposable(this.dataLayer_);
      this.dataLayer_.zIndex(anychart.core.PyramidFunnelBase.ZINDEX_PYRAMID_FUNNEL);
      this.dataLayer_.parent(this.rootElement);
    }

    if (this.hatchLayer_) {
      this.hatchLayer_.clear();
    } else {
      this.hatchLayer_ = new anychart.core.utils.TypedLayer(function() {
        return acgraph.path();
      }, function(child) {
        (/** @type {acgraph.vector.Path} */ (child)).clear();
      });
      this.registerDisposable(this.hatchLayer_);
      this.hatchLayer_.parent(this.rootElement);
      this.hatchLayer_.zIndex(anychart.core.PyramidFunnelBase.ZINDEX_HATCH_FILL).disablePointerEvents(true);
    }

    if (this.palette_ && this.palette_ instanceof anychart.palettes.RangeColors) {
      this.palette_.count(iterator.getRowsCount());
    }

    this.pointsPaddingValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.pointsPadding_, bounds.height), 2));
    this.baseWidthValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.baseWidth_, bounds.width), 2));
    this.neckWidthValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.neckWidth_, bounds.width), 2));
    this.neckHeightValue_ = Math.abs(anychart.math.round(anychart.utils.normalizeSize(this.neckHeight_, bounds.height), 2));
    this.neckYValue_ = bounds.top + bounds.height - this.neckHeightValue_;
    this.centerXValue_ = bounds.width / 2;

    this.connectorLengthValue_ = anychart.utils.normalizeSize(
        this.connectorLength_, ((bounds.width - this.baseWidthValue_) / 2));
    if (this.connectorLengthValue_ < 0) {
      this.connectorLengthValue_ = anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
    }

    this.boundsValue_ = bounds;

    var startY = 0;
    var value;
    var isMissing;

    var countMissing = iterator.getRowsCount() - anychart.utils.toNumber(this.statistics('count'));
    var paddingPercent = anychart.math.round(this.pointsPaddingValue_ / bounds.height * 100, 2);

    iterator.reset();
    while (iterator.advance()) {
      value = iterator.get('value');
      isMissing = this.isMissing_(value);
      value = this.handleValue_(value);

      var percent = anychart.math.round(value / anychart.utils.toNumber(this.statistics('sum')) * 100, 2);
      if (isMissing) {
        percent = paddingPercent;
      }

      var height = anychart.math.round(bounds.height / (100 + countMissing * paddingPercent) * percent, 2);
      if (height == 0) {
        height = this.minHeightOfPoint_;
      }

      iterator.meta('value', value);
      iterator.meta('height', height);
      iterator.meta('startY', startY);

      startY += height;

      // If the labels do not fit, then we need to move the center point.
      this.shiftCenterX_();
    }

    // drawPoint_ must be called independently since centerX may be shifted at any iteration of the iterator.
    iterator.reset();
    while (iterator.advance()) {
      this.drawPoint_();
    }

    if (this.drawnConnectors_) {
      for (var i in this.drawnConnectors_) {
        this.drawnConnectors_[i].stroke(this.connectorStroke_);
      }
    }

    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS);
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS)) {
    if (!this.markers().container()) this.markers_.container(this.rootElement);
    this.markers().clear();

    iterator.reset();
    while (iterator.advance()) {
      this.drawMarker(false);
    }

    this.markers().draw();
    this.markConsistent(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS)) {
    if (!this.labels().container()) this.labels_.container(this.rootElement);
    this.labels().clear();
    if (this.connectorsLayer_) {
      this.connectorsLayer_.clear();
    }

    if (this.isInsideLabels_()) {
      this.labels().setAutoColor(anychart.getFullTheme()['pyramidFunnel']['insideLabels']['autoColor']);
    } else {
      this.labels().setAutoColor(anychart.getFullTheme()['pyramidFunnel']['outsideLabels']['autoColor']);

      this.connectorLengthValue_ = anychart.utils.normalizeSize(
          this.connectorLength_, ((bounds.width - this.baseWidthValue_) / 2));
      // foolproof
      if (this.connectorLengthValue_ < 0) {
        this.connectorLengthValue_ = anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
      }

      // init connector element
      if (this.connectorsLayer_) {
        this.connectorsLayer_.clear();
      } else {
        this.connectorsLayer_ = new anychart.core.utils.TypedLayer(function() {
          return acgraph.path();
        }, function(child) {
          (/** @type {acgraph.vector.Path} */ (child)).clear();
        });
        this.registerDisposable(this.connectorsLayer_);
        this.connectorsLayer_.parent(this.rootElement);
        this.connectorsLayer_.zIndex(anychart.core.PyramidFunnelBase.ZINDEX_LABELS_CONNECTOR);
      }
      this.connectorsLayer_.clip(bounds);
      this.drawnConnectors_ = [];
    }

    iterator.reset();
    while (iterator.advance()) {
      // fix for change position to inside after draw
      if (this.isInsideLabels_()) {
        // reset `labelWidthForced` meta
        iterator.meta('labelWidthForced', undefined);
      }

      this.drawLabel_(false);
    }
    this.overlapCorrection_();

    this.labels().draw();
    this.labels().getDomElement().clip(bounds);

    this.markConsistent(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS);
  }
};


/**
 * Return the width at a specific Y coordinate.
 * @param {number} y
 * @return {number}
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.getWidthAtY_ = function(y) {
  var width = this.baseWidthValue_;
  var height = this.boundsValue_.height;
  var neckWidth = this.neckWidthValue_;
  var neckHeight = this.neckHeightValue_;
  return y > height - neckHeight || height == neckHeight ?
      neckWidth :
      neckWidth + (width - neckWidth) * ((height - neckHeight - y) / (height - neckHeight));
};


/**
 * All missing values are equal to zero.
 * @param {*} value
 * @return {number}
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.handleValue_ = function(value) {
  return this.isMissing_(value) ? 0 : anychart.utils.toNumber(value);
};


/**
 * Checks that value represents missing point.
 * @param {*} value
 * @return {boolean} Is value represents missing value.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.isMissing_ = function(value) {
  value = anychart.utils.toNumber(value);
  return value <= 0 || !goog.math.isFiniteNumber(value);
};


/**
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.calculatePoint_ = function() {
  var iterator = this.getIterator();
  var index = /** @type {number} */ (iterator.getIndex());

  var bounds = this.boundsValue_;

  /*
   *
   * Funnel/reversed Pyramid (not have neck)
   *
   * x1,y1 ________________ x2,y1
   *  \                         /
   *   \                       /
   *    \                     /
   *     \                   /
   *      \                 /
   *     x3,y2 ________ x4,y2
   *
   *             Neck
   *
   *       |               |
   *       |               |
   *       |               |
   *     x3,y3 _________ x4,y3
   */

  /*
   *
   * Pyramid (not have neck)
   *
   *     x1,y1 _______ x2,y1
   *       /             \
   *      /               \
   *     /                 \
   *    /                   \
   *   /                     \
   *  x3,y2 ______________ x4,y2
   *
   */

  var x1, x2, x3, x4;
  var y1, y2, y3;

  var halfHeight = /** @type {number} */ (iterator.meta('height')) / 2;

  // --------- Y ----------
  y1 = /** @type {number} */ (iterator.meta('startY'));
  y2 = /** @type {number} */ (iterator.meta('height')) + y1;
  y3 = null;

  var pointsPadding = this.pointsPaddingValue_;

  if (pointsPadding) {
    // first point
    if (index == 0) {
      y2 = y2 - pointsPadding / 2;

      // catch error
      if (y2 < y1) {
        y2 = this.minHeightOfPoint_;
      }

      // last point
    } else if (index == iterator.getRowsCount() - 1) {
      y1 = y1 + pointsPadding / 2;

      // catch error
      if (y1 > y2) {
        y1 = y2 - this.minHeightOfPoint_;
      }

      // between points
    } else {
      y1 = y1 + pointsPadding / 2;
      y2 = y2 - pointsPadding / 2;

      // catch error
      if (y1 > y2) {
        y1 = /** @type {number} */ (iterator.meta('startY') + halfHeight);
        y2 = y1 + this.minHeightOfPoint_;

      }
    }
  }
  // ------- END Y --------

  // --------- X ----------
  var width = this.getWidthAtY_(y1);
  x1 = this.centerXValue_ - width / 2;
  x2 = x1 + width;
  width = this.getWidthAtY_(y2);
  x3 = this.centerXValue_ - width / 2;
  x4 = x3 + width;
  // ------- END X --------

  // Y coordinate must consider the bounds in order to detect the beginning of the neck.
  y1 = y1 + bounds.top;
  y2 = y2 + bounds.top;

  x1 = bounds.left + x1;
  x2 = bounds.left + x2;

  // The top of the neck
  if (this.neckHeightValue_ > 0 && y1 < this.neckYValue_ && y2 > this.neckYValue_) {
    y3 = y2;
    y2 = this.neckYValue_;

    width = this.getWidthAtY_(y2);
    x3 = this.centerXValue_ - width / 2;
    x4 = x3 + width;
  }

  x3 = bounds.left + x3;
  x4 = bounds.left + x4;

  if (!this.reversed_) {
    y1 = bounds.height - (y1 - bounds.top) + bounds.top;
    y2 = bounds.height - (y2 - bounds.top) + bounds.top;
    y3 = (y3 ? bounds.height - (y3 - bounds.top) + bounds.top : null);

    // reverse coordinates (destructuring assignment) for true top/bottom, need for markers positioning
    y1 = [y2, y2 = y1][0];
    x1 = [x3, x3 = x1][0];
    x2 = [x4, x4 = x2][0];
  }

  iterator.meta('x1', x1);
  iterator.meta('x2', x2);
  iterator.meta('x3', x3);
  iterator.meta('x4', x4);
  iterator.meta('y1', y1);
  iterator.meta('y2', y2);
  iterator.meta('y3', y3);
};


/**
 * Internal function for drawing a point by arguments.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.drawPoint_ = function() {
  var iterator = this.getIterator();
  var index = /** @type {number} */ (iterator.getIndex());

  var point = this.dataLayer_.genNextChild();
  var hatchPoint = this.hatchLayer_.genNextChild();

  iterator.meta('point', point);
  iterator.meta('hatchPoint', hatchPoint);

  this.calculatePoint_();

  var x1 = iterator.meta('x1');
  var x2 = iterator.meta('x2');
  var x3 = iterator.meta('x3');
  var x4 = iterator.meta('x4');
  var y1 = iterator.meta('y1');
  var y2 = iterator.meta('y2');
  var y3 = iterator.meta('y3');

  point.moveTo(x1, y1)
      .lineTo(x2, y1);

  // drawing neck
  if (y3) {
    point.lineTo(x4, y2)
        .lineTo(x4, y3)
        .lineTo(x3, y3)
        .lineTo(x3, y2);
  } else {
    point.lineTo(x4, y2)
        .lineTo(x3, y2);
  }

  point.close();

  iterator.meta('point', point);

  point.tag = index;
  var hover = (this.hoverStatus == index);
  this.colorizePoint_(hover);
  if (hatchPoint) {
    hatchPoint.deserialize(point.serialize());
    hatchPoint.tag = index;
    this.applyHatchFill(hover);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.makeBrowserEvent = function(e) {
  var res = goog.base(this, 'makeBrowserEvent', e);
  var tag = anychart.utils.extractTag(res['domTarget']);
  if (!anychart.utils.isNaN(tag))
    res['pointIndex'] = anychart.utils.toNumber(tag);
  return res;
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.handleMouseOverAndMove_ = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt &&
      ((anychart.utils.checkIfParent(this, event['relatedTarget']) && !isNaN(this.hoverStatus)) ||
      this.dispatchEvent(evt))) {
    // we don't want to dispatch if this an out-over from the same slice
    // in case of move we will always dispatch, because checkIfParent(this, undefined) will return false
    this.hoverPoint_(/** @type {number} */ (evt['pointIndex']), event);
  }
};


/**
 * @param {anychart.core.MouseEvent} event .
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.handleMouseOut_ = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt) {
    if (anychart.utils.checkIfParent(this, event['relatedTarget']) &&
        anychart.utils.toNumber(anychart.utils.extractTag(event['relatedDomTarget'])) == evt['pointIndex']) {
      // this means we got an out-over on the same slice, for example - from the slice to inside label
      // in this case we skip dispatching the event and unhovering to avoid possible label disappearance
      this.hoverPoint_(/** @type {number} */ (evt['pointIndex']), event);
    } else if (this.dispatchEvent(evt)) {
      this.unhoverPoint_();
    }
  }
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.handleMouseEvent = function(event) {
  var evt = this.makePointEvent_(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.makePointEvent_ = function(event) {
  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }
  pointIndex = anychart.utils.toNumber(pointIndex);
  if (isNaN(pointIndex))
    return null;

  event['pointIndex'] = pointIndex;

  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'iterator': iter,
    'sliceIndex': pointIndex,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event
  };
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Hover.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Point hover status. NaN - not hovered, non-negative number - chart point with this index hovered.
 * @type {number}
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.hoverStatus = NaN;


/**
 * Hovers chart point by its index.
 * @private
 * @param {number} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate Point hovering.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.hoverPoint_ = function(index, opt_event) {
  var iterator = this.getIterator();

  if (this.hoverStatus == index) {
    if (iterator.select(index)) {
      if (opt_event) this.showTooltip(opt_event);
    }
    return this;
  }
  this.unhover();

  iterator.reset();
  while (iterator.advance()) {
    this.drawLabel_(iterator.getIndex() == index);
  }
  this.overlapCorrection_(this.labels().getLabel(index));

  if (iterator.reset().select(index)) {
    this.colorizePoint_(true);
    this.applyHatchFill(true);
    this.drawMarker(true);
    if (goog.isDef(opt_event)) {
      // Select index again because drawLabel changes the position of the iterator if the overlap calculation was performed.
      this.getIterator().select(index);
      if (opt_event) this.showTooltip(opt_event);
    }
  }
  this.hoverStatus = index;
  return this;
};


/**
 * Removes hover from the chart point.
 * @private
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.unhoverPoint_ = function() {
  if (isNaN(this.hoverStatus)) return this;

  var iterator = this.getIterator();
  iterator.reset();
  while (iterator.advance()) {
    this.drawLabel_(false);
  }
  this.overlapCorrection_();

  if (iterator.select(this.hoverStatus)) {
    this.colorizePoint_(false);
    this.applyHatchFill(false);
    this.drawMarker(false);
    this.hideTooltip();
  }
  this.hoverStatus = NaN;
  return this;
};


/**
 *
 * @private
 * @return {!anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.hoverAllPoints_ = function() {
  this.hoverStatus = -1;
  var iterator = this.getIterator();

  iterator.reset();
  while (iterator.advance()) {
    this.drawLabel_(true);
    this.colorizePoint_(true);
    this.applyHatchFill(true);
    this.drawMarker(true);
  }
  this.overlapCorrection_(null, true);
  return this;
};


/**
 * If index is passed, hovers a point of the chart by its index, else hovers all points of the chart.
 * @param {number=} opt_index
 * @return {!anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.hover = function(opt_index) {
  if (goog.isDef(opt_index)) this.hoverPoint_(opt_index);
  else this.hoverAllPoints_();
  return this;
};


/**
 * Removes hover from all chart points.
 * @return {!anychart.core.PyramidFunnelBase} instance for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.unhover = function() {
  if (this.hoverStatus >= 0) {
    this.unhoverPoint_();
  } else {
    var iterator = this.getIterator();
    iterator.reset();
    while (iterator.advance()) {
      this.drawLabel_(false);
      this.colorizePoint_(false);
      this.applyHatchFill(false);
      this.drawMarker(false);
      this.hideTooltip();
    }
    this.overlapCorrection_();
  }

  return this;
};


/**
 * The width of the pyramid/funnel in pixels or in percentage of the width of the bounds.
 * Defaults to 90%.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.baseWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.baseWidth_ != opt_value) {
      this.baseWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baseWidth_;
};


/**
 * The height of the neck, the lower part of the funnel.
 * In pixels or in percentage of the height of the bounds.
 * Defaults to 25%.
 * For funnel chart ONLY.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.neckHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.neckHeight_ != opt_value) {
      this.neckHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.neckHeight_;
};


/**
 * The width of the neck, the lower part of the funnel.
 * In pixels or in percentage of the width of the bounds.
 * Defaults to 30%.
 * For funnel chart ONLY.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.neckWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.neckWidth_ != opt_value) {
      this.neckWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.neckWidth_;
};


/**
 * The distance between points in pixels (or percent) of the bounds height.
 * Defaults to 5.
 * @param {(string|number)=} opt_value
 * @return {string|number|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.pointsPadding = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.pointsPadding_ != opt_value) {
      this.pointsPadding_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.pointsPadding_;
};


/**
 * Method allows you to flip the pyramid upside down.
 * Defaults to false.
 * For Pyramid ONLY.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.PyramidFunnelBase}
 */
anychart.core.PyramidFunnelBase.prototype.reversed = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.reversed_ != opt_value) {
      this.reversed_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.reversed_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for the current chart labels.<br/>
 * It is used to access to the current (default too) settings of the labels.<br>
 * <b>Note:</b> Default labels will appear when this getter is called for the first time.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pyramid(data);
 *  chart.labels()
 *      .position('outside')
 *      .fontSize(10)
 *      .fontColor('red');
 *  chart.container(stage).draw();
 * @return {!anychart.core.ui.LabelsFactory} An instance of {@link anychart.core.ui.LabelsFactory} class for method chaining.
 *//**
 * Setter for the chart labels.<br/>
 * <b>Note:</b> positioning is done using {@link anychart.core.ui.LabelsFactory#positionFormatter} method
 * and text is formatted using {@link anychart.core.ui.LabelsFactory#textFormatter} method.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pyramid(data);
 *  chart.labels(true);
 *  chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value [] LabelsFactory instance.
 * @return {!anychart.core.PyramidFunnelBase} An instance of {@link anychart.core.PyramidFunnelBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value .
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.PyramidFunnelBase)} .
 */
anychart.core.PyramidFunnelBase.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();

    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.labels_.setParentEventTarget(this);
    this.registerDisposable(this.labels_);
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.labelsInvalidated_ = function(event) {
  var state = 0, signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS;
    signal |= anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }

  this.invalidate(state, signal);
};


/**
 * Getter for series hover data labels.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pyramid(data);
 *  chart.hoverLabels()
 *      .fontSize(10)
 *      .fontStyle('italic')
 *      .fontColor('red');
 *  chart.container(stage).draw();
 * @return {!anychart.core.ui.LabelsFactory} Current labels instance.
 *//**
 * Setter for series hover data labels.
 * @example
 *  var data = [
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ];
 *  var chart = anychart.pyramid(data);
 *  chart.hoverLabels(false);
 *  chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value chart hover data labels settings.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value chart hover data labels settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.PyramidFunnelBase)} Labels instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.core.ui.LabelsFactory();
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    this.hoverLabels_.setup(opt_value);
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Allows the labels to cross other labels. ONLY for outside labels.
 * @param {(anychart.enums.LabelsOverlapMode|string)=} opt_value .
 * @return {anychart.enums.LabelsOverlapMode|anychart.core.PyramidFunnelBase} .
 */
anychart.core.PyramidFunnelBase.prototype.overlapMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.enums.normalizeLabelsOverlapMode(opt_value);
    if (this.labelsOverlap_ != val) {
      this.labelsOverlap_ = val;
      this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.labelsOverlap_;
};


/**
 * Getter for outside labels connector length.
 * @return {number|string|null} Outside labels connector length.
 *//**
 * Setter for outside labels connector length.<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pyramid([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.connectorLength(20);
 * chart.container(stage).draw();
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value [30%] Value to set.
 * @return {!anychart.core.PyramidFunnelBase|number|string|null} Outside labels margin or self for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.connectorLength = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.connectorLength_ != opt_value) {
      this.connectorLength_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.PYRAMID_FUNNEL_LABELS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.connectorLength_;
};


/**
 * Getter for outside labels connectors stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for outside labels connectors stroke settings by function.<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pyramid([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.connectorStroke(
 *      function(){
 *        return '3 '+ this.sourceColor;
 *      }
 *   );
 * chart.container(stage).draw();
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Function that looks like <code>function(){
 *    // this.sourceColor -  color returned by fill() getter.
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * Setter for outside labels connectors stroke settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note: </b> Works only with outside labels mode.
 * @example
 * var chart = anychart.pyramid([5, 2, 1, 3, 1, 3]);
 * chart.labels()
 *   .fontColor('black')
 *   .position('outside');
 * chart.connectorStroke('orange', 3, '5 2', 'round');
 * chart.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.PyramidFunnelBase|acgraph.vector.Stroke|Function} .
 */
anychart.core.PyramidFunnelBase.prototype.connectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.connectorStroke_) {
      this.connectorStroke_ = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorStroke_;
};


/**
 * Draws outside label for a point.
 * @private
 * @param {boolean} hovered If it is a hovered label drawing.
 * @return {anychart.core.ui.LabelsFactory.Label} Label.
 */
anychart.core.PyramidFunnelBase.prototype.drawLabel_ = function(hovered) {
  var iterator = this.getIterator();

  var pointLabel = iterator.get('label');
  var hoverPointLabel = hovered ? iterator.get('hoverLabel') : null;
  var index = iterator.getIndex();
  var labelsFactory = /** @type {anychart.core.ui.LabelsFactory} */(hovered ? this.hoverLabels() : this.labels());
  var label = this.labels().getLabel(index);

  var labelEnabledState = pointLabel && goog.isDef(pointLabel['enabled']) ? pointLabel['enabled'] : null;
  var labelHoverEnabledState = hoverPointLabel && goog.isDef(hoverPointLabel['enabled']) ? hoverPointLabel['enabled'] : null;

  var isDraw = hovered ?
      goog.isNull(labelHoverEnabledState) ?
          goog.isNull(this.hoverLabels().enabled()) ?
              goog.isNull(labelEnabledState) ?
                  this.labels().enabled() :
                  labelEnabledState :
              this.hoverLabels().enabled() :
          labelHoverEnabledState :
      goog.isNull(labelEnabledState) ?
          this.labels().enabled() :
          labelEnabledState;

  var positionProvider = this.createLabelsPositionProvider_(null, hovered);
  var formatProvider = this.createFormatProvider();

  var isInsideLabels = this.isInsideLabels_();

  var isFitToPoint = true;
  if (!hovered && isInsideLabels && this.overlapMode() == anychart.enums.LabelsOverlapMode.NO_OVERLAP) {
    var labelBounds = labelsFactory.measureWithTransform(formatProvider, positionProvider, /** @type {Object} */(pointLabel), index);
    isFitToPoint = this.isLabelFitsIntoThePoint_(labelBounds);
  }

  if (isDraw && isFitToPoint) {
    if (label) {
      label.resetSettings();
      label.formatProvider(formatProvider);
      label.positionProvider(positionProvider);

    } else {
      label = this.labels().add(formatProvider, positionProvider, index);
    }

    label.currentLabelsFactory(labelsFactory);
    label.setSettings(/** @type {Object} */(pointLabel), /** @type {Object} */(hoverPointLabel));

    if (iterator.meta('labelWidthForced')) {
      label.width(anychart.utils.toNumber(iterator.meta('labelWidthForced')));
      // label height is automatically changed - fix label position
      var labelAnchorFromData = pointLabel && pointLabel['anchor'] ? pointLabel['anchor'] : null;
      var labelAnchorFromHoverData = hoverPointLabel && hoverPointLabel['anchor'] ? hoverPointLabel['anchor'] : null;

      // don't fix label position if anchor is set
      if (!labelAnchorFromData && !labelAnchorFromHoverData) {
        positionProvider = this.createLabelsPositionProvider_(label, hovered);
        label.positionProvider(positionProvider);
      }
    }

    label.draw();

    //todo: this shit should be reworked when labelsFactory will be reworked
    //if usual label isn't disabled and not drawn then it doesn't have container and hover label doesn't know nothing
    //about its DOM element and trying to apply itself setting to it. But nothing will happen because container is empty.
    if (hovered && !label.container() && this.labels().getDomElement()) {
      label.container(this.labels().getDomElement());
      if (!label.container().parent()) {
        label.container().parent(/** @type {acgraph.vector.ILayer} */(this.labels().container()));
      }
      label.draw();
    }

  } else if (label) {
    label.clear();
  }

  if (isDraw && !isInsideLabels) {
    this.updateConnector(label, hovered);
  }

  return label;
};


/**
 * Create labels position provider.
 *
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_label Is used for alignment of the label height.
 * @param {boolean=} opt_hovered If it is a hovered label drawing.
 * @return {Object} Object with info for labels formatting.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.createLabelsPositionProvider_ = function(opt_label, opt_hovered) {
  var labelPosition = this.getLabelsPosition_();

  var iterator = this.getIterator();
  var bounds = this.boundsValue_;

  var normalPointLabel = /** @type {Object} */ (iterator.get('label'));
  var hoverPointLabel = opt_hovered ? /** @type {Object} */ (iterator.get('hoverLabel')) : null;
  var labelSettings = hoverPointLabel || normalPointLabel || {};

  var x1 = anychart.utils.toNumber(iterator.meta('x1'));
  var x2 = anychart.utils.toNumber(iterator.meta('x2'));
  var y1 = anychart.utils.toNumber(iterator.meta('y1'));
  var y2 = anychart.utils.toNumber(iterator.meta('y2'));
  var y3 = anychart.utils.toNumber(iterator.meta('y3'));

  var pointWidth = x2 - x1;
  var pointHeight = y3 ? y3 - y1 : y2 - y1;

  var x = x1;
  var y = y1 + pointHeight / 2;

  var offsetY = anychart.utils.toNumber(labelSettings.offsetY) || 0;

  // get label width and height
  var labelBounds;
  if (opt_label) {
    labelBounds = this.getTrueLabelBounds(opt_label, opt_hovered);
  } else {
    labelBounds = this.labels_.measureWithTransform(this.createFormatProvider(), null, /** @type {Object} */(labelSettings));
    labelBounds = anychart.math.Rect.fromCoordinateBox(labelBounds);
  }

  var labelAnchor = opt_label && opt_label.anchor() || this.labels().anchor();

  if (opt_label) {
    y = opt_label.positionProvider()['value'].y;
  }

  var yForPointWidth = y + offsetY;

  // The label should not go beyond bounds,
  // calculate new Y if anchor in any center position
  if (labelBounds.height > pointHeight &&
      (labelAnchor == anychart.enums.Anchor.LEFT_CENTER ||
      labelAnchor == anychart.enums.Anchor.CENTER ||
      labelAnchor == anychart.enums.Anchor.RIGHT_CENTER)) {

    // bottom
    if ((y + labelBounds.height / 2) > bounds.top + bounds.height) {
      y = (bounds.top + bounds.height) - labelBounds.height / 2;
    }

    // top
    if ((y - labelBounds.height / 2) < bounds.top) {
      y = bounds.top + labelBounds.height / 2;
    }
  }

  var pointWidthAtY = this.getWidthAtYGivenReversed_(yForPointWidth);

  switch (labelPosition) {
    case anychart.enums.PyramidLabelsPosition.INSIDE:
      x += pointWidth / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT:
      x = this.centerXValue_ - pointWidthAtY / 2;
      x = bounds.left + x - this.connectorLengthValue_ - labelBounds.width / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN:
      x = bounds.left + labelBounds.width / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT:
      x = this.centerXValue_ + pointWidthAtY / 2;
      x = bounds.left + x + this.connectorLengthValue_ + labelBounds.width / 2;
      break;

    case anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN:
      x = bounds.left + bounds.width - labelBounds.width / 2;
      break;
  }

  // labels sub-pixel shift
  // when you set the top|bottom values of the anchor position
  if (labelAnchor == anychart.enums.Anchor.LEFT_TOP ||
      labelAnchor == anychart.enums.Anchor.CENTER_TOP ||
      labelAnchor == anychart.enums.Anchor.RIGHT_TOP) {

    y = y - .5;

  } else if (labelAnchor == anychart.enums.Anchor.LEFT_BOTTOM ||
      labelAnchor == anychart.enums.Anchor.CENTER_BOTTOM ||
      labelAnchor == anychart.enums.Anchor.RIGHT_BOTTOM) {

    y = y + .5;
  }

  return {'value': {'x': x, 'y': y}};
};


/**
 * Get label bounds given hover and forced the width of the label.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {boolean=} opt_hovered
 * @return {!anychart.math.Rect}
 */
anychart.core.PyramidFunnelBase.prototype.getTrueLabelBounds = function(label, opt_hovered) {
  var normalPointLabel = /** @type {Object} */ (this.data().get(label.getIndex(), 'label'));
  var hoverPointLabel = opt_hovered ? /** @type {Object} */ (this.data().get(label.getIndex(), 'hoverLabel')) : null;

  var labelSettings = hoverPointLabel || normalPointLabel || {};

  // labelWidthForced
  var savedWidth = labelSettings.width;
  if (this.data().meta(label.getIndex(), 'labelWidthForced')) {
    labelSettings.width = label.width();
  }

  var iterator = this.getIterator();
  iterator.select(label.getIndex());
  label.formatProvider(this.createFormatProvider());
  var labelBounds = this.labels_.measureWithTransform(label.formatProvider(), label.positionProvider(), /** @type {Object|null|undefined} */(labelSettings));

  // restore width in data
  labelSettings.width = savedWidth;

  return anychart.math.Rect.fromCoordinateBox(labelBounds);
};


/**
 * To place the labels so that they do not overlap.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel If label is hovered.
 * @param {boolean=} opt_hoverAll hover all labels.
 */
anychart.core.PyramidFunnelBase.prototype.overlapCorrection_ = function(opt_hoveredLabel, opt_hoverAll) {
  if (this.overlapMode() != anychart.enums.LabelsOverlapMode.NO_OVERLAP || this.isInsideLabels_() || !this.labels().enabled()) {
    return;
  }

  var hoveredIndex = opt_hoveredLabel ? opt_hoveredLabel.getIndex() : null;

  this.clearLabelDomains_();
  var count = this.getIterator().getRowsCount();
  var bounds = this.boundsValue_;

  var i;
  var index;
  var label;
  var labelBounds;
  var comparingLabel;
  var comparingLabelBounds;

  var heightTotal = 0;
  for (i = 0; i < count; i++) {
    label = this.labels().getLabel(i);
    if (!label || label.enabled() == false) {
      continue;
    }
    labelBounds = this.getTrueLabelBounds(label, opt_hoverAll || hoveredIndex == label.getIndex());
    heightTotal += labelBounds.height;
  }

  // super hack (if heightTotal > bounds.height then must be one domain for all labels)
  if (heightTotal >= bounds.height) {
    var newLabelsDomain = new anychart.core.PyramidFunnelBase.LabelsDomain(this);
    for (i = 0; i < count; i++) {
      label = this.labels().getLabel(i);
      if (!label || label.enabled() == false) {
        continue;
      }
      newLabelsDomain.addLabel(label);
    }

    this.labelDomains.push(newLabelsDomain);

  } else {
    // check intersect
    for (i = 0; i < count - 1; i++) {
      if (this.reversed_) {
        index = i;
      } else {
        // Invert the cycle
        index = count - 1 - i;
      }

      label = this.labels().getLabel(index);
      if (!label || label.enabled() == false) {
        continue;
      }
      labelBounds = this.getTrueLabelBounds(label, opt_hoverAll || hoveredIndex == label.getIndex());
      heightTotal += labelBounds.height;

      comparingLabel = this.reversed_ ? this.getNextEnabledLabel(label) : this.getPreviousEnabledLabel(label);

      // for disabled labels
      if (!comparingLabel) {
        continue;
      }
      comparingLabelBounds = this.getTrueLabelBounds(comparingLabel, opt_hoverAll || hoveredIndex == comparingLabel.getIndex());

      // if intersected
      if (comparingLabelBounds.top <= labelBounds.top + labelBounds.height) {
        this.getLabelsDomainForLabel_(label, comparingLabel);
      }
    }
  }

  if (this.labelDomains.length) {
    goog.array.forEach(this.labelDomains, function(labelDomain) {
      labelDomain.recalculateLabelsPosition(opt_hoveredLabel, opt_hoverAll);
    });
  }
};


/**
 *
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.PyramidFunnelBase.prototype.getNextEnabledLabel = function(label) {
  if (!label) {
    return null;
  }
  var count = this.getIterator().getRowsCount();

  // label is last
  if (label.getIndex() == count - 1) {
    return null;
  }

  var startIndex = label.getIndex() + 1;
  var testLabel;

  for (var i = startIndex; i <= count - 1; i++) {
    testLabel = this.labels().getLabel(i);
    if (testLabel && testLabel.enabled() !== false) {
      return testLabel;
    }
  }

  return null;
};


/**
 *
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.PyramidFunnelBase.prototype.getPreviousEnabledLabel = function(label) {
  if (!label) {
    return null;
  }

  // label is first
  if (label.getIndex() == 0) {
    return null;
  }

  var startIndex = label.getIndex() - 1;
  var testLabel;

  for (var i = startIndex; i >= 0; i--) {
    testLabel = this.labels().getLabel(i);
    if (testLabel && testLabel.enabled() !== false) {
      return testLabel;
    }
  }

  return null;
};


/**
 * If the searchLabel is already contained in any domain, returns this domain.
 * Otherwise it will create a new domain.
 *
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label} searchLabel
 * @param {anychart.core.ui.LabelsFactory.Label} currentLabel
 * @return {anychart.core.PyramidFunnelBase.LabelsDomain}
 */
anychart.core.PyramidFunnelBase.prototype.getLabelsDomainForLabel_ = function(searchLabel, currentLabel) {
  var foundDomain = this.getLabelsDomainByLabel(searchLabel);

  if (!goog.isNull(foundDomain)) {
    foundDomain.addLabel(currentLabel);
    return foundDomain;

  } else {
    var newLabelsDomain;

    newLabelsDomain = new anychart.core.PyramidFunnelBase.LabelsDomain(this);
    newLabelsDomain.addLabel(searchLabel);
    newLabelsDomain.addLabel(currentLabel);

    this.labelDomains.push(newLabelsDomain);

    return newLabelsDomain;
  }
};


/**
 * If the label is already contained in another domain, to find this domain.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @return {?anychart.core.PyramidFunnelBase.LabelsDomain}
 */
anychart.core.PyramidFunnelBase.prototype.getLabelsDomainByLabel = function(label) {
  if (!this.labelDomains.length) {
    return null;
  }

  return goog.array.find(this.labelDomains, function(labelDomain) {
    return goog.array.indexOf(labelDomain.labels, label) !== -1;
  });
};


/**
 *
 * @protected
 * @param {anychart.core.PyramidFunnelBase.LabelsDomain} targetDomain
 * @param {anychart.core.PyramidFunnelBase.LabelsDomain} sourceDomain
 * @return {anychart.core.PyramidFunnelBase.LabelsDomain}
 */
anychart.core.PyramidFunnelBase.prototype.mergeLabelsDomains = function(targetDomain, sourceDomain) {
  var targetDomainIndex = targetDomain.labels[0].getIndex();
  var sourceDomainIndex = sourceDomain.labels[0].getIndex();

  /*
   * Marge labels with preservation of sorting.
   * if reversed == true then ascending pseudo sorting
   * if reversed == false then descending pseudo sorting
   *
   * This method was simplified by using mathematical logic (by Alexander Ky).
   */
  targetDomain.labels = (this.reversed_ == targetDomainIndex < sourceDomainIndex) ?
      goog.array.concat(targetDomain.labels, sourceDomain.labels) :
      goog.array.concat(sourceDomain.labels, targetDomain.labels);

  goog.array.remove(this.labelDomains, sourceDomain);

  return targetDomain;
};


/**
 * To clear an array of label domains.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.clearLabelDomains_ = function() {
  if (!this.labelDomains.length) {
    return;
  }

  goog.array.forEach(this.labelDomains, function(labelDomain) {
    labelDomain.clear();
  });

  this.labelDomains.length = 0;
};


/**
 * To remove the label domain.
 * @protected
 * @param {anychart.core.PyramidFunnelBase.LabelsDomain} labelDomain
 */
anychart.core.PyramidFunnelBase.prototype.removeLabelDomain = function(labelDomain) {
  if (!this.labelDomains.length) {
    return;
  }

  labelDomain.clear();
  goog.array.remove(this.labelDomains, labelDomain);
};


/**
 * Returns true if the label fits into the point. ONLY inside position.
 * @private
 * @param {Array.<number>} labelBounds .
 * @return {boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isLabelFitsIntoThePoint_ = function(labelBounds) {
  var iterator = this.getIterator();
  var pointBounds = [
    iterator.meta('x1'), iterator.meta('y1'),
    iterator.meta('x2'), iterator.meta('y1'),
    iterator.meta('x4'), iterator.meta('y2'),
    iterator.meta('x3'), iterator.meta('y2')];

  var result = true, i, len, k, k1;
  var p1x, p1y, p2x, p2y;
  var l1x, l1y, l2x, l2y;

  for (i = 0, len = pointBounds.length; i < len - 1; i = i + 2) {
    k = i == len - 2 ? 0 : i + 2;
    k1 = i == len - 2 ? 1 : i + 3;

    p1x = pointBounds[i];
    p1y = pointBounds[i + 1];
    p2x = pointBounds[k];
    p2y = pointBounds[k1];

    l1x = labelBounds[i];
    l1y = labelBounds[i + 1];
    l2x = labelBounds[k];
    l2y = labelBounds[k1];

    // if start neck and bottom line (check relative bottom line)
    if (iterator.meta('y3') && i == 4) {
      p1y = anychart.utils.toNumber(iterator.meta('y3'));
      p2y = anychart.utils.toNumber(iterator.meta('y3'));
    }

    // e.g. top point of the pyramid
    if (p1x == p2x) {
      p2x += .01; // fix for create line for intersect checking
    }

    result = result && anychart.math.isPointOnLine(p1x, p1y, p2x, p2y, l1x, l1y) == 1;
    result = result && anychart.math.isPointOnLine(p1x, p1y, p2x, p2y, l2x, l2y) == 1;
  }

  return result;
};


/**
 * @private
 * @return {!boolean} Define, is labels have inside position.
 */
anychart.core.PyramidFunnelBase.prototype.isInsideLabels_ = function() {
  return this.getLabelsPosition_() == anychart.enums.PyramidLabelsPosition.INSIDE;
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isInColumn_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN);
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isInLeftPosition_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_LEFT_IN_COLUMN);
};


/**
 * @private
 * @return {!boolean} .
 */
anychart.core.PyramidFunnelBase.prototype.isInRightPosition_ = function() {
  var position = this.getLabelsPosition_();

  return (position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT ||
      position == anychart.enums.PyramidLabelsPosition.OUTSIDE_RIGHT_IN_COLUMN);
};


/**
 * Shifts centerX if the label does not fit on width. And sets a new width for the label.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.shiftCenterX_ = function() {
  if (!this.labels().enabled()) {
    return;
  }

  if (this.isInsideLabels_()) {
    return;
  }

  // As shiftCenterX_ called before drawing points,
  // it is necessary to calculate in advance the coordinates of each point.
  this.calculatePoint_();

  var iterator = this.getIterator();
  // reset `labelWidthForced` meta
  iterator.meta('labelWidthForced', undefined);

  var bounds = this.boundsValue_;

  // X coordinates at Y
  var pointXLeft;
  var pointXRight;

  var labelData = iterator.get('label');
  var labelPositionProvider = this.createLabelsPositionProvider_();
  var formatProvider = this.createFormatProvider();

  var labelBounds = this.labels().measureWithTransform(formatProvider, labelPositionProvider, /** @type {Object} */(labelData));
  labelBounds = anychart.math.Rect.fromCoordinateBox(labelBounds);

  var labelX1 = labelBounds.left;
  var labelX2 = labelBounds.left + labelBounds.width;

  var numberToShift;
  var halfBaseWidth;
  var maxShift;
  var newLabelWidth;
  var minLabelWidth = 10;

  var pointWidthAtY = this.reversed_ ?
      this.getWidthAtY_(labelBounds.top - bounds.top) :
      this.getWidthAtY_(bounds.height - (labelBounds.top + labelBounds.height) + bounds.top);

  // in left
  if (this.isInLeftPosition_()) {
    pointXLeft = this.centerXValue_ - pointWidthAtY / 2;
    pointXLeft = bounds.left + pointXLeft;

    // calculate the maximum possible shift
    halfBaseWidth = this.baseWidthValue_ / 2;
    maxShift = bounds.width - this.centerXValue_ - halfBaseWidth;

    if (this.isInColumn_()) {
      // The connector must not be less than anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH
      if (labelX2 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH > pointXLeft) {
        numberToShift = labelX2 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH - pointXLeft;

        if (numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ + maxShift;

          // re-calculate pointXLeft
          pointXLeft = this.centerXValue_ - pointWidthAtY / 2;
          pointXLeft = bounds.left + pointXLeft;

          newLabelWidth = pointXLeft - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH - labelX1;

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ + numberToShift;
        }
      }

      // not column
    } else {
      if (labelX1 < bounds.left) {
        numberToShift = Math.abs(bounds.left - labelX1);

        if (numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ + maxShift;

          // re-calculate pointXLeft
          pointXLeft = this.centerXValue_ - pointWidthAtY / 2;

          newLabelWidth = pointXLeft - this.connectorLengthValue_;

          if (newLabelWidth < minLabelWidth) {
            newLabelWidth = minLabelWidth;
          }

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ + numberToShift;
        }
      }
    }

    // in right
  } else if (this.isInRightPosition_()) {
    pointXRight = this.centerXValue_ + pointWidthAtY / 2;
    pointXRight = pointXRight + bounds.left;

    // calculate the maximum possible shift
    halfBaseWidth = this.baseWidthValue_ / 2;
    maxShift = bounds.width - (bounds.width - this.centerXValue_) - halfBaseWidth;

    if (this.isInColumn_()) {
      // labelX1 can be less than zero if it is too long
      if (labelX1 < 0 || labelX1 - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH < pointXRight) {
        numberToShift = Math.abs(pointXRight - labelX1 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH);

        if (labelX1 < 0 || numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ - maxShift;

          // re-calculate pointXLeft
          pointXRight = this.centerXValue_ + pointWidthAtY / 2;
          pointXRight = pointXRight + bounds.left;

          newLabelWidth = labelX2 - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH - pointXRight;

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ - numberToShift;
        }
      }

      // not column
    } else {
      if (labelX2 > bounds.left + bounds.width) {
        numberToShift = labelX2 - (bounds.left + bounds.width);

        if (numberToShift > maxShift) {
          this.centerXValue_ = this.centerXValue_ - maxShift;

          newLabelWidth = bounds.left + bounds.width - labelX1 + maxShift;

          if (newLabelWidth < minLabelWidth) {
            newLabelWidth = minLabelWidth;
          }

          iterator.meta('labelWidthForced', newLabelWidth);

        } else {
          this.centerXValue_ = this.centerXValue_ - numberToShift;
        }
      }
    }
  }
};


/**
 * @private
 * @return {anychart.enums.PyramidLabelsPosition}
 */
anychart.core.PyramidFunnelBase.prototype.getLabelsPosition_ = function() {
  return anychart.enums.normalizePyramidLabelsPosition(this.labels().position());
};


/**
 * Draws connector line for label.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label} label Label.
 * @param {acgraph.vector.Path} path Connector path element.
 * @param {boolean} hovered If label is hovered.
 */
anychart.core.PyramidFunnelBase.prototype.drawConnectorLine_ = function(label, path, hovered) {
  var bounds = this.boundsValue_;
  var index = label.getIndex();

  // `.data()` drawing connector should occur regardless of the position of the iterator.
  // Since the connectors can be redrawn several times through the method of
  // anychart.core.PyramidFunnelBase.LabelsDomain.prototype.applyLabelsPosition_
  var pointPath = this.data().meta(index, 'point');
  var pointBounds = pointPath.getBounds();
  var labelBounds = this.getTrueLabelBounds(label, hovered);

  var x0 = labelBounds.left;
  var y0 = labelBounds.top + (labelBounds.height / 2);
  var x1;
  var y1 = pointBounds.top + (pointBounds.height / 2);

  var pointWidthAtY = this.getWidthAtYGivenReversed_(y1);

  // in left
  if (this.isInLeftPosition_()) {
    x0 = x0 + labelBounds.width;

    x1 = this.centerXValue_ - pointWidthAtY / 2;
    x1 = x1 + bounds.left;

    if (x0 > x1 && (Math.abs(y1 - y0) < anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH)) {
      x0 = x1 - anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
    }

    // in right
  } else if (this.isInRightPosition_()) {
    x1 = this.centerXValue_ + pointWidthAtY / 2;
    x1 = x1 + bounds.left;

    if (x0 < x1 && (Math.abs(y1 - y0) < anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH)) {
      x0 = x1 + anychart.core.PyramidFunnelBase.MIN_CONNECTOR_LENGTH;
    }
  }

  // y1 + .001 is svg shit (for work gradient stroke on horizontal line)
  // see http://www.w3.org/TR/SVG/coords.html#ObjectBoundingBox
  // http://stackoverflow.com/questions/13223636/svg-gradient-for-perfectly-horizontal-path
  path.clear().moveTo(x0, y0).lineTo(x1, y1 + .001);
};


/**
 * Update or create label connector.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {boolean} hovered If label is hovered.
 */
anychart.core.PyramidFunnelBase.prototype.updateConnector = function(label, hovered) {
  var labelIndex = label.getIndex();

  if (this.drawnConnectors_[labelIndex]) {
    this.drawConnectorLine_(label, this.drawnConnectors_[labelIndex], hovered);
  } else {
    var connectorPath = /** @type {acgraph.vector.Path} */(this.connectorsLayer_.genNextChild());
    this.drawnConnectors_[labelIndex] = connectorPath;
    connectorPath.stroke(this.connectorStroke_);
    this.drawConnectorLine_(label, connectorPath, hovered);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for data markers.
 * @example <t>listingOnly</t>
 * chart.markers().size(10);
 * @return {!anychart.core.ui.MarkersFactory} Markers instance.
 *//**
 * Setter for data markers.<br/>
 * <b>Note:</b> pass <b>'none'</b> or <b>null</b> to turn off markers.
 * @example <t>pyramidChart</t>
 * chart.markers(null);
 * @param {(Object|boolean|null|string)=} opt_value Data markers settings.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null|string)=} opt_value Data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.PyramidFunnelBase)} Markers instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();

    this.markers_.listenSignals(this.markersInvalidated_, this);
    this.markers_.setParentEventTarget(this);
    this.registerDisposable(this.markers_);
  }

  if (goog.isDef(opt_value)) {
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


/**
 * Getter for series data markers on hover.
 * @example <t>listingOnly</t>
 * series.hoverMarkers().size(20);
 * @return {!anychart.core.ui.MarkersFactory} Markers instance.
 *//**
 * Setter for series data markers on hover.<br/>
 * <b>Note:</b> pass <b>'none'</b> or <b>null</b> to turn of markers.
 * @example <t>listingOnly</t>
 * series.hoverMarkers(null);
 * @example <t>lineChart</t>
 * chart.spline([1, 1.4, 1.2, 2]).hoverMarkers({size: 10, type: 'star5'});
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!anychart.core.PyramidFunnelBase} {@link anychart.core.PyramidFunnelBase} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null|string)=} opt_value Series data markers settings.
 * @return {!(anychart.core.ui.MarkersFactory|anychart.core.PyramidFunnelBase)} Markers instance or itself for chaining call.
 */
anychart.core.PyramidFunnelBase.prototype.hoverMarkers = function(opt_value) {
  if (!this.hoverMarkers_) {
    this.hoverMarkers_ = new anychart.core.ui.MarkersFactory();

    this.registerDisposable(this.hoverMarkers_);
    // don't listen to it, for it will be reapplied at the next hover
  }

  if (goog.isDef(opt_value)) {
    this.hoverMarkers_.setup(opt_value);
    return this;
  }
  return this.hoverMarkers_;
};


/**
 * Listener for markers invalidation.
 * @private
 * @param {anychart.SignalEvent} event Invalidation event.
 */
anychart.core.PyramidFunnelBase.prototype.markersInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.PYRAMID_FUNNEL_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Return marker fill color for point.
 * @return {!acgraph.vector.Fill} Marker color for point.
 */
anychart.core.PyramidFunnelBase.prototype.getMarkerFill = function() {
  return this.getFinalFill(false, false);
};


/**
 * Return marker stroke color for point.
 * @return {!acgraph.vector.Stroke} Marker color for point.
 */
anychart.core.PyramidFunnelBase.prototype.getMarkerStroke = function() {
  return /** @type {acgraph.vector.Stroke} */(anychart.color.darken(this.getMarkerFill()));
};


/**
 * Create points position provider.
 * @private
 * @param {string} anchorPosition Understands anychart.enums.Anchor and some additional values.
 * @return {Object} Object with info for markers position.
 */
anychart.core.PyramidFunnelBase.prototype.createMarkersPositionProvider_ = function(anchorPosition) {
  anchorPosition = anychart.enums.normalizeAnchor(anchorPosition);

  var bounds = this.boundsValue_;
  var iterator = this.getIterator();
  var point = iterator.meta('point');
  var pointBounds = point.getBounds();

  var x = /** @type {number} */ (iterator.meta('x1'));
  var y = /** @type {number} */ (iterator.meta('y1'));

  var pointWidthAtY;

  switch (anchorPosition) {
    case anychart.enums.Anchor.LEFT_TOP:
      y = iterator.meta('y1');
      x = iterator.meta('x1');
      break;

    case anychart.enums.Anchor.LEFT_CENTER:
      y += pointBounds.height / 2;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_ - pointWidthAtY / 2;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.LEFT_BOTTOM:
      y += pointBounds.height;
      x = iterator.meta('x3');
      break;

    case anychart.enums.Anchor.CENTER_TOP:
      x = this.centerXValue_;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.CENTER:
      y += pointBounds.height / 2;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.CENTER_BOTTOM:
      y += pointBounds.height;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.RIGHT_TOP:
      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x += pointWidthAtY;
      break;

    case anychart.enums.Anchor.RIGHT_CENTER:
      y += pointBounds.height / 2;

      pointWidthAtY = this.getWidthAtYGivenReversed_(y);
      x = this.centerXValue_ + pointWidthAtY / 2;
      x = x + bounds.left;
      break;

    case anychart.enums.Anchor.RIGHT_BOTTOM:
      x = iterator.meta('x4');
      y += pointBounds.height;
      break;
  }

  return {'value': {'x': x, 'y': y}};
};


/**
 * Get current width of funnel at Y-coordinate given reversed flag.
 * @param {number} y Y-coordinate.
 * @return {number} current width of funnel.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.getWidthAtYGivenReversed_ = function(y) {
  var bounds = this.boundsValue_;
  return this.reversed_ ?
      this.getWidthAtY_(y - bounds.top) :
      this.getWidthAtY_(bounds.height - y + bounds.top);
};


/**
 * Draws marker for the point.
 * @protected
 * @param {boolean} hovered If it is a hovered marker drawing.
 */
anychart.core.PyramidFunnelBase.prototype.drawMarker = function(hovered) {
  var pointMarker = this.getIterator().get('marker');
  var hoverPointMarker = this.getIterator().get('hoverMarker');
  var index = this.getIterator().getIndex();
  var markersFactory = /** @type {anychart.core.ui.MarkersFactory} */(hovered ? this.hoverMarkers() : this.markers());

  var marker = this.markers().getMarker(index);

  var markerEnabledState = pointMarker && goog.isDef(pointMarker['enabled']) ? pointMarker['enabled'] : null;
  var markerHoverEnabledState = hoverPointMarker && goog.isDef(hoverPointMarker['enabled']) ? hoverPointMarker['enabled'] : null;

  var isDraw = hovered ?
      goog.isNull(markerHoverEnabledState) ?
          goog.isNull(this.hoverMarkers().enabled()) ?
              goog.isNull(markerEnabledState) ?
                  this.markers().enabled() :
                  markerEnabledState :
              this.hoverMarkers().enabled() :
          markerHoverEnabledState :
      goog.isNull(markerEnabledState) ?
          this.markers().enabled() :
          markerEnabledState;

  if (isDraw) {
    var markerPosition = pointMarker && pointMarker['position'] ? pointMarker['position'] : null;
    var markerHoverPosition = hoverPointMarker && hoverPointMarker['position'] ? hoverPointMarker['position'] : null;
    var position = (hovered && (markerHoverPosition || this.hoverMarkers().position())) || markerPosition || this.markers().position();

    var positionProvider = this.createMarkersPositionProvider_(/** @type {anychart.enums.Position|string} */(position));
    if (marker) {
      marker.positionProvider(positionProvider);
    } else {
      marker = this.markers().add(positionProvider, index);
    }

    var markerSettings = {};
    var settingsPropsList = ['position', 'anchor', 'offsetX', 'offsetY',
      'type', 'size', 'fill', 'stroke', 'enabled'];
    // Copy settings
    if (pointMarker) {
      goog.array.forEach(settingsPropsList, function(prop) {
        if (prop in pointMarker) {
          markerSettings[prop] = pointMarker[prop];
        }
      });
    }

    var markerType = pointMarker && pointMarker['type'];
    var finalMarkerType = goog.isDef(markerType) ? markerType : (this.markers().getType() || this.markerPalette().itemAt(index));
    var markerHoverType = hoverPointMarker && hoverPointMarker['type'];
    var finalMarkerHoverType = goog.isDef(markerHoverType) ? markerHoverType : this.hoverMarkers().getType();
    markerSettings.type = hovered && goog.isDef(finalMarkerHoverType) ? finalMarkerHoverType : finalMarkerType;

    var markerFill = pointMarker && pointMarker['fill'];
    var finalMarkerFill = goog.isDef(markerFill) ? markerFill : (this.markers().getFill() || this.getMarkerFill());
    var markerHoverFill = hoverPointMarker && hoverPointMarker['fill'];
    var finalMarkerHoverFill = goog.isDef(markerHoverFill) ? markerHoverFill : this.hoverMarkers().getFill();
    markerSettings.fill = hovered && goog.isDef(finalMarkerHoverFill) ? finalMarkerHoverFill : finalMarkerFill;

    var markerStroke = pointMarker && pointMarker['stroke'];
    var finalMarkerStroke = goog.isDef(markerStroke) ? markerStroke : (this.markers().getStroke() || this.getMarkerStroke());
    var markerHoverStroke = hoverPointMarker && hoverPointMarker['stroke'];
    var finalMarkerHoverStroke = goog.isDef(markerHoverStroke) ? markerHoverStroke : (this.hoverMarkers().getStroke() || this.getMarkerStroke());
    markerSettings.stroke = hovered && goog.isDef(finalMarkerHoverStroke) ? finalMarkerHoverStroke : finalMarkerStroke;

    marker.resetSettings();
    marker.currentMarkersFactory(markersFactory);
    marker.setSettings(/** @type {Object} */(markerSettings), /** @type {Object} */(hoverPointMarker));

    marker.draw();

  } else if (marker) {
    marker.clear();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for tolltip settings.
 * @example
 * chart.tooltip()
 *     .titleFormatter(function(){
 *         return 'title [' + this.index + ']';
 *     })
 *     .title()
 *         .enabled(true);
 * chart.container(stage).draw();
 * @return {!anychart.core.ui.Tooltip} An instance of {@link anychart.core.ui.Tooltip} class for method chaining.
 *//**
 * Setter for tolltip settings.
 * @example
 * var chart = anychart.pyramid([10, 14, 8, 12]);
 * chart.tooltip(false);
 * chart.container(stage).draw();
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!anychart.core.PyramidFunnelBase} An instance of {@link anychart.core.PyramidFunnelBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Tooltip settings.
 * @return {!(anychart.core.PyramidFunnelBase|anychart.core.ui.Tooltip)} Tooltip instance or self for method chaining.
 */
anychart.core.PyramidFunnelBase.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Tooltip invalidation handler.
 * @private
 * @param {anychart.SignalEvent} event Event object.
 */
anychart.core.PyramidFunnelBase.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


/**
 * @param {anychart.core.MouseEvent=} opt_event initiates tooltip show.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.showTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var formatProvider = this.createFormatProvider();
  if (tooltip.isFloating() && opt_event) {
    tooltip.show(
        formatProvider,
        new acgraph.math.Coordinate(opt_event['clientX'], opt_event['clientY']));
  } else {
    tooltip.show(
        formatProvider,
        new acgraph.math.Coordinate(0, 0));
  }
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.core.PyramidFunnelBase.prototype.hideTooltip = function() {
  (/** @type {anychart.core.ui.Tooltip} */(this.tooltip())).hide();
};


/**
 * Calculates statistic for chart.
 * @private
 */
anychart.core.PyramidFunnelBase.prototype.calculateStatistics_ = function() {
  this.statistics_ = {};
  var iterator = this.data().getIterator();
  var value;
  var missingPoints = 0;
  var min = Number.MAX_VALUE;
  var max = -Number.MAX_VALUE;
  var sum = 0;
  while (iterator.advance()) {
    value = /** @type {number|string|null|undefined} */ (iterator.get('value'));
    // if missing
    if (this.isMissing_(value)) {
      missingPoints++;
    } else {
      value = this.handleValue_(value);
      min = Math.min(value, min);
      max = Math.max(value, max);
      sum += value;
    }
  }

  var count = iterator.getRowsCount() - missingPoints; // do not count missing points
  var avg;
  if (count == 0) min = max = sum = avg = undefined;
  else avg = sum / count;
  this.statistics_['count'] = count;
  this.statistics_['min'] = min;
  this.statistics_['max'] = max;
  this.statistics_['sum'] = sum;
  this.statistics_['average'] = avg;
};


/**
 * Gets statistic value by its key.
 * @param {string=} opt_key
 * @param {string=} opt_value
 * @return {*} Statistic value by key, statistic object, or self in case of setter.
 */
anychart.core.PyramidFunnelBase.prototype.statistics = function(opt_key, opt_value) {
  if (!this.statistics_)
    this.calculateStatistics_();
  if (goog.isDef(opt_key)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_key] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_key];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Create chart label/tooltip format provider.
 * @protected
 * @return {Object} Object with info for labels/tooltip formatting.
 */
anychart.core.PyramidFunnelBase.prototype.createFormatProvider = function() {
  if (!this.pointProvider_) {
    this.pointProvider_ = new anychart.core.utils.PointContextProvider(this, ['x', 'value', 'name']);
  }
  this.pointProvider_.applyReferenceValues();

  return this.pointProvider_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Legend.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.createLegendItemsProvider = function(sourceMode, itemsTextFormatter) {
  /**
   * @type {!Array.<anychart.core.ui.Legend.LegendItemProvider>}
   */
  var data = [];
  var iterator = this.getIterator().reset();
  var x, index;

  while (iterator.advance()) {
    x = iterator.get('x');
    index = iterator.getIndex();

    var legendItem = /** @type {Object} */ (iterator.get('legendItem') || {});
    var itemText = null;
    if (goog.isFunction(itemsTextFormatter)) {
      var format = this.createFormatProvider();
      itemText = itemsTextFormatter.call(format, format);
    }
    if (!goog.isString(itemText)) {
      itemText = String(goog.isDef(iterator.get('name')) ? iterator.get('name') : iterator.get('x'));
    }
    var obj = {
      'enabled': true,
      'meta': {
        'pointIndex': index,
        'pointValue': iterator.get('value')
      },
      'iconType': anychart.enums.LegendItemIconType.SQUARE,
      'text': itemText,
      'iconStroke': this.getStrokeColor(true, false),
      'iconFill': this.getFillColor(true, false),
      'iconHatchFill': this.getFinalHatchFill(true, false)
    };
    goog.object.extend(obj, legendItem);
    obj['sourceUid'] = goog.getUid(this);
    obj['sourceKey'] = index;
    data.push(obj);
  }

  return data;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.legendItemCanInteractInMode = function(mode) {
  return true;
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.legendItemOver = function(item) {
  var sourceKey = item.sourceKey();
  if (item && !goog.isDefAndNotNull(sourceKey) && !isNaN(sourceKey))
    return;
  var iterator = this.data().getIterator();
  if (iterator.select(/** @type {number} */ (sourceKey))) {
    this.hoverPoint_(/** @type {number} */ (sourceKey));
  }
};


/** @inheritDoc */
anychart.core.PyramidFunnelBase.prototype.legendItemOut = function(item) {
  this.unhoverPoint_();
};


/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['type'] = anychart.enums.ChartTypes.PYRAMID;
  json['data'] = this.data().serialize();
  json['labels'] = this.labels().serialize();
  json['hoverLabels'] = this.hoverLabels().serialize();
  json['palette'] = this.palette().serialize();
  json['hatchFillPalette'] = this.hatchFillPalette().serialize();
  json['markerPalette'] = this.markerPalette().serialize();
  json['tooltip'] = this.tooltip().serialize();
  json['markers'] = this.markers().serialize();
  json['hoverMarkers'] = this.hoverMarkers().serialize();

  json['baseWidth'] = this.baseWidth();
  json['overlapMode'] = this.overlapMode();
  json['pointsPadding'] = this.pointsPadding();
  json['connectorLength'] = this.connectorLength();

  if (goog.isFunction(this['connectorStroke'])) {
    if (goog.isFunction(this.connectorStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' connectorStroke']
      );
    } else {
      json['connectorStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.connectorStroke()));
    }
  }
  if (goog.isFunction(this['fill'])) {
    if (goog.isFunction(this.fill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' fill']
      );
    } else {
      json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
    }
  }
  if (goog.isFunction(this['hoverFill'])) {
    if (goog.isFunction(this.hoverFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hoverFill']
      );
    } else {
      json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
    }
  }
  if (goog.isFunction(this['stroke'])) {
    if (goog.isFunction(this.stroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' stroke']
      );
    } else {
      json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
    }
  }
  if (goog.isFunction(this['hoverStroke'])) {
    if (goog.isFunction(this.hoverStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hoverStroke']
      );
    } else {
      json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
    }
  }
  if (goog.isFunction(this['hatchFill'])) {
    if (goog.isFunction(this.hatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hatchFill']
      );
    } else {
      json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
    }
  }
  if (goog.isFunction(this['hoverHatchFill'])) {
    if (goog.isFunction(this.hoverHatchFill())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          [this.getType() + ' hoverHatchFill']
      );
    } else {
      json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/
          (this.hoverHatchFill()));
    }
  }

  return json;
};


/**
 * @inheritDoc
 */
anychart.core.PyramidFunnelBase.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.baseWidth(config['baseWidth']);
  this.connectorLength(config['connectorLength']);
  this.connectorStroke(config['connectorStroke']);
  this.data(config['data']);
  this.fill(config['fill']);
  this.hatchFill(config['hatchFill']);
  this.hatchFillPalette(config['hatchFillPalette']);
  this.hoverFill(config['hoverFill']);
  this.hoverHatchFill(config['hoverHatchFill']);
  this.hoverLabels(config['hoverLabels']);
  this.hoverMarkers(config['hoverMarkers']);
  this.hoverStroke(config['hoverStroke']);
  this.labels(config['labels']);
  this.markerPalette(config['markerPalette']);
  this.markers(config['markers']);
  this.overlapMode(config['overlapMode']);
  this.palette(config['palette']);
  this.pointsPadding(config['pointsPadding']);
  this.stroke(config['stroke']);
  this.tooltip(config['tooltip']);
};



/**
 * Labels domain for overlap mode.
 * @constructor
 * @param {!anychart.core.PyramidFunnelBase} chart .
 */
anychart.core.PyramidFunnelBase.LabelsDomain = function(chart) {
  /**
   * Link to chart.
   * @type {!anychart.core.PyramidFunnelBase}
   */
  this.chart = chart;

  /**
   * Domain labels.
   * @type {Array.<anychart.core.ui.LabelsFactory.Label>}
   */
  this.labels = [];

  /**
   * Domain height.
   * @type {number}
   */
  this.height;

  /**
   * Top left domain position.
   * @type {number}
   */
  this.y;
};


/**
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label} label
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.addLabel = function(label) {
  this.labels.push(label);
  if (this.chart.reversed_) {
    // ascending
    goog.array.sort(this.labels, function(a, b) {
      return a.getIndex() - b.getIndex();
    });
  } else {
    // descending
    goog.array.sort(this.labels, function(a, b) {
      return b.getIndex() - a.getIndex();
    });
  }
};


/**
 * To clear an array of labels.
 * @protected
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.clear = function() {
  this.labels.length = 0;
};


/**
 * To calculate the coordinates of the labels given the overlap mode.
 * @protected
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel
 * @param {boolean=} opt_hoverAll hover all labels.
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.recalculateLabelsPosition = function(opt_hoveredLabel, opt_hoverAll) {
  if (this.labels.length < 2) {
    this.chart.removeLabelDomain(this);
    return;
  }

  var domain = this;
  var bounds = this.chart.boundsValue_;
  var hoveredIndex = opt_hoveredLabel ? opt_hoveredLabel.getIndex() : null;

  var firstLabel = this.labels[0];
  var lastLabel = this.labels[this.labels.length - 1];
  var firstLabelBounds = this.getLabelBounds_(firstLabel, opt_hoverAll || hoveredIndex == firstLabel.getIndex());

  var h1, y1;
  var h2, y2;
  var domainTop;

  // To calculate between each two labels
  var prevLabel = firstLabel;
  var prevLabelBounds = firstLabelBounds;
  var prevLabelPointPath = this.chart.data().meta(prevLabel.getIndex(), 'point');
  var prevLabelPointBounds = prevLabelPointPath.getBounds();

  var label, labelBounds, labelPointPath, labelPointBounds;
  for (var i = 1, len = this.labels.length; i < len; i++) {
    label = this.labels[i];
    labelBounds = this.getLabelBounds_(label, opt_hoverAll || hoveredIndex == label.getIndex());
    labelPointPath = this.chart.data().meta(label.getIndex(), 'point');
    labelPointBounds = labelPointPath.getBounds();

    if (!h1 && !y1) {
      h1 = prevLabelBounds.height;
      y1 = prevLabelPointBounds.top + prevLabelPointBounds.height / 2 + (prevLabel.offsetY() || 0);
    }

    h2 = labelBounds.height;
    y2 = labelPointBounds.top + labelPointBounds.height / 2 + (label.offsetY() || 0);

    domainTop = 1 / 4 * (-3 * h1 - h2 + 2 * y1 + 2 * y2);

    // To calculate the Y coordinate of the domain center by the formula and remember it as y1
    y1 = 1 / 4 * (2 * y1 + 2 * y2 - h1 + h2);
    // And remember the height of the domain for next iteration
    h1 = h1 + h2;
  }

  // update
  this.height = goog.array.reduce(this.labels, function(res, label) {
    var labelBounds = domain.getLabelBounds_(label, opt_hoverAll || hoveredIndex == label.getIndex());
    return res + labelBounds.height;
  }, 0);

  // bottom boundary
  if (domainTop + this.height > bounds.top + bounds.height) {
    domainTop = bounds.top + bounds.height - this.height;
  }
  // top boundary
  if (domainTop < bounds.top) {
    domainTop = bounds.top;
  }
  this.y = domainTop;

  this.applyLabelsPosition_(opt_hoveredLabel, opt_hoverAll);

  var comparingLabel;
  var comparingLabelBounds;
  var domainForPreviousLabel;
  var unitedDomain;

  label = this.chart.reversed_ ? lastLabel : firstLabel;

  if (label.getIndex() > 0) {
    comparingLabel = this.chart.getNextEnabledLabel(label);

    // for disabled labels
    if (!comparingLabel) {
      return;
    }

    comparingLabelBounds = domain.getLabelBounds_(comparingLabel, opt_hoverAll || hoveredIndex == comparingLabel.getIndex());
    labelBounds = domain.getLabelBounds_(label, opt_hoverAll || hoveredIndex == label.getIndex());

    var isOverlap = this.chart.reversed_ ?
        comparingLabelBounds.top < labelBounds.top + labelBounds.height :
        labelBounds.top < comparingLabelBounds.top + comparingLabelBounds.height;

    if (isOverlap) {
      domainForPreviousLabel = domain.chart.getLabelsDomainByLabel(comparingLabel);
      if (domainForPreviousLabel) {
        unitedDomain = domain.chart.mergeLabelsDomains(domainForPreviousLabel, this);
        unitedDomain.recalculateLabelsPosition(opt_hoveredLabel, opt_hoverAll);

      } else {
        this.chart.reversed_ ?
            this.labels.push(comparingLabel) :
            this.labels.unshift(comparingLabel);

        this.recalculateLabelsPosition(opt_hoveredLabel, opt_hoverAll);
      }
    }
  }
};


/**
 * To reposition the labels relative to the top of the domain.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label=} opt_hoveredLabel
 * @param {boolean=} opt_hoverAll hover all labels.
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.applyLabelsPosition_ = function(opt_hoveredLabel, opt_hoverAll) {
  var domain = this;

  var labelsHeightSum = 0;
  var labelsOffsetYSum = 0;

  var prevLabel = null;
  var prevLabelBounds = null;
  var prevLabelPosition = null;

  var hoveredIndex = opt_hoveredLabel ? opt_hoveredLabel.getIndex() : null;

  goog.array.forEach(this.labels, function(label) {
    var labelIsHovered = opt_hoverAll || hoveredIndex == label.getIndex();
    var labelPositionProvider = label.positionProvider()['value'];
    var labelBounds = domain.getLabelBounds_(label, labelIsHovered);
    var labelNewY = domain.y + labelsHeightSum + labelsOffsetYSum + labelBounds.height / 2;

    // Need to preserve the order of the labels.
    if (prevLabel && prevLabelBounds && prevLabelPosition) {
      var prevLabelPositionBottom = prevLabelPosition.y + prevLabelBounds.height / 2 + (prevLabel.offsetY() || 0);
      var currentLabelPositionTop = labelNewY - labelBounds.height / 2 + (label.offsetY() || 0);

      if (currentLabelPositionTop < prevLabelPositionBottom) {
        labelNewY += prevLabelPositionBottom - currentLabelPositionTop;
      }
    }

    label.positionProvider({'value': {'x': labelPositionProvider.x, 'y': labelNewY}});
    // Always draw label, because hover and unhover (with offsets and rotations and other bounds changers).
    label.draw();
    domain.chart.updateConnector(label, labelIsHovered);

    labelsHeightSum += labelBounds.height;
    labelsOffsetYSum += label.offsetY() || 0;

    prevLabel = label;
    prevLabelBounds = labelBounds;
    prevLabelPosition = {'x': labelPositionProvider.x, 'y': labelNewY};
  });
};


/**
 * Get label bounds given hover and forced the width of the label.
 * @private
 * @param {anychart.core.ui.LabelsFactory.Label} label
 * @param {boolean} hovered
 * @return {!anychart.math.Rect}
 */
anychart.core.PyramidFunnelBase.LabelsDomain.prototype.getLabelBounds_ = function(label, hovered) {
  var normalPointLabel = /** @type {Object} */ (this.chart.data().get(label.getIndex(), 'label'));
  var hoverPointLabel = hovered ? /** @type {Object} */ (this.chart.data().get(label.getIndex(), 'hoverLabel')) : null;

  var labelSettings = hoverPointLabel || normalPointLabel || {};

  // labelWidthForced
  var savedWidth = labelSettings.width;
  if (this.chart.data().meta(label.getIndex(), 'labelWidthForced')) {
    labelSettings.width = label.width();
  }

  var iterator = this.chart.getIterator();
  iterator.select(label.getIndex());
  label.formatProvider(this.chart.createFormatProvider());
  var labelBounds = this.chart.labels_.measureWithTransform(label.formatProvider(), label.positionProvider(), /** @type {Object|null|undefined} */(labelSettings));

  // restore width in data
  labelSettings.width = savedWidth;

  return anychart.math.Rect.fromCoordinateBox(labelBounds);
};