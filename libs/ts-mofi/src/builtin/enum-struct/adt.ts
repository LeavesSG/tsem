// // class VariantDef<T = unknown> {
// //     declare value: T;
// // }

// import { EnumOfADT } from "../mod.ts";

// declare function variant<T>(): T;

// export function adt<T extends new(...args: any) => { variants: Record<string, unknown> }>(
//     def: T,
// ): T & {
//     variant: 1;
//     value: 2;
// } {
//     console.log(def);
//     return EnumOfADT as any;
// }

// export class Option<T> extends adt(
//     class _Option<T> {
//         private variants = {
//             Some: variant<T>(),
//             None: variant(),
//         };
//     },
// )<T> {
//     some!: T;
// }
