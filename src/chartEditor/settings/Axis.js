goog.provide('anychart.chartEditorModule.settings.Axis');

goog.require('anychart.chartEditorModule.IconButtonRenderer');
goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Title');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {string} xOrY
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.Axis = function(model, xOrY, index, opt_domHelper) {
  anychart.chartEditorModule.settings.Axis.base(this, 'constructor', model, opt_domHelper);
  this.xOrY = xOrY;
  this.index_ = index;
  this.name = this.xOrY + 'Axis(' + this.index_ + ')';
  this.key = [['chart'], ['settings'], this.xOrY + 'Axis(' + this.index_ + ')'];

  this.axisExists = false;
};
goog.inherits(anychart.chartEditorModule.settings.Axis, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.Axis.CSS_CLASS = goog.getCssName('anychart-settings-panel-axis-single');


/** @return {number} */
anychart.chartEditorModule.settings.Axis.prototype.getIndex = function() {
 return this.index_;
};


/** @override */
anychart.chartEditorModule.settings.Axis.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Axis.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.Axis.CSS_CLASS);
  goog.dom.classlist.add(element, this.index_ % 2 ? 'even' : 'odd');

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var wrapper = new anychart.chartEditorModule.SettingsPanel(model);
  wrapper.setName(null);
  wrapper.addClassName('anychart-settings-panel');
  wrapper.addClassName('anychart-settings-panel-wrapper');
  this.addChild(wrapper, true);

  var invertedCheckbox = new anychart.chartEditorModule.checkbox.Base();
  invertedCheckbox.setCaption('Inverted');
  wrapper.addChild(invertedCheckbox, true);
  this.inverted_ = invertedCheckbox;

  var orientation = new anychart.chartEditorModule.controls.select.DataField({label: 'Orientation'});
  orientation.getSelect().setOptions([
    {value: 'left', icon: 'ac ac-position-left'},
    {value: 'right', icon: 'ac ac-position-right'},
    {value: 'top', icon: 'ac ac-position-top'},
    {value: 'bottom', icon: 'ac ac-position-bottom'}
  ]);
  wrapper.addChild(orientation, true);
  this.orientation_ = orientation;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  var title = new anychart.chartEditorModule.settings.Title(model, 'Title');
  title.allowEditPosition(false, this.xOrY == 'x' ? 'bottom' : 'left');
  title.setKey(this.genKey('title()')); // This is for enabled working sake!
  this.addChild(title, true);
  this.title_ = title;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  //region Labels
  var labels = new anychart.chartEditorModule.settings.Title(model, 'Labels');
  labels.allowEditPosition(false, '');
  labels.allowEditAlign(false);
  labels.setTitleKey('format()');
  labels.setKey(this.genKey('labels()'));
  this.addChild(labels, true);

  this.labels_ = labels;
  //endregion
};



/** @inheritDoc */
anychart.chartEditorModule.settings.Axis.prototype.updateKeys = function() {
  anychart.chartEditorModule.settings.Axis.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  if (this.orientation_) this.orientation_.init(model, this.genKey('orientation()'));
  if (this.inverted_) this.inverted_.init(model, [['chart'], ['settings'], this.xOrY + 'Scale().inverted()']);
  if (this.title_) this.title_.setKey(this.genKey('title()'));
  if (this.labels_) this.labels_.setKey(this.genKey('labels()'));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Axis.prototype.onChartDraw = function(evt) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  this.getHandler().listenOnce(model, anychart.chartEditorModule.events.EventType.CHART_DRAW, this.onChartDraw);
  if (this.isExcluded()) return;

  var chart = evt.chart;
  if (!this.axisExists) {
    this.axisExists = (this.xOrY == 'x' ? chart.getXAxesCount() : chart.getYAxesCount()) > this.index_;
    this.title_.exclude(!this.axisExists);
    this.labels_.exclude(!this.axisExists);
  }

  if (evt.rebuild && this.axisExists) {
    this.enableContentCheckbox.setValueByTarget(chart);
    this.setContentEnabled(this.enableContentCheckbox.isChecked());

    this.orientation_.getSelect().setValueByTarget(chart);
    this.inverted_.setValueByTarget(chart);
  } else {
    this.setContentEnabled(false);
  }
};


/** @override */
anychart.chartEditorModule.settings.Axis.prototype.disposeInternal = function() {
  this.orientation_ = null;
  this.inverted_ = null;

  goog.dispose(this.title_);
  this.title_ = null;
  goog.dispose(this.labels_);
  this.labels_ = null;

  anychart.chartEditorModule.settings.Axis.base(this, 'disposeInternal');
};