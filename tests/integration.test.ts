import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { BASE_URL } from "@quercle/sdk";

setDefaultTimeout(60000); // 60 seconds for API calls

const API_KEY = process.env.QUERCLE_API_KEY;

describe.skipIf(!API_KEY)("Integration Tests (requires QUERCLE_API_KEY)", () => {
	it("should perform a search", async () => {
		const response = await fetch(`${BASE_URL}/v1/search`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query: "What is TypeScript?" }),
		});

		expect(response.ok).toBe(true);
		const data = (await response.json()) as { result: string };
		expect(data.result).toBeDefined();
		expect(typeof data.result).toBe("string");
		expect(data.result.length).toBeGreaterThan(0);
	});

	it("should perform a fetch", async () => {
		const response = await fetch(`${BASE_URL}/v1/fetch`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: "https://example.com",
				prompt: "What is this page about?",
			}),
		});

		expect(response.ok).toBe(true);
		const data = (await response.json()) as { result: string };
		expect(data.result).toBeDefined();
		expect(typeof data.result).toBe("string");
		expect(data.result.length).toBeGreaterThan(0);
	});

	it("should search with allowed domains filter", async () => {
		const response = await fetch(`${BASE_URL}/v1/search`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query: "TypeScript documentation",
				allowed_domains: ["typescriptlang.org"],
			}),
		});

		expect(response.ok).toBe(true);
		const data = (await response.json()) as { result: string };
		expect(data.result).toBeDefined();
	});
});
