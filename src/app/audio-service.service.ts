import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as Fili from 'fili';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private listening: BehaviorSubject<Boolean>;
  private audioCtx: AudioContext;
  private microphone: MediaStreamAudioSourceNode;
  private worklet: AudioWorkletNode;
  constructor() {}

  public Init(): BehaviorSubject<Boolean> {
    this.audioCtx = new AudioContext();
    this._CreateRecorderWorklet(0.2);
    this.listening = new BehaviorSubject<Boolean>(false);
    return this.listening;
  }

  private _CreateRecorderWorklet(windowLen: number) {
    this.audioCtx.audioWorklet
      .addModule('../assets/audio-worklet.js')
      .then(() => {
        this.worklet = new AudioWorkletNode(this.audioCtx, 'bypass-processor', {
          processorOptions: {
            bufferLen: windowLen * this.audioCtx.sampleRate,
          },
        });
        this.worklet.port.onmessage = (event) => {
          if (event.data.eventType == 'audioData') {
            const audioData = event.data.audioPCM;
            console.log(audioData);
          }
        };
      })
      .catch((e) => {
        console.log('Could not load because of: ' + e);
      });
  }

  public Record(): void {
    let callback = function (stream) {
      this.microphone = this.audioCtx.createMediaStreamSource(stream);
      this.microphone.connect(this.worklet);
      this.worklet.connect(this.audioCtx.destination);
    }.bind(this);
    this.listening.next(true);
    navigator.getUserMedia(
      { video: false, audio: true },
      callback,
      console.log
    );
  }

  public Stop(): void {
    this.microphone.disconnect(this.worklet);
    this.worklet.disconnect(this.audioCtx.destination);
    this.listening.next(false);
  }
}
