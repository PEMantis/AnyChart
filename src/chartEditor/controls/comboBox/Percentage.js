goog.provide('anychart.chartEditorModule.comboBox.Percent');

goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('goog.ui.ComboBox');


/**
 * A ComboBox control.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.Menu=} opt_menu Optional menu component.
 *     This menu is disposed of by this control.
 * @param {goog.ui.LabelInput=} opt_labelInput Optional label input.
 *     This label input is disposed of by this control.
 * @constructor
 * @extends {anychart.chartEditorModule.comboBox.Base}
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Percent = function(opt_domHelper, opt_menu, opt_labelInput) {
  anychart.chartEditorModule.comboBox.Percent.base(this, 'constructor', opt_domHelper, opt_menu, opt_labelInput);

  this.setValidateFunction(function(value) {
    return /^\d{1,3}%?$/.test(value);
  });

  this.setFormatterFunction(function(value) {
    var match = String(value).match(/^(\d{1,3})%?$/);
    return String(goog.math.clamp(Number(match[1]), 0, 100)) + "%";
  });

  this.setOptions([10, 30, 50, 70, 90]);
};
goog.inherits(anychart.chartEditorModule.comboBox.Percent, anychart.chartEditorModule.comboBox.Base);


/** @inheritDoc */
anychart.chartEditorModule.comboBox.Percent.prototype.setOptions = function(value) {
  anychart.chartEditorModule.comboBox.Percent.base(this, 'setOptions', value);
  var self = this;
  self.captions.length = 0;
  goog.array.forEach(self.options, function(item){
    self.captions.push(item + '%');
  });
};