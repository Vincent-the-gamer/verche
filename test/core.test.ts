import { expect, test } from "vitest";
import { getKittyVersions } from "../src/core/kitty";

test("kitty", async () => {
  const kittyVersions = await getKittyVersions()
  console.log(kittyVersions)
  expect(kittyVersions).toHaveProperty("current")
  expect(kittyVersions).toHaveProperty("latest")
})