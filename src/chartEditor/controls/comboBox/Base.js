goog.provide('anychart.chartEditorModule.comboBox.Base');
goog.provide('anychart.chartEditorModule.comboBox.ComboBoxItem');

goog.require('anychart.chartEditorModule.controls.Menu');
goog.require('anychart.chartEditorModule.controls.MenuRenderer');
goog.require('anychart.chartEditorModule.controls.select.DataFieldSelectMenuItemRenderer');
goog.require('anychart.chartEditorModule.events');
goog.require('goog.string');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');

goog.forwardDeclare('goog.events.BrowserEvent');



/**
 * A ComboBox control.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.Menu=} opt_menu Optional menu component.
 *     This menu is disposed of by this control.
 * @param {goog.ui.LabelInput=} opt_labelInput Optional label input.
 *     This label input is disposed of by this control.
 * @constructor
 * @extends {goog.ui.ComboBox}
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base = function(opt_domHelper, opt_menu, opt_labelInput) {
  anychart.chartEditorModule.comboBox.Base.base(this, 'constructor',
      opt_domHelper,
      opt_menu || new anychart.chartEditorModule.controls.Menu('', this.getDomHelper()),
      opt_labelInput);

  // If no value is set.
  this.lastToken_ = '';

  this.options_ = [];
  this.captions_ = [];

  /**
   * Editor Model key.
   *
   * @type {anychart.chartEditorModule.EditorModel.Key}
   * @protected
   */
  this.key = [];

  // For fontSize
  this.setUseTypeahead(false);
  this.setValidateFunction(function(value) {
    var numberValue = +value;
    // not a number
    return !(goog.isNull(numberValue) || goog.isBoolean(numberValue) || isNaN(numberValue));
  });

  /**
   * @type {number}
   * @private
   */
  this.minimum_ = 6;

  /**
   * @type {number}
   * @private
   */
  this.maximum_ = 40;

  var self = this;
  this.setFormatterFunction(function(value) {
    return String(goog.math.clamp(Number(value), self.minimum_, self.maximum_));
  });

  /**
   * @type {boolean}
   * @protected
   */
  this.noDispatch = false;
};
goog.inherits(anychart.chartEditorModule.comboBox.Base, goog.ui.ComboBox);


/**
 * False to don't set item visibility from token. Defaults to true.
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.comboBox.Base.prototype.useTypeahead_ = true;


/**
 * @param {number} minimum
 * @param {number} maximum
 */
anychart.chartEditorModule.comboBox.Base.prototype.setRange = function(minimum, maximum) {
  this.minimum_ = minimum;
  this.maximum_ = maximum;
};


/**
 * The validate function to be used for set value.
 * @param {string} value The value to check.
 * @return {boolean}
 * @private
 */
anychart.chartEditorModule.comboBox.Base.prototype.validateFunction_ = function(value) {
  return true;
};


/**
 * Formatter for set value.
 * @param {string} value
 * @return {string}
 * @private
 */
anychart.chartEditorModule.comboBox.Base.prototype.formatterFunction_ = function(value) {
  return value;
};


/**
 * @type {Array.<string>}
 * @private
 */
anychart.chartEditorModule.comboBox.Base.prototype.options_;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.chartEditorModule.comboBox.Base.prototype.captions_;


/** @param {Array.<string>} value */
anychart.chartEditorModule.comboBox.Base.prototype.setOptions = function(value) {
  this.options_ = value;
};


/** @return {anychart.chartEditorModule.EditorModel.Key} */
anychart.chartEditorModule.comboBox.Base.prototype.getKey = function() {
  return this.key;
};


/** @param {anychart.chartEditorModule.EditorModel.Key} value */
anychart.chartEditorModule.comboBox.Base.prototype.setKey = function(value) {
  this.key = value;
};


/**
 * False to don't set item visibility from token.
 * This option defaults to true for backwards compatibility.
 * @param {boolean} useTypeahead False to don't use the typeahead.
 */
