/**
 * Utils
 */
export default class Sequence {
  static nextId() {
    return Sequence._nextId++;
  }

}
Sequence._nextId = 0;