import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PreprocessorService } from './preprocessor.service';
import { NeuralNetworkService } from './neural-network.service';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioCtx: AudioContext;
  private microphone: MediaStreamAudioSourceNode;
  private preprocessor: PreprocessorService;
  private recorder: AudioWorkletNode;
  private network: NeuralNetworkService;
  private recording: BehaviorSubject<Boolean>;
  constructor() {}

  public Init(): BehaviorSubject<Boolean> {
    this.recording = new BehaviorSubject<Boolean>(false);
    this.audioCtx = new AudioContext();
    PreprocessorService.initFirFilter({ Fs: this.audioCtx.sampleRate });
    this.preprocessor = new PreprocessorService(0.4, 0.02, this.audioCtx);
    this.network = new NeuralNetworkService();
    this._CreateRecorderWorklet(0.2);
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
              this.network.Predict(this.preprocessor.process());
              // this.preprocessor.tmp();
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
      }.bind(this);
      this.recording.next(true);
      navigator.getUserMedia(
        { video: false, audio: true },
        callback,
        console.log
      );
    }
  }

  public Stop(): void {
    if (this.recording.value) {
      this.recording.next(false);
      this.microphone.disconnect(this.recorder);
      this.recorder.disconnect(this.audioCtx.destination);
      this.preprocessor.clearBuffer();
      this.audioCtx.suspend();
    }
  }
}