anychart.chartEditorModule.comboBox.Base.prototype.setUseTypeahead = function(useTypeahead) {
  this.useTypeahead_ = !!useTypeahead;
  if (!this.useTypeahead_) {
    this.setMatchFunction(goog.string.caseInsensitiveEquals);
  }
};


/**
 * @return {?goog.ui.Control} The currently selected item or null.
 */
anychart.chartEditorModule.comboBox.Base.prototype.getSelectedItem = function() {
  return this.getMenu().getHighlighted();
};


/**
 * @override
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base.prototype.createDom = function() {
  // This hack for render menu into the body instead into the same parent as this button.
  var menu = this.getMenu();
  menu.render();
  menu.setParent(this);

  anychart.chartEditorModule.comboBox.Base.base(this, 'createDom');

  var element = this.getElement();
  var button = this.getElementByClass(goog.getCssName('anychart-combobox-button'));
  if (this.useDropdownArrow_) {
    // Don't use UTF-8. We use css.
    button.innerHTML = '&nbsp';
  }

  goog.dom.classlist.add(element, goog.ui.INLINE_BLOCK_CLASSNAME);

  this.updateOptions();
};


/**
 * @suppress {checkTypes} set option to ComboBoxItem
 */
anychart.chartEditorModule.comboBox.Base.prototype.updateOptions = function() {
  var optionsCount = this.options_.length;
  var count = Math.max(this.getChildCount(), optionsCount);

  for (var i = 0; i < count; i++) {
    var optionItem = this.getItemAt(i);

    if (i < optionsCount) {
      var option = this.options_[i];
      var caption = this.captions_[i] || option.toString();

      if (!optionItem) {
        optionItem = new anychart.chartEditorModule.comboBox.ComboBoxItem(caption, option);
        this.addItemAt(optionItem, i);
      } else {
        optionItem.setContent(caption);
        optionItem.setModel(option);
        optionItem.setVisible(true);
      }
    } else {
      optionItem.setVisible(false);
    }
  }
};


/** @override */
anychart.chartEditorModule.comboBox.Base.prototype.enterDocument = function() {
  anychart.chartEditorModule.comboBox.Base.base(this, 'enterDocument');

  goog.events.listen(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
};


/** @override */
anychart.chartEditorModule.comboBox.Base.prototype.exitDocument = function() {
  goog.events.unlisten(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);

  anychart.chartEditorModule.comboBox.Base.base(this, 'exitDocument');
};


/**
 * Dismisses the menu and resets the value of the edit field.
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base.prototype.dismiss = function() {
  anychart.chartEditorModule.comboBox.Base.base(this, 'dismiss');

  this.input_.blur();
};


/**
 * Set validate function.
 * @param {function(string):boolean} validateFunction
 */
anychart.chartEditorModule.comboBox.Base.prototype.setValidateFunction = function(validateFunction) {
  this.validateFunction_ = validateFunction;
};


/**
 * @return {function(string):boolean} The validate function.
 */
anychart.chartEditorModule.comboBox.Base.prototype.getValidateFunction = function() {
  return this.validateFunction_;
};


/**
 * Set formatter function.
 * @param {function(string):string} formatterFunction
 */
anychart.chartEditorModule.comboBox.Base.prototype.setFormatterFunction = function(formatterFunction) {
  this.formatterFunction_ = formatterFunction;
};


/**
 * @return {function(string):string} The formatter function.
 */
anychart.chartEditorModule.comboBox.Base.prototype.getFormatterFunction = function() {
  return this.formatterFunction_;
};


/**
 * Sets the current value of the combo box.
 * @param {string} value The new value.
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base.prototype.setValue = function(value) {
  if (this.lastToken_ !== value && this.validateFunction_(value)) {
    value = this.formatterFunction_(value);
    this.lastToken_ = value;
    this.labelInput_.setValue(value);
    this.handleInputChange_();
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
  }
};


/**
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base.prototype.onInputBlur_ = function(e) {
  anychart.chartEditorModule.comboBox.Base.base(this, 'onInputBlur_', e);

  this.labelInput_.setValue(/** @type {string} */(this.lastToken_));
};


