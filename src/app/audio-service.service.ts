import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PreprocessorService } from './preprocessor.service';
import { NeuralNetworkService } from './neural-network.service';
import * as Fili from 'fili';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioCtx: AudioContext;
  private microphone: MediaStreamAudioSourceNode;
  private preprocessor: PreprocessorService;
  private recorder: AudioWorkletNode;
  private network: NeuralNetworkService;
  private recording: Boolean;
  constructor() {}

  public Init(): BehaviorSubject<Boolean> {
    this.recording = false;
    this.audioCtx = new AudioContext();
    this.preprocessor = new PreprocessorService(2, 0.1, this.audioCtx);
    this.network = new NeuralNetworkService();
    this._CreateRecorderWorklet(0.2);
    return this.network.prediction;
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
              this.network.Predict(this.preprocessor.process());
            }
          }
        };
      })
      .catch((e) => {
        console.log('Could not load because of: ' + e);
      });
  }

  public Record(): void {
    if (!this.recording) {
      let callback = function (stream) {
        this.recording = true;
        this.audioCtx.resume();
        this.microphone = this.audioCtx.createMediaStreamSource(stream);
        this.microphone.connect(this.recorder);
        this.recorder.connect(this.audioCtx.destination);
      }.bind(this);
      navigator.getUserMedia(
        { video: false, audio: true },
        callback,
        console.log
      );
    }
  }

  public Stop(): void {
    if (this.recording) {
      this.recording = false;
      this.microphone.disconnect(this.recorder);
      this.recorder.disconnect(this.audioCtx.destination);
      this.audioCtx.suspend();
    }
  }
}
