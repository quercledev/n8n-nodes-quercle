import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { QuercleClient } from "@quercle/sdk";

setDefaultTimeout(60000); // 60 seconds for API calls

const API_KEY = process.env.QUERCLE_API_KEY;

function getClient(): QuercleClient {
	return new QuercleClient({ apiKey: API_KEY as string });
}

describe.skipIf(!API_KEY)("Integration Tests (requires QUERCLE_API_KEY)", () => {
	it("should perform a search", async () => {
		const client = getClient();
		const result = await client.search("What is TypeScript?");

		expect(result.result).toBeDefined();
		expect(typeof result.result).toBe("string");
		expect(result.result.length).toBeGreaterThan(0);
	});

	it("should perform a fetch", async () => {
		const client = getClient();
		const result = await client.fetch("https://example.com", "What is this page about?");

		expect(result.result).toBeDefined();
		expect(typeof result.result).toBe("string");
		expect(result.result.length).toBeGreaterThan(0);
	});

	it("should search with allowed domains filter", async () => {
		const client = getClient();
		const result = await client.search("TypeScript documentation", {
			allowedDomains: ["typescriptlang.org"],
		});

		expect(result.result).toBeDefined();
	});
});