/**
 * Handles keyboard events from the input box.  Returns true if the combo box
 * was able to handle the event, false otherwise.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the combo box.
 * @protected
 * @suppress {visibility|accessControls}
 */
anychart.chartEditorModule.comboBox.Base.prototype.handleKeyEvent = function(e) {
  var isMenuVisible = this.menu_.isVisible();
  var token;

  // anychart fix
  if (e.keyCode == goog.events.KeyCodes.ENTER) {
    token = this.getTokenText_();
    if (this.validateFunction_(token)) {
      this.dismiss();
      this.setValue(token);
      return true;
    } else {
      return false;
    }
  }
  // anychart fix end

  // The menu is either hidden or didn't handle the event.
  var handled = false;

  // Give the menu a chance to handle the event.
  if (isMenuVisible && this.menu_.handleKeyEvent(e)) {
    // anychart fix
    switch (e.keyCode) {
      case goog.events.KeyCodes.UP:
      case goog.events.KeyCodes.DOWN:
        // Set caption
        this.labelInput_.setValue(/** @type {string} */(this.menu_.getHighlighted().getModel()));
        this.input_.select();
        handled = true;
        break;
    }
    // anychart fix end
    return true;
  }

  switch (e.keyCode) {
    case goog.events.KeyCodes.ESC:
      this.labelInput_.setValue(/** @type {string} */(this.lastToken_));
      // If the menu is visible and the user hit Esc, dismiss the menu.
      if (isMenuVisible) {
        goog.log.fine(this.logger_,
            'Dismiss on Esc: ' + this.labelInput_.getValue());
        this.dismiss();
        handled = true;
        // anychart fix
        e.stopPropagation();
        // anychart fix end
      }
      break;
    case goog.events.KeyCodes.TAB:
      // If the menu is open and an option is highlighted, activate it.
      if (isMenuVisible) {
        var highlighted = this.menu_.getHighlighted();
        if (highlighted) {
          goog.log.fine(this.logger_,
              'Select on Tab: ' + this.labelInput_.getValue());
          highlighted.performActionInternal(e);
          handled = true;
        }
      }
      break;
    case goog.events.KeyCodes.UP:
    case goog.events.KeyCodes.DOWN:
      // If the menu is hidden and the user hit the up/down arrow, show it.
      if (!isMenuVisible) {
        goog.log.fine(this.logger_, 'Up/Down - maybe show menu');
        this.maybeShowMenu_(true);
        handled = true;
      }
      break;
  }

  if (handled) {
    e.preventDefault();
  }

  return handled;
};


/**
 * @param {string} token The token.
 * @private
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base.prototype.setItemVisibilityFromToken_ = function(token) {
  goog.log.info(this.logger_, 'setItemVisibilityFromToken_() - ' + token);
  var isVisibleItem = false;
  var count = 0;
  var recheckHidden = !this.matchFunction_(token, /** @type {string} */(this.lastToken_));

  for (var i = 0, n = this.menu_.getChildCount(); i < n; i++) {
    var item = this.menu_.getChildAt(i);
    if (item instanceof goog.ui.MenuSeparator) {
      // Ensure that separators are only shown if there is at least one visible
      // item before them.
      item.setVisible(isVisibleItem);
      isVisibleItem = false;
    } else if (item instanceof goog.ui.MenuItem) {
      if (!item.isVisible() && !recheckHidden) continue;

      var caption = item.getCaption();
      var visible = !this.useTypeahead_ || // anychart fixed
          this.isItemSticky_(item) ||
          caption && this.matchFunction_(caption.toLowerCase(), token);
      if (this.useTypeahead_ && // anychart fixed
          typeof item.setFormatFromToken == 'function') {
        item.setFormatFromToken(token);
      }
      item.setVisible(!!visible);
      isVisibleItem = visible || isVisibleItem;

    } else {
      // Assume all other items are correctly using their visibility.
      isVisibleItem = item.isVisible() || isVisibleItem;
    }

    if (!(item instanceof goog.ui.MenuSeparator) && item.isVisible()) {
      count++;
    }
  }

  this.visibleCount_ = count;
};


