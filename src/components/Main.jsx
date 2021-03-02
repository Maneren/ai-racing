import React, { Component } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import Car from '../scripts/Car';
import Track from '../scripts/Track';
import Utils from 'my-utils';

class Main extends Component {
  constructor (props) {
    super(props);
    this.CARS_COUNT = 100;

    this.generationNumber = 0;
    this.maxFramesPerGeneration = 20 * 60;
    this.currentGenerationFrames = 0;

    this.boost = false;

    this.trackName = 'track1';
  }

  /**
   * @param {p5Types} p5
   */
  preload (p5) {
    this.trackImg = p5.loadImage(`${window.location.origin}/assets/${this.trackName}.jpg`);
    this.carImg = p5.loadImage(`${window.location.origin}/assets/formula.png`);
  }

  /**
   * @param {p5Types} p5
   */
  setup (p5, parentRef) {
    this.track = new Track(this.trackImg, p5);
    const { height, width } = this.trackImg;
    this.carImg.resize(40, 0);

    this.nextGen(p5);

    p5.createCanvas(width, height).parent(parentRef);
  }

  /**
   * @param {p5Types} p5
   */
  draw (p5) {
    if (p5.frameCount < 10) return;
    const { track, maxFramesPerGeneration } = this;
    for (const _ of Utils.General.range(1)) {
      const { currentCars } = this;
      p5.background(255);
      track.draw(p5);

      for (const car of currentCars) {
        car.think(track);
        car.update();
        car.draw(p5);
        car.checkCollision(track);
      }

      this.currentCars = currentCars.filter(car => car.alive);
      this.currentGenerationFrames++;

      // console.timeEnd('draw');
      if (this.currentCars.length === 0 || this.currentGenerationFrames > maxFramesPerGeneration) {
        this.nextGen(p5);
        this.currentGenerationFrames = 0;
        // this.maxFramesPerGeneration = 10 * 60 * this.generationNumber;
      }
    }
    // console.log(this.currentCars[0].speed);
  }

  nextGen (p5) {
    const { track, carImg, CARS_COUNT } = this;
    if (this.generationNumber === 0) {
      const cars = [];
      for (const i of Utils.General.range(this.CARS_COUNT)) {
        const car = new Car(carImg, track.startPos, track.startRot);
        car.init(p5);
        cars[i] = car;
      }
      this.cars = cars;
      this.currentCars = cars;

      this.generationNumber++;
    } else {
      const weightedRandomElement = options => {
        let i;
        const weights = [];
        for (i = 0; i < options.length; i++) weights[i] = options[i].score + (weights[i - 1] || 0);
        const random = Math.random() * weights[weights.length - 1];
        for (i = 0; i < weights.length; i++) if (weights[i] > random) break;
        return options[i];
      };
      const mutate = x => Math.random() < 0.1 ? x + p5.randomGaussian() * 0.4 : x;

      const cars = this.cars.sort((a, b) => b.score - a.score);
      console.log(`Generation: ${this.generationNumber}, best of generation: ${Math.round(cars[0].score)}`);
      if (cars[0].score > 3000) {
        this.boost = true;
        this.maxFramesPerGeneration *= 1.5;
      }

      const newCars = [];
      for (const i of Utils.General.range(CARS_COUNT)) {
        const car = weightedRandomElement(cars);
        const newCar = new Car(carImg, track.startPos, track.startRot, car.brain.copy());
        newCar.brain.mutate(mutate);
        newCar.init(p5);
        newCars[i] = newCar;
        if (this.boost) newCar.topSpeed += 5;
      }

      this.cars = newCars;
      this.currentCars = newCars;
    }
    this.generationNumber++;
  }

  render () {
    return (
      <Sketch
        setup={this.setup.bind(this)}
        draw={this.draw.bind(this)}
        preload={this.preload.bind(this)}
      />
    );
  }
}

export default Main;
