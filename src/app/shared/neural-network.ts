import * as tf from '@tensorflow/tfjs';
import { BehaviorSubject } from 'rxjs';

export class NeuralNetwork {
  private model: tf.LayersModel;
  public prediction: BehaviorSubject<Boolean>;
  constructor() {
    this.prediction = new BehaviorSubject<Boolean>(false);
    tf.loadLayersModel(
      'https://files.rtuitlab.ru/sergeev/model/Mira/model.json'
    ).then((loadedModel) => {
      this.model = loadedModel;
      console.log('loaded');
    });
  }

  public Predict(PCMdata: Array<number>): void {
    let predicted = this.model.predict(tf.tensor(PCMdata).reshape([1, 1, 20]));
    if (Array.isArray(predicted)) {
      predicted = predicted[0];
    }
    let val: Boolean;
    predicted.data().then((data) => {
      val = data[0] < data[1];
      if (val) {
        console.log('Опа, ключевое слово');
      }
      this.prediction.next(val);
    });
  }
}
