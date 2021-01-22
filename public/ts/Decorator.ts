import * as rabEngine from "./Core.js";

export function rClass(params: any) {
    // console.log("logClass",params);
    // console.log("logClass",params.name);
    params.prototype._className = params.name;
    rabEngine.rabbitClass[params.name] = params;
    // console.log("rabbitClass",rabbitClass);
}