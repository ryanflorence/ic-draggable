import Ember from 'ember';

var IcDraggable = Ember.Component.extend({

  horizontal: true,

  vertical: true,

  revert: true,

  snap: 0,

  left: 0,

  right: 0,

  classNames: ['ic-draggable'],

  classNameBindings: ['dragging:ic-dragging'],

  dragging: false,

  snapped: false,

  setDefaultStyles: function() {
    var zIndex = this.$().css('z-index');
    this.$().css({
      position: 'absolute',
      'z-index': zIndex == 'auto' ? 0 : zIndex
    });
  }.on('didInsertElement'),

  disableSelect: function() {
    this.$().on('selectstart', function(event) { return false; });
  }.on('didInsertElement'),

  mouseDown: function(event) {
    // missed mouseup (out of window)
    if (this.get('dragging')) { this.docMouseUp(); }
    var rect = this.get('element').getBoundingClientRect();
    var marginLeft = parseInt(this.$().css('margin-left'), 10);
    var marginTop = parseInt(this.$().css('margin-top'), 10);
    this.set('dragging', true);
    this.set('initialMousePositions', {
      x: event.clientX,
      y: event.clientY
    });
    this.set('initialElementPositions', {
      left: rect.left - marginLeft,
      top: rect.top - marginTop
    });
    var doc = $(document);
    doc.on('mousemove.ic-draggable', this.docMouseMove.bind(this));
    doc.on('mouseup.ic-draggable', this.docMouseUp.bind(this));
    return false; // cursor
  },

  docMouseMove: function(event) {
    var initialElementPositions = this.get('initialElementPositions');
    var initialMousePositions = this.get('initialMousePositions');
    var dx = event.clientX - initialMousePositions.x;
		var dy = event.clientY - initialMousePositions.y;
    var element = this.get('element');
    if (!this.snapMet(dx, dy)) {
      return;
    } else {
      this.set('snapped', true);
    }
    if (this.get('horizontal')) {
      this.set('left', initialElementPositions.left + dx);
    }
    if (this.get('vertical')) {
      this.set('top', initialElementPositions.top + dy);
    }
  },

  docMouseUp: function() {
    Ember.$(document).off('.ic-draggable');
    this.set('dragging', false);
    this.set('snapped', false);
  },

  revertPosition: function() {
    if (!this.get('revert') || this.get('dragging')) { return; }
    var initialElementPositions = this.get('initialElementPositions');
    this.$().animate({
      left: initialElementPositions.left,
      top: initialElementPositions.top
    }, 150, function() {
      this.set('left', initialElementPositions.left);
      this.set('top', initialElementPositions.top);
    }.bind(this));
  }.observes('dragging'),

  setPosition: function() {
    var element = this.get('element');
    element.style.left = this.get('left') + 'px';
    element.style.top = this.get('top') + 'px';
  }.observes('left', 'top').on('didInsertElement'),

  setZindex: function() {
    var dragging = this.get('dragging');
    var currentIndex = this.$().css('z-index');
    var newIndex = dragging ? currentIndex + 1 : currentIndex - 1;
    this.$().css('z-index', newIndex);
  }.observes('dragging'),

  snapMet: function(dx, dy) {
    var snap = this.get('snap');
    if (!this.get('snapped') && Math.abs(dx) < snap && Math.abs(dy) < snap) {
      return false;
    } else {
      return true;
    }
  }

});

export default IcDraggable;

