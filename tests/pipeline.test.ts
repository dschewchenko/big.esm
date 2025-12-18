import { expect, suite, test } from "vitest";
import { Big, pipeBig } from "../src";

suite("pipeBig", () => {
  test("chains operations for primitive inputs", () => {
    const pipeline = pipeBig("1.5e3");
    expect(pipeline.toString()).toBe("1500");
    const result = pipeline.add(500).div(2, 0, "down").value();

    expect(result.toString()).toBe("1000");
    expect(pipeline.value()).toBe(result);
  });

  test("mutates the provided Big instance", () => {
    const base = new Big(2);
    const pipeline = pipeBig(base);

    pipeline.add(3).mul(2);

    expect(pipeline.value()).toBe(base);
    expect(base.toString()).toBe("10");
    expect(pipeline.toString()).toBe("10");
  });

  test("allows combining sqrt and arithmetic in a chain", () => {
    const pipeline = pipeBig(16);
    const result = pipeline.sqrt().add(2).value();

    expect(result.toString()).toBe("6");
  });
});
