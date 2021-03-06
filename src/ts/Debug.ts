export class Debug {
    /**
     * 打印日志信息
     * @param msg 
     * @param args 
     */
    static log(...args: any[]) {
        console.log(args);
    }

    /**
     * 打印错误信息
     * @param msg 
     * @param args 
     */
    static error( ...args: any[]) {
        console.error(args);
    }

    /**
     * 打印警告信息
     * @param msg 
     * @param args 
     */
    static warn(...args: any[]) {
        console.warn(args);
    }

    /**
     * 使用github查询特定函数报错码
     * @param number 
     * @todo
     */
    static errorCode(number: number) {

    }
}