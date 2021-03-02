import Utils from 'my-utils';

class XY {
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }
}

class Img extends Array {
  constructor (data) {
    super();
    data = data ?? [];
    for (let i = 0; i < data.length; i++) {
      this[i] = data[i];
    }
  }
}

Object.defineProperties(Img.prototype, {
  pixels: {
    enumerable: false,
    value: function * () {
      for (let i = 0; i < this.length; i += this.channels) {
        const pixel = [this[i], this[i + 1], this[i + 2], this[i + 3]];
        yield pixel;
      }
    }
  },
  greyscale: {
    enumerable: false,
    get () {
      return Utils.General.mapGenerator(this.pixels(), ([r, g, b]) => Math.round((r + b + g) / 3));
    }
  },
  _channels: {
    enumerable: false,
    value: 4,
    writable: true
  },
  channels: {
    enumerable: false,
    configurable: true,
    get () { return this._channels; },
    set (newValue) { this._channels = newValue; }
  },
  _size: {
    enumerable: false,
    value: null,
    writable: true
  },
  size: {
    enumerable: false,
    configurable: true,
    get () { return this._size; },
    set (newValue) { this._size = newValue; }
  },
  pixelAtXY: {
    enumerable: false,
    value: function (x, y) {
      const index = this.size.x * y * this.channels + x * this.channels;
      return this.slice(index, index + this.channels);
    }
  }
});

export { XY, Img };
