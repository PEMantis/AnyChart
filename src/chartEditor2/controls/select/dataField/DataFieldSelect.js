goog.provide('anychart.chartEditor2.controls.select.DataFieldMenu');
goog.provide('anychart.chartEditor2.controls.select.DataFieldMenuRenderer');
goog.provide('anychart.chartEditor2.controls.select.DataFieldSelect');
goog.provide('anychart.chartEditor2.controls.select.DataFieldSelectRenderer');

goog.require('anychart.chartEditor2Module.controls.select.Base');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuRenderer');



/**
 * @param {anychart.chartEditor2.controls.select.DataFieldModel=} opt_model
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @param {string=} opt_menuAdditionalClass
 * @constructor
 * @extends {anychart.chartEditor2Module.controls.select.Base}
 */
anychart.chartEditor2.controls.select.DataFieldSelect = function (opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {

    /**
     * @type {goog.ui.MenuRenderer}
     * @private
     */
    this.cMenuRenderer_ = opt_menuRenderer || anychart.chartEditor2.controls.select.DataFieldMenuRenderer.getInstance();

    /**
     * @type {?goog.ui.Menu}
     * @private
     */
    this.cMenu_ = goog.isDef(opt_menu) ? opt_menu : null;

    /**
     * @type {string}
     */
    this.menuAdditionalClass = opt_menuAdditionalClass || '';

    anychart.chartEditor2.controls.select.DataFieldSelect.base(
        this,
        'constructor',
        opt_model && opt_model.caption ? opt_model.caption : '',
        opt_menu,
        opt_renderer || anychart.chartEditor2.controls.select.DataFieldSelectRenderer.getInstance(),
        opt_domHelper,
        this.cMenuRenderer_
    );

    this.setModel(opt_model);
    this.addClassName('anychart-border-box');
};
goog.inherits(anychart.chartEditor2.controls.select.DataFieldSelect, anychart.chartEditor2Module.controls.select.Base);


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldSelect.prototype.handleMenuAction = function (e) {
    var item = /** @type {goog.ui.MenuItem} */ (e.target);
    if (item instanceof  anychart.chartEditor2.controls.select.DataFieldSelectMenuCaption) {
        e.preventDefault();
        e.stopPropagation();
    } else {
        anychart.chartEditor2.controls.select.DataFieldSelect.base(this, 'handleMenuAction', e);
    }

};


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldSelect.prototype.getMenu = function() {
    if (!this.cMenu_) {
        this.cMenu_ = new anychart.chartEditor2.controls.select.DataFieldMenu(
            this.menuAdditionalClass,
            this.getDomHelper(),
            this.cMenuRenderer_
        );
        this.setMenu(this.cMenu_);
    }
    return this.cMenu_ || null;
};


// region ---- DataFieldSelectRenderer
/**
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
anychart.chartEditor2.controls.select.DataFieldSelectRenderer = function () {
    goog.ui.ButtonRenderer.call(this);
};
goog.inherits(anychart.chartEditor2.controls.select.DataFieldSelectRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(anychart.chartEditor2.controls.select.DataFieldSelectRenderer);


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldSelectRenderer.prototype.createDom = function (control) {
    return control.getDomHelper().createDom(goog.dom.TagName.DIV, this.getClassNames(control).join(' '), [
        control.getDomHelper().createDom(goog.dom.TagName.DIV, 'anychart-select-data-field-select-content', control.getContent()),
        control.getDomHelper().createDom(goog.dom.TagName.DIV, 'anychart-select-data-field-select-indicator')
    ]);
};


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldSelectRenderer.prototype.getContentElement = function (element) {
    if (element) {
        return goog.dom.getElementByClass('anychart-select-data-field-select-content', element);
    }
    return null;
};


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldSelectRenderer.prototype.getCssClass = function () {
    return 'anychart-select-data-field-select';
};
// endregion


// region ---- DataFieldMenu
/**
 * @param {string=} opt_additionalClassName
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {goog.ui.MenuRenderer=} opt_renderer
 * @constructor
 * @extends {goog.ui.Menu}
 */
anychart.chartEditor2.controls.select.DataFieldMenu = function (opt_additionalClassName, opt_domHelper, opt_renderer) {
    anychart.chartEditor2.controls.select.DataFieldMenu.base(this, 'constructor', opt_domHelper, opt_renderer);
    //goog.ui.MenuRenderer.call(this, opt_domHelper, opt_renderer);

    /**
     * @type {string}
     */
    this.additionalClassName = opt_additionalClassName || '';
};
goog.inherits(anychart.chartEditor2.controls.select.DataFieldMenu, goog.ui.Menu);
// endregion


// region ---- DataFieldMenuRenderer
/**
 * @constructor
 * @extends {goog.ui.MenuRenderer}
 */
anychart.chartEditor2.controls.select.DataFieldMenuRenderer = function () {
    anychart.chartEditor2.controls.select.DataFieldMenuRenderer.base(this, 'constructor');
};
goog.inherits(anychart.chartEditor2.controls.select.DataFieldMenuRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(anychart.chartEditor2.controls.select.DataFieldMenuRenderer);


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldMenuRenderer.prototype.createDom = function(container) {
    container = /** @type {anychart.chartEditor2.controls.select.DataFieldMenu} */(container);
    var element = anychart.chartEditor2.controls.select.DataFieldMenuRenderer.base(this, 'createDom', container);
    if (container.additionalClassName) goog.dom.classlist.add(element, container.additionalClassName);
    goog.dom.classlist.add(element, 'anychart-border-box');
    return element;
};


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldMenuRenderer.prototype.getCssClass = function () {
    return 'anychart-select-data-field-menu';
};
// endregion