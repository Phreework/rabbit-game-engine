import { rabbitClass } from "./Core.js";

export function rClass(params: any) {
    // console.log("logClass",params);
    // console.log("logClass",params.name);
    rabbitClass[params.name] = params;
    // console.log("rabbitClass",rabbitClass);
}