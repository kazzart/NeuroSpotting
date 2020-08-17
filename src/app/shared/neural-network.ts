import * as tf from '@tensorflow/tfjs';
import { BehaviorSubject } from 'rxjs';

export class NeuralNetwork {
  private model: tf.LayersModel;
  private treshold: number;
  public prediction: BehaviorSubject<Boolean>;
  constructor(activationTreshold: number) {
    this.prediction = new BehaviorSubject<Boolean>(false);
    tf.loadLayersModel(
      'assets/models/model.json'
    ).then((loadedModel) => {
      this.model = loadedModel;
    });
    this.treshold = activationTreshold;
  }

  public Predict(PCMdata: Array<number>): void {
    let predicted = this.model.predict(tf.tensor(PCMdata).reshape([1, 1, 20]));
    if (Array.isArray(predicted)) {
      predicted = predicted[0];
    }
    let val: Boolean;
    predicted.data().then((data) => {
      val = this.treshold < data[1];
      this.prediction.next(val);
    });
  }
}
