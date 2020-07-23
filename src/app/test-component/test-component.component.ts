import { Component, OnInit } from '@angular/core';
import { AudioService } from '../audio-service.service';
@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.css'],
})
export class TestComponentComponent implements OnInit {
  prediction: Boolean;
  recording: Boolean;
  constructor(private audio: AudioService) {}

  ngOnInit(): void {
    this.prediction = false;
    this.audio.Init().subscribe((val: Boolean) => {
      this.prediction = val;
      if (this.prediction) {
        this.audio.Stop();
      }
    });
    this.audio.GetRecordingState().subscribe((state: Boolean) => {
      this.recording = state;
    });
  }

  Start(): void {
    this.audio.Record();
  }

  Stop(): void {
    this.audio.Stop();
  }
}