/**
 * @private
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base.prototype.handleInputChange_ = function() {
  var token = this.getTokenText_();
  // anychart fixed
  if (this.useTypeahead_) {
    this.setItemVisibilityFromToken_(token);
  }

  if (goog.dom.getActiveElement(this.getDomHelper().getDocument()) ==
      this.input_) {
    // Do not alter menu visibility unless the user focus is currently on the
    // combobox (otherwise programmatic changes may cause the menu to become
    // visible).
    this.maybeShowMenu_(false);
  }
  var highlighted = this.menu_.getHighlighted();
  if (this.useTypeahead_ && // anychart fixed
      (token == '' || !highlighted || !highlighted.isVisible())) {
    this.setItemHighlightFromToken_(token);
  }
  // anychart fixed
  //this.lastToken_ = token;
  //this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
};


/**
 * @param {string} token The token.
 * @private
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Base.prototype.setItemHighlightFromToken_ = function(token) {
  goog.log.info(this.logger_, 'setItemHighlightFromToken_() - ' + token);

  if (token == '') {
    this.menu_.setHighlightedIndex(-1);
    return;
  }

  for (var i = 0, n = this.menu_.getChildCount(); i < n; i++) {
    var item = this.menu_.getChildAt(i);
    var caption = item.getCaption();
    if (caption && this.matchFunction_(caption.toLowerCase(), token)) {
      this.menu_.setHighlightedIndex(i);
      if (this.useTypeahead_ && item.setFormatFromToken) { // anychart fixed
        item.setFormatFromToken(token);
      }
      return;
    }
  }
  this.menu_.setHighlightedIndex(-1);
};


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.chartEditorModule.comboBox.Base.prototype.onChange = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  if (!this.noDispatch && this.editorModel) {
    var value = this.getToken();

    if (this.callback)
      this.editorModel.callbackByString(this.callback, this);
    else
      this.editorModel.setValue(this.key, value, false, this.noRebuild);
  }
};


/**
 * Connects control with EditorMode.
 *
 * @param {anychart.chartEditorModule.EditorModel} model Editor model instance to connect with.
 * @param {anychart.chartEditorModule.EditorModel.Key} key Key of control's field in model's structure.
 * @param {string=} opt_callback Callback function that will be called on control's value change instead of simple change value in model.
 *  This function should be model's public method.
 * @param {boolean=} opt_noRebuild Should or not rebuild chart on change value of this control.
 */
anychart.chartEditorModule.comboBox.Base.prototype.init = function(model, key, opt_callback, opt_noRebuild) {
  /**
   * @type {anychart.chartEditorModule.EditorModel}
   * @protected
   */
  this.editorModel = model;

  this.key = key;

  this.callback = opt_callback;

  this.noRebuild = !!opt_noRebuild;
};


/**
 * Sets value of this control to target's value.
 * Updates model state.
 * @param {?Object} target Object, who's property corresponds to control's key. Used to get value of this control.
 */
anychart.chartEditorModule.comboBox.Base.prototype.setValueByTarget = function(target) {
  this.target = target;

  var stringKey = anychart.chartEditorModule.EditorModel.getStringKey(this.key);
  var value = /** @type {string} */(anychart.bindingModule.exec(this.target, stringKey));
  this.noDispatch = true;
  this.setValue(value);
  this.noDispatch = false;
};


/**
 * Class for combo box items.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {*=} opt_data Identifying data for the menu item.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional dom helper used for dom
 *     interactions.
 * @param {goog.ui.MenuItemRenderer=} opt_renderer Optional renderer.
 * @constructor
 * @extends {goog.ui.ComboBoxItem}
 */
anychart.chartEditorModule.comboBox.ComboBoxItem = function(content, opt_data, opt_domHelper, opt_renderer) {
  goog.ui.ComboBoxItem.call(
      this,
      content,
      opt_data,
      opt_domHelper,
      opt_renderer || anychart.chartEditorModule.controls.select.DataFieldSelectMenuItemRenderer.getInstance()
  );
};
goog.inherits(anychart.chartEditorModule.comboBox.ComboBoxItem, goog.ui.ComboBoxItem);
