export class FirFilter {
  private coefficients: Array<number>;
  constructor(coefficients: Array<number>) {
    this.coefficients = coefficients;
  }

  public Filter(array: Array<number>): Array<number> {
    let filtered = new Array<number>(array.length);
    for (let i = array.length - 1; i >= 0; i--) {
      let filteredSample: number = 0;
      for (
        let j = 0;
        j <
        (i + 1 < this.coefficients.length ? i + 1 : this.coefficients.length);
        j++
      ) {
        filteredSample += this.coefficients[j] * array[i - j];
      }
      filtered[i] = filteredSample;
    }
    return filtered;
  }
}
