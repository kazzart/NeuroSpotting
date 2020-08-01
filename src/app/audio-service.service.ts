import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preprocessor } from './shared/preprocessor';
import { NeuralNetwork } from './shared/neural-network';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioCtx: AudioContext;
  private microphone: MediaStreamAudioSourceNode;
  private preprocessor: Preprocessor;
  private recorder: AudioWorkletNode;
  private network: NeuralNetwork;
  private recording: BehaviorSubject<Boolean>;
  constructor() {}

  public Init(): BehaviorSubject<Boolean> {
    this.recording = new BehaviorSubject<Boolean>(false);
    this.audioCtx = new AudioContext();
    Preprocessor.initFirFilter({ Fs: this.audioCtx.sampleRate });
    this.preprocessor = new Preprocessor(0.4, 0.02, this.audioCtx);
    this.network = new NeuralNetwork(0.9);
    this._CreateRecorderWorklet(0.1);
    return this.network.prediction;
  }

  public GetRecordingState(): BehaviorSubject<Boolean> {
    return this.recording;
  }

  private _CreateRecorderWorklet(windowLen: number) {
    this.audioCtx.audioWorklet
      .addModule('../assets/recorder-worklet.js')
      .then(() => {
        this.recorder = new AudioWorkletNode(this.audioCtx, 'recorder', {
          processorOptions: {
            bufferLen: windowLen * this.audioCtx.sampleRate,
          },
        });
        this.recorder.port.onmessage = (event) => {
          if (event.data.eventType == 'audioData') {
            const audioData = event.data.audioPCM;
            this.preprocessor.appendData(audioData);
            if (this.preprocessor.bufferIsReady()) {
              let data = this.preprocessor.process();
              this.network.Predict(data);
            }
          }
        };
      });
  }

  public Record(): void {
    if (!this.recording.value) {
      let callback = function (stream) {
        this.audioCtx.resume();
        this.microphone = this.audioCtx.createMediaStreamSource(stream);
        this.microphone.connect(this.recorder);
        this.recorder.connect(this.audioCtx.destination);
        this.recording.next(true);
      }.bind(this);
      navigator.getUserMedia(
        { video: false, audio: true },
        callback,
        console.log
      );
    }
  }

  public Stop(): void {
    if (this.recording.value) {
      this.microphone.disconnect(this.recorder);
      this.recorder.disconnect(this.audioCtx.destination);
      this.recording.next(false);
      this.preprocessor.clearBuffer();
      this.audioCtx.suspend();
    }
  }
}
