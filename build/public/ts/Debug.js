export class Debug {
  /**
   * 打印日志信息
   * @param msg 
   * @param args 
   */
  static log(msg, ...args) {
    console.log(msg, args);
  }
  /**
   * 打印错误信息
   * @param msg 
   * @param args 
   */


  static error(msg, ...args) {
    console.error(msg, args);
  }
  /**
   * 打印警告信息
   * @param msg 
   * @param args 
   */


  static warn(msg, ...args) {
    console.warn(msg, args);
  }
  /**
   * 使用github查询特定函数报错码
   * @param number 
   * @todo
   */


  static errorCode(number) {}

}