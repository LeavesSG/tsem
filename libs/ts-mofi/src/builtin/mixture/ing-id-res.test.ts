import { IngredientIdRes } from "./ing-id-res.ts";

Deno.test("ing-id-res", () => {
    const res = IngredientIdRes.Id(123) as IngredientIdRes;
    switch (res.variant) {
        case "Id": {
            console.log(res);
            break;
        }
        case "Referred":
            console.log({
                value: res.value,
            });
            break;
    }
});
