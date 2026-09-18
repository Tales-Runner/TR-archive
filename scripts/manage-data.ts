import { resolve } from "node:path";
import { applySnapshot, readSnapshot, validateSnapshot } from "./data-snapshot";

const [command, directory] = process.argv.slice(2);
if (!directory || !["validate", "apply"].includes(command)) {
  throw new Error("Usage: tsx scripts/manage-data.ts <validate|apply> <snapshot-directory>");
}
const candidate = readSnapshot(resolve(directory));
if (command === "apply") applySnapshot(process.cwd(), candidate);
else validateSnapshot(candidate, readSnapshot(process.cwd()));
console.log(`Data snapshot ${command}: OK`);
