function WxCanvas(ctx, canvasId, isNew, canvasNode) {
  this.ctx = ctx;
  this.canvasId = canvasId;
  this.isNew = isNew;
  if (isNew) {
    this.canvas = canvasNode;
  }
  else {
    this._initStyle(ctx);
  }

  // this._initCanvas(zrender, ctx);

  this._initEvent();
}

WxCanvas.prototype.getContext = function (contextType) {
  if (contextType === '2d') {
    return this.ctx;
  }
};

// canvasToTempFilePath(opt) {
//   if (!opt.canvasId) {
//     opt.canvasId = this.canvasId;
//   }
//   return wx.canvasToTempFilePath(opt, this);
// }

WxCanvas.prototype.setChart = function (chart) {
  this.chart = chart;
};

WxCanvas.prototype.addEventListener = function () {
  // noop
};

WxCanvas.prototype.__getEvents = function () {
  return this.canvas.__getEvents ? this.canvas.__getEvents() : [];
};

WxCanvas.prototype.attachEvent = function () {
  // noop
};

WxCanvas.prototype.detachEvent = function () {
  // noop
};

WxCanvas.prototype.dispatchEvent = function () {
  // noop
};

WxCanvas.prototype.getBoundingClientRect = function () {
  return {
    top: 0,
    left: 0,
    width: 300,
    height: 150
  };
};

WxCanvas.prototype.toDataURL = function () {
  // not supported
};

WxCanvas.prototype._initCanvas = function (zrender, ctx) {
  zrender.util.getContext = function () {
    return ctx;
  };

  zrender.util.$override('measureText', function (text, font) {
    ctx.font = font || '12px sans-serif';
    return ctx.measureText(text);
  });
};

WxCanvas.prototype._initStyle = function (ctx) {
  ctx.createRadialGradient = () => {
    return ctx.createCircularGradient(arguments);
  };
};

WxCanvas.prototype._initEvent = function () {
  this.event = {};
  const eventNames = [{
    wxName: 'touchStart',
    ecName: 'mousedown'
  }, {
    wxName: 'touchMove',
    ecName: 'mousemove'
  }, {
    wxName: 'touchEnd',
    ecName: 'mouseup'
  }, {
    wxName: 'touchEnd',
    ecName: 'click'
  }];
  eventNames.forEach(name => {
    this.event[name.wxName] = e => {
      const touch = e.touches[0];
      this.chart.getZr().handler.dispatch(name.ecName, {
        zrX: name.wxName === 'tap' ? touch.clientX : touch.x,
        zrY: name.wxName === 'tap' ? touch.clientY : touch.y,
        preventDefault: () => {},
        stopImmediatePropagation: () => {},
        stopPropagation: () => {}
      });
    };
  });
};

WxCanvas.prototype.setWidth = function(w) {
  if (this.canvas) this.canvas.width = w;
};
WxCanvas.prototype.setHeight = function(h) {
  if (this.canvas) this.canvas.height = h;
};

WxCanvas.prototype.getWidth = function() {
  if (this.canvas) return this.canvas.width;
  return 0;
};
WxCanvas.prototype.getHeight = function() {
  if (this.canvas) return this.canvas.height;
  return 0;
};

module.exports = WxCanvas;
