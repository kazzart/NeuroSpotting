import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { KeywordSpottingService } from '../shared/keyword-spotting.service';
@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.css'],
})
export class TestComponentComponent implements OnInit {
  prediction: Boolean;
  recording: Boolean;
  keyPhraseCounter: number;
  constructor(private audio: KeywordSpottingService,private changeDetectorRef: ChangeDetectorRef) {
    this.recording = false;
    this.prediction = false;
    this.keyPhraseCounter = 0;
  }

  ngOnInit(): void {
    this.prediction = false;
    this.audio.Init().subscribe((val: Boolean) => {
      if ( this.prediction != val ) {
        this.prediction = val;
        if (this.prediction) {
          // this.audio.Stop();
          this.keyPhraseCounter++;
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
