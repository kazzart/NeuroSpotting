import { Injectable } from '@angular/core';
import * as Fili from 'fili';
import { BufferPCMService } from './buffer-pcm.service';

export class PreprocessorService {
  buffer: BufferPCMService;
  n_parts: number;
  static firCalculator = new Fili.FirCoeffs();
  static firFilltersCoeffs = PreprocessorService.firCalculator.bandpass({
    order: 99,
    Fs: 48000,
    F1: 260,
    F2: 700,
  });
  static firFilter = new Fili.FirFilter(PreprocessorService.firFilltersCoeffs);

  constructor(bufferLen: number, partLen: number, audioCtx: AudioContext) {
    this.buffer = new BufferPCMService(
      bufferLen * audioCtx.sampleRate,
      audioCtx
    );
    this.n_parts = bufferLen / partLen;
  }

  appendData(data: Float32Array) {
    this.buffer.Append(data);
  }

  clearBuffer() {
    this.buffer.Clear();
  }

  bufferIsReady() {
    return this.buffer.IsReady();
  }

  static formantFiltering(PCMdata: number[]) {
    return this.firFilter.multiStep(PCMdata);
  }

  static normalize(array: number[]) {
    let max = Math.max(...array);
    function callback(currentValue: number) {
      return currentValue / max;
    }
    return array.map(callback);
  }

  static square(array: number[]) {
    return array.map(function (currentValue) {
      return currentValue * currentValue;
    });
  }

  static split(array: number[], n_parts: number) {
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

  static integrate(arrays: number[][]) {
    let e_parts: number[] = Array(arrays.length);
    for (let i = 0; i < arrays.length; i++) {
      const part = arrays[i];
      e_parts[i] = 0;
      for (let j = 0; j < part.length; j++) {
        e_parts[i] += part[j];
      }
      e_parts[i] -= (part[0] + part[part.length - 1]) / 2;
    }
    return e_parts;
  }

  process() {
    return PreprocessorService.integrate(
      PreprocessorService.split(
        PreprocessorService.square(
          PreprocessorService.normalize(
            PreprocessorService.formantFiltering(this.buffer.GetBuffer())
          )
        ),
        this.n_parts
      )
    );
  }
}
