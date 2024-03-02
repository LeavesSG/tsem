export type Process<I = never, O = unknown> = (input: I) => O;

type Pipes = Process[];
type PipelineInput<T extends Pipes> = T extends [Process<infer I>, ...Process[]] ? I : never;
type PipelineOutput<T extends Pipes> = T extends [...Process[], Process<never, infer O>] ? O : never;
type PipelineValidation<T extends Pipes, In = PipelineInput<T>> = T extends [
    Process<infer NI, infer O>,
    ...infer Rest extends Pipes,
] ? In extends NI ? PipelineValidation<Rest, O>
    : never
    : unknown;

export class Pipeline<const T extends Pipes> {
    processes: [...T];
    constructor(...processes: [...T] & PipelineValidation<[...T]>) {
        this.processes = processes;
    }
    run(input: PipelineInput<T>) {
        return this.processes.reduce((prev, curr) => (curr as any)(prev), input) as PipelineOutput<T>;
    }
}
