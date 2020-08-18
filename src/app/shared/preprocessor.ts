import { BufferPCM } from './buffer-pcm';
import { coeffs } from './coeffs';
import { FirFilter } from './firFilter';

export class Preprocessor {
  buffer: BufferPCM;
  n_parts: number;
  static firFilltersCoeffs: number[];
  static firFilter: FirFilter;

  constructor(bufferLen: number, partLen: number, audioCtx: AudioContext) {
    this.buffer = new BufferPCM(bufferLen * audioCtx.sampleRate);
    this.n_parts = bufferLen / partLen;
  }

  static mean(arr: number[]): number {
    let sum = arr.reduce(
      (accumulator: number, currentValue: number): number => {
        return accumulator + currentValue;
      }
    );
    return sum / arr.length;
  }

  static std(arr: number[], ddof: number): number {
    let mean = Preprocessor.mean(arr);
    let squaredDifference = arr.reduce(
      (accumulator: number, currentValue: number): number => {
        return accumulator + (currentValue - mean) * (currentValue - mean);
      }
    );
    return Math.sqrt(squaredDifference / (arr.length - ddof));
  }

  static initFirFilter({ order = 999, Fs, F1 = 260, F2 = 700 }): void {
    Preprocessor.firFilltersCoeffs = coeffs;
    this.firFilter = new FirFilter(Preprocessor.firFilltersCoeffs);
  }

  appendData(data: Float32Array): void {
    this.buffer.Append(data);
  }

  clearBuffer(): void {
    this.buffer.Clear();
  }

  bufferIsReady(): Boolean {
    return this.buffer.IsReady();
  }

  static formantFiltering(PCMdata: number[]): number[] {
    return this.firFilter.Filter(PCMdata);
  }

  static squareNormalize(array: number[]): number[] {
    let max = Math.max(...array);
    max = max * max;
    return array.map((currentValue: number): number => {
      return (currentValue * currentValue) / max;
    });
  }

  static split(array: number[], n_parts: number): number[][] {
    let splited_arrays = new Array(n_parts);
    var part_len = ~~(array.length / n_parts);
    var add_length = array.length % n_parts;
    let i: number,
      j: number,
      k: number = 0;
    for (i = 0, j = array.length; i < j; i += part_len) {
      if (k < add_length) {
        splited_arrays[k] = array.slice(i, i + part_len + 1);
        i++;
      } else {
        splited_arrays[k] = array.slice(i, i + part_len);
      }
      k++;
    }
    return splited_arrays;
  }

  static integrate(arrays: number[][]): number[] {
    let e_parts: number[] = Array(arrays.length);
    for (let i = 0; i < arrays.length; i++) {
      const part = arrays[i];
      e_parts[i] = part.reduce(
        (accumulator: number, currentValue: number): number => {
          return accumulator + currentValue;
        }
      );
      e_parts[i] -= (part[0] + part[part.length - 1]) / 2;
    }
    return e_parts;
  }

  process(): number[] {
    let filtered: number[] = Preprocessor.formantFiltering(
      this.buffer.GetBuffer()
    );
    let splited: number[][] = Preprocessor.split(
      Preprocessor.squareNormalize(filtered),
      this.n_parts
    );
    let energies = Preprocessor.integrate(splited);
    let std: number = Preprocessor.std(energies, 1);
    let mean: number = Preprocessor.mean(energies);
    return energies.map((currentValue: number): number => {
      return (currentValue - mean) / std;
    });
  }
}
