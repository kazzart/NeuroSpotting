class FilterBuffer{
    public buffer: Array<number>;
    public pointer: number;

    public constructor(length: number){
        this.buffer = new Array<number>(length).fill(0);
        this.pointer = 0;
    }

    public UpdatePointer(): void{
        this.pointer = (this.pointer + 1) % (this.buffer.length);
    }
    
}


export class FirFilter{
    public coeffs: Array<number>;
    public buffer: FilterBuffer;

    public constructor(coefficients: Array<number>){
        this.coeffs = coefficients;
        this.buffer = new FilterBuffer(this.coeffs.length - 1);
    }

    private Step(currentValue: number): number{
        let out = 0;
        this.buffer.buffer[this.buffer.pointer] = currentValue;
        for (let i = 0; i < this.buffer.buffer.length; i++) {
            out += (this.coeffs[i] * this.buffer.buffer[(this.buffer.pointer + i) % (this.buffer.buffer.length)]);
        }
        this.buffer.UpdatePointer();
        return out;
    }

    public Filter(array: Array<number>):Array<number>{
        let filtered = new Array<number>(array.length);
        for (let i = 0; i < array.length; i++) {
            filtered[i] = this.Step(array[i]);
        }
        return filtered;
    }
}

