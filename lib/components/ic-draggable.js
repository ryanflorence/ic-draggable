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

  touchStart: function(event) {
    this.set('touchstarted', true);
    return this.startDrag(event);
  },

  mouseDown: function() {
    if (this.get('touchstarted')) { return; }
    return this.startDrag(event);
  },

  startDrag: function(jqEvent) {
    var event = jqEvent.originalEvent;
    // missed mouseup (out of window)
    if (this.get('dragging')) { this.docMouseUp(); }
    var rect = this.get('element').getBoundingClientRect();
    var marginLeft = parseInt(this.$().css('margin-left'), 10);
    var marginTop = parseInt(this.$().css('margin-top'), 10);
    var x = event.touches ? event.touches[0].clientX : event.clientX;
    var y = event.touches ? event.touches[0].clientY : event.clientY;
    this.set('dragging', true);
    this.set('initialMousePositions', {x: x, y: y});
    this.set('initialElementPositions', {
      left: rect.left - marginLeft,
      top: rect.top - marginTop
    });
    var doc = $(document);
    var moveEvent = event.touches ? 'touchmove' : 'mousemove';
    var upEvent = event.touches ? 'touchend' : 'mouseup';
    doc.on(moveEvent+'.ic-draggable', this.docMouseMove.bind(this));
    doc.on(upEvent+'.ic-draggable', this.docMouseUp.bind(this));
    return false;
  },

  docMouseMove: function(jqEvent) {
    var event = jqEvent.originalEvent;
    var initialElementPositions = this.get('initialElementPositions');
    var initialMousePositions = this.get('initialMousePositions');
    var x = event.touches ? event.touches[0].clientX : event.clientX;
    var y = event.touches ? event.touches[0].clientY : event.clientY;
    var dx = x - initialMousePositions.x;
		var dy = y - initialMousePositions.y;
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
    this.set('touchstarted', false);
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

