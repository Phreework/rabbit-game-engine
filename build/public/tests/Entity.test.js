import * as rEngine from "../ts/Core";
describe("entity", () => {
  test("entity exists", () => {
    const entity = new rEngine.Entity();
    expect(entity).not.toBeNull();
  });
});