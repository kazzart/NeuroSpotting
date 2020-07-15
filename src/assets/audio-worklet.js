class BypassProcessor extends AudioWorkletProcessor {
  _buffer;
  _realLen;

  constructor(options) {
    super();
    this._buffer = new Float32Array(options.processorOptions.bufferLen);
    this._realLen = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    this._Append(input[0]);

    for (let channel = 0; channel < output.length; ++channel) {
      output[channel].set(input[channel]);
    }
    return true;
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
    let buffer = this._buffer;
    this.port.postMessage({
      eventType: "audioData",
      audioPCM: buffer,
    });
    this._realLen = 0;
  }
}
registerProcessor("bypass-processor", BypassProcessor);
