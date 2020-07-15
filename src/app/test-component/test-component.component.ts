import { Component, OnInit } from '@angular/core';
import { AudioService } from '../audio-service.service';
@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.css'],
})
export class TestComponentComponent implements OnInit {
  listening: Boolean;
  constructor(private audio: AudioService) {}

  ngOnInit(): void {
    this.listening = false;
    this.audio.Init().subscribe((val: Boolean) => (this.listening = val));
  }

  Start(): void {
    this.audio.Record();
  }

  Stop(): void {
    this.audio.Stop();
  }
}
