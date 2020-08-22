import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preprocessor } from '../classes/preprocessor';
import { NeuralNetwork } from '../classes/neural-network';

@Injectable({
  providedIn: 'root',
})
export class KeywordSpottingService {
  private audioCtx: AudioContext;
  private microphone: MediaStreamAudioSourceNode;
  private preprocessor: Preprocessor;
  private recorder: AudioWorkletNode;
  private network: NeuralNetwork;
  private recording: BehaviorSubject<Boolean>;
  private stream: MediaStream;
  constructor() {}

  public Init(): BehaviorSubject<Boolean> {
    this.recording = new BehaviorSubject<Boolean>(false);
    this.audioCtx = new AudioContext();
    Preprocessor.initFirFilter();
    this.preprocessor = new Preprocessor(0.4, 0.02, this.audioCtx);
    this.network = new NeuralNetwork(0.9, './assets/models/mira/model.json');
    this._CreateRecorderWorklet(0.1);
    return this.network.prediction;
  }

  public GetRecordingState(): BehaviorSubject<Boolean> {
    return this.recording;
  }

  private _CreateRecorderWorklet(windowLen: number) {
    this.audioCtx.audioWorklet
      .addModule('assets/recorder-worklet.js')
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
      let StartRecording = function (stream: MediaStream) {
        this.audioCtx.resume();
        this.stream = stream;
        this.microphone = this.audioCtx.createMediaStreamSource(stream);
        this.microphone.connect(this.recorder);
        this.recorder.connect(this.audioCtx.destination);
        this.recording.next(true);
      }.bind(this);
      navigator.getUserMedia(
        { video: false, audio: true },
        StartRecording,
        console.log
      );
    }
  }

  public Stop(): void {
    if (this.recording.value) {
      this.microphone.disconnect(this.recorder);
      this.recorder.disconnect(this.audioCtx.destination);
      this.stream.getTracks()[0].stop();
      this.recording.next(false);
      this.preprocessor.clearBuffer();
      this.audioCtx.suspend();
    }
  }
}
