import NN from 'deepneuralnet';
import p5Types from 'p5';

class Car {
  constructor (img, pos, rot, brain = new NN([6, 64, 64, 64, 64, 2])) {
    this.img = img;

    this.pos = pos.copy();
    this.rot = rot;

    this.brain = brain;
    this.score = 0;

    this.alive = true;

    this.speed = 2;
    this.steering = 0;
    this.accelerationPower = 0.2;
    this.brakingPower = 1;
    this.topSpeed = 6;
  }

  /**
   * @param {p5Types} p5
   */
  init (p5) {
    const rad = p5.radians;
    this.sensors = [
      new Car.Sensor(rad(90), 30),
      new Car.Sensor(rad(30), 90),
      new Car.Sensor(rad(0), 200),
      new Car.Sensor(rad(-30), 90),
      new Car.Sensor(rad(-90), 30)
    ];
    this.p5 = p5;
  }

  /**
   * @param {p5Types} p5
   */
  draw (p5) {
    const { img, pos, rot } = this;
    p5.push();

    p5.translate(pos.x, pos.y);
    p5.rotate(rot);

    p5.imageMode(p5.CENTER);
    p5.image(img, 0, 0, img.width, img.height);

    // this.drawSensors(p5);

    p5.pop();
  }

  /**
   * @param {p5Types} p5
   */
  drawSensors (p5) {
    p5.push();
    p5.stroke(0, 0, 255);
    p5.strokeWeight(2);
    for (const sensor of this.sensors) {
      sensor.draw(p5);
    }
    p5.pop();
  }

  /**
   * @param {p5Types} p5
   */
  drawCorners (p5) {
    p5.push();
    p5.rotate(-this.rot);
    p5.stroke(255, 0, 0);
    p5.strokeWeight(2);
    for (const corner of this.corners) {
      p5.point(corner.x, corner.y);
    }
    p5.pop();
  }

  update () {
    this.rot += this.steering;
    const move = window.p5.Vector.fromAngle(this.rot).setMag(this.speed);
    this.pos.add(move);

    this.score += this.speed;
    this.score += 0.5;
  }

  think (track) {
    const { brain, topSpeed, accelerationPower, brakingPower } = this;
    const input = [this.speed / 4, ...this.querySensors(track)];
    const output = brain.query(input);
    const [gasPedal, steering] = output.map((x) => x * 2 - 1);

    const fSpeed = (x) =>
      accelerationPower / (1 + Math.E ** (0.9 * (x - topSpeed)));
    if (gasPedal >= 0) {
      this.speed += fSpeed(gasPedal);
      this.speed = Math.min(this.speed, topSpeed);
    } else {
      this.speed += gasPedal * brakingPower;
      this.speed = Math.max(this.speed, 0);
    }

    const fSteering = (x) => 1 / (1 + Math.E ** -(x - topSpeed / 2));
    this.steering = (steering / 7) * fSteering(this.speed);

    if (Math.abs(steering) > 0.05) this.speed *= 0.9995;

    if (this.speed < 0.1) this.alive = false;
  }

  querySensors (track) {
    const { sensors, pos, rot } = this;
    return sensors.map((sensor) => sensor.query(track, pos, rot));
  }

  get corners () {
    const { rot, img, p5 } = this;
    const { width, height } = img;
    const [halfW, halfH] = [width / 2, height / 2];
    return [
      p5.createVector(+halfW, +halfH).rotate(rot), // top right
      p5.createVector(+halfW, -halfH).rotate(rot), // bottom right
      p5.createVector(-halfW, -halfH).rotate(rot), // bottom left
      p5.createVector(-halfW, +halfH).rotate(rot) //  top left
    ];
  }

  checkCollision (track) {
    const { pos } = this;
    for (const corner of this.corners) {
      const { x, y } = corner.add(pos);
      if (!track.isTrackAt(Math.round(x), Math.round(y))) {
        this.alive = false;
        this.score = Math.max(this.score - 100, 0);
        break;
      }
    }
  }

  static get Sensor () {
    return class {
      constructor (direction, length) {
        this.length = length;
        this.vector = window.p5.Vector.fromAngle(direction);
        this.vector.setMag(length);
      }

      /**
       * @param {p5Types} p5
       */
      draw (p5) {
        const { vector } = this;
        p5.line(0, 0, vector.x, vector.y);
      }

      query (track, origin, rotation) {
        const { length, vector: _vector } = this;
        let vector = _vector.copy();
        vector.rotate(rotation);

        let detected = length;
        const granularity = 20;
        for (let i = 1; i <= granularity; i++) {
          vector.setMag(length * (i / granularity));
          vector.add(origin);
          const { x, y } = vector;

          if (!track.isTrackAt(Math.round(x), Math.round(y))) {
            detected = length * (i / granularity);
            break;
          }

          vector = _vector.copy();
          vector.rotate(rotation);
        }
        return detected / length;
      }
    };
  }
}

export default Car;
