class RecorderWorklet extends AudioWorkletProcessor {
  _buffer;
  _realLen;

  constructor(options) {
    super();
    this._buffer = new Float32Array(options.processorOptions.bufferLen);
    this._realLen = 0;
  }

  _Append(data) {
    let emptySize = this._buffer.length - this._realLen;
    if (data.length >= emptySize) {
      for (let i = 0; i < emptySize; i++) {
        this._buffer[i + this._realLen] = data[i];
      }
      this._Flush();
      for (let i = 0; i < data.length - emptySize; i++) {
        this._buffer[i] = data[i + emptySize];
      }
      this._realLen += data.length - emptySize;
    } else {
      for (let i = 0; i < data.length; i++) {
        this._buffer[i + this._realLen] = data[i];
      }
      this._realLen += data.length;
    }
  }

  _Flush() {
    let buffer = this._buffer.slice();
    this.port.postMessage({
      eventType: "audioData",
      audioPCM: buffer,
    });
    this._realLen = 0;
  }
  
  process(inputs, outputs) {
    const input = inputs[0];
    if(input.length){
      const mono = input[0].slice();
      for (let i = 1; i < input.length; i++) {
        const chanel = input[i];
        for (let j = 0; j < chanel.length; j++) {
          mono[j] += chanel[j];
        }
      }
      this._Append(mono);
    }
    return true;
  }
}
registerProcessor("recorder", RecorderWorklet);
