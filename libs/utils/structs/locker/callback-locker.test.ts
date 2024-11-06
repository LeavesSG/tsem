import { LockedCallback } from "./callback-locker.ts";

Deno.test("callback-locker", async () => {
    const callback = () => console.log("invoke");
    const locked = new LockedCallback(callback);
    const unlock = locked.lockup();
    console.log("locked!");
    const res = locked.locked();
    unlock();
    console.log("unlock");
    await res;
});
