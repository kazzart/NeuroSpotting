import * as tf from '@tensorflow/tfjs';
import { BehaviorSubject } from 'rxjs';

export class NeuralNetwork {
  private model: tf.LayersModel;
  private treshold: number;
  public prediction: BehaviorSubject<Boolean>;
  private modelName: string = '';

  constructor(activationTreshold: number, modelName: string) {
    this.prediction = new BehaviorSubject<Boolean>(false);
    this.LoadModel(modelName);
    this.treshold = activationTreshold;
  }

  public LoadModel(modelName: string) {
    if (this.modelName != modelName) {
      tf.loadLayersModel('./assets/models/' + modelName + '/model.json').then(
        (loadedModel) => {
          this.model = loadedModel;
        }
      );
      this.modelName = modelName;
    }
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
