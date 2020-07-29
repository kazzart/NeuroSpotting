export class BufferPCM {
    private audioCtx: AudioContext;
    private bufferMaxLen: number;
    private buffer: Array<number>;
  
    public constructor(bufferLength: number, audioContext: AudioContext) {
      this.audioCtx = audioContext;
      this.bufferMaxLen = bufferLength;
      this.buffer = new Array<number>(0);
    }
  
    public Append(data: Float32Array): void {
      const convertedData = Array.prototype.slice.call(data);
      const emptySize = this.bufferMaxLen - this.buffer.length;
      if (emptySize < convertedData.length) {
        this.buffer.splice(0, convertedData.length - emptySize);
      }
      this.buffer.push(...convertedData);
    }
  
    public Clear(): void {
      this.buffer = new Array<number>(0);
    }
  
    public IsReady(): Boolean {
      return this.buffer.length >= this.bufferMaxLen;
    }
  
    public GetBuffer(): number[] {
      return this.buffer.slice();
    }
  }
  