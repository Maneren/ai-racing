import { Img, XY } from './Other';

class Track {
  constructor (img, p5) {
    this.startPos = p5.createVector(600, 640);
    this.startRot = 0;

    this.img = img;
    this.greyImg = this.loadImg(img, p5);
    this.trackColor = 0;
  }

  /**
   * @param {p5Types} p5
   */
  loadImg (img, p5) {
    const { width, height } = img;
    const g = p5.createGraphics(width, height);
    g.image(img, 0, 0, width, height);
    g.loadPixels();

    const pixels = g.pixels;

    const imgData = new Img(pixels);
    imgData.size = new XY(width, height);
    const greyPixels = [];
    for (const pix of imgData.greyscale) {
      greyPixels.push(pix);
    }
    const greyImg = new Img(greyPixels);
    greyImg.channels = 1;
    greyImg.size = imgData.size;

    return greyImg;
  }

  get size () {
    return this.img.size;
  }

  isTrackAt (x, y) {
    return this.greyImg.pixelAtXY(x, y)[0] === this.trackColor;
  }

  /**
   * @param {p5Types} p5
   */
  draw (p5) {
    p5.push();
    p5.imageMode(p5.CORNER);
    p5.image(this.img, 0, 0, this.img.width, this.img.height);
    p5.pop();
  }
}

export default Track;
