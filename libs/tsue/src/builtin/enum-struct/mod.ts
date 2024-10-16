import { PHANTOM_DATA } from "../../types/phantom.ts";

export class EnumStruct<
    IEnum = Record<string, unknown>,
    Variant extends keyof IEnum = keyof IEnum,
> {
    variant: Variant;
    value: IEnum[Variant];

    declare [PHANTOM_DATA]: IEnum;

    constructor(variant: Variant, value: IEnum[Variant]) {
        this.variant = variant;
        this.value = value;
    }

    isVariant<const V2 extends Variant>(variant: V2): this is this & EnumStruct<IEnum, V2> {
        return this.variant === variant;
    }
}

export function enumBuilder<const Es extends typeof EnumStruct<any, any>, const V extends keyof GetVs<Es>>(
    ctor: Es,
    variant: V,
) {
    return (...item: GetVs<Es>[V] extends never ? [] : [GetVs<Es>[V]]) => {
        return new ctor(variant, item[0]) as InstanceType<Es> & EnumStruct<GetVs<Es>, V>;
    };
}

export function genericBuilder<const Es extends typeof EnumStruct<any, any>, const V extends keyof GetVs<Es>>(
    ctor: Es,
    variant: V,
) {
    return <const T>(item: T) => {
        return new ctor(variant, item) as
            & InstanceType<Es>
            & EnumStruct<{ [K in V]: T }, V>;
    };
}

type GetVs<C extends typeof EnumStruct<any, any>> = InstanceType<C>[typeof PHANTOM_DATA];
