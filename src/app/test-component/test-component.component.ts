import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { AudioService } from '../audio-service.service';
@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.css'],
})
export class TestComponentComponent implements OnInit {
  prediction: Boolean;
  recording: Boolean;
  constructor(private audio: AudioService,private changeDetectorRef: ChangeDetectorRef) {
    this.recording = false;
    this.prediction = false;
  }

  ngOnInit(): void {
    this.prediction = false;
    this.audio.Init().subscribe((val: Boolean) => {
      if ( this.prediction != val ) {
        this.prediction = val;
        if (this.prediction) {
          this.audio.Stop();
        }
        this.changeDetectorRef.detectChanges();
      }
    });
    this.audio.GetRecordingState().subscribe((state: Boolean) => {
      this.recording = state;
      this.changeDetectorRef.detectChanges();
    });
  }

  Start(): void {
    this.audio.Record();
    this.prediction = false;
  }

  Stop(): void {
    this.audio.Stop();
  }

  Toggle(): void {
    if ( this.recording ) {
      this.Stop();
    } else {
      this.Start();
    }
  }

  ButtonAppearence(){
    let classes = {
      recording: this.recording === true,
      notRecording: this.recording === false
    }
    return classes
  }
}
