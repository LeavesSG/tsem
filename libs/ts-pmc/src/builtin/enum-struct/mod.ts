import { PHANTOM_MARKER, type PhantomMarker } from "../../types/phantom.ts";
import { Pattern } from "../pattern/pattern.ts";
import { SYMBOL_TO_PATTERN } from "../pattern/to-pattern.ts";

export class EnumStruct<
    Def = Record<string, unknown>,
    Var extends keyof Def & string = keyof Def & string,
> {
    variant: Var;
    value: Def[Var];
    declare [PHANTOM_MARKER]: Def;

    constructor(variant: Var, value: Def[Var]) {
        this.variant = variant;
        this.value = value;
    }

    isVariant<const V2 extends keyof Def & string>(variant: V2): this is this & EnumStruct<Def, V2> {
        return this.variant as unknown as V2 === variant;
    }

    [SYMBOL_TO_PATTERN]() {
        const pred = (target: unknown): target is EnumStruct<Def, Var> => {
            const ctor = this.constructor as typeof EnumStruct;
            if (!(target instanceof ctor)) return false;
            return target.isVariant(this.variant);
        };
        return new Pattern(pred);
    }
}

export function builder<const Es extends typeof EnumStruct<any, any>, const V extends keyof GetVs<Es> & string>(
    ctor: Es,
    variant: V,
) {
    return (...item: GetVs<Es>[V] extends never ? [] : [GetVs<Es>[V]]) => {
        return new ctor(variant, item[0]) as InstanceType<Es> & EnumStruct<GetVs<Es>, V>;
    };
}

export function genericBuilder<const Es extends typeof EnumStruct<any, any>, const V extends keyof GetVs<Es> & string>(
    ctor: Es,
    variant: V,
) {
    return <const T>(item: T) => {
        return new ctor(variant, item) as
            & InstanceType<Es>
            & EnumStruct<{ [K in V]: T }, V>;
    };
}

type GetVs<C extends typeof EnumStruct<any, any>> = InstanceType<C>[PhantomMarker];
