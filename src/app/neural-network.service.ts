import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { BehaviorSubject } from 'rxjs';

export class NeuralNetworkService {
  private model: tf.LayersModel;
  public prediction: BehaviorSubject<Boolean>;
  constructor() {
    this.prediction = new BehaviorSubject<Boolean>(false);
    this._ModelLoad()
      .then((loadedModel) => {
        this.model = loadedModel;
      })
      .catch((e) => {
        console.log(e);
      });
  }

  private async _ModelLoad(): Promise<tf.LayersModel> {
    const model = await tf.loadLayersModel(
      'https://files.rtuitlab.ru/sergeev/model/model.json'
    );
    return model;
  }

  public Predict(data: Array<number>): void {
    let predicted = this.model.predict(tf.tensor(data).reshape([1, 20]));
    if (Array.isArray(predicted)) {
      predicted = predicted[0];
    }
    let val: Boolean;
    predicted.data().then((data) => {
      val = data[0] < data[1];
      this.prediction.next(val);
    });
  }
}
