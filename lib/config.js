import { readFile } from "fs/promises";
export const ConfigJson = JSON.parse(
	await readFile(new URL("../.config.json", import.meta.url)),
);
