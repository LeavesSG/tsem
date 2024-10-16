type Test = {
    name: "string";
    value: number;
    children: [{
        name: string;
        settings: {
            autoCharge: true;
        };
    }];
};

type ValidObjPath<
    Obj,
    Keys extends string[],
> = Keys extends [infer CurKey, ...infer RestKey extends string[]]
    ? CurKey extends keyof Obj ? ValidObjPath<Obj[CurKey], RestKey> extends "ends" ? Keys
        : never
    : never
    : "ends";

type z = ValidObjPath<Test, ["name"]>;
