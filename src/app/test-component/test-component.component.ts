import { Component, OnInit } from '@angular/core';
import { AudioService } from '../audio-service.service';
@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.css'],
})
export class TestComponentComponent implements OnInit {
  prediction: Boolean;
  constructor(private audio: AudioService) {}

  ngOnInit(): void {
    this.prediction = false;
    this.audio.Init().subscribe((val: Boolean) => {
      if (this.prediction != val) {
        console.log(val);
      }
      this.prediction = val;
      if (this.prediction) {
        this.audio.Stop();
      }
    });
  }

  Start(): void {
    this.audio.Record();
  }

  Stop(): void {
    this.audio.Stop();
  }
}
