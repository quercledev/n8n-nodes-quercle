import { describe, expect, it } from "bun:test";
import { BASE_URL, FIELD_DESCRIPTIONS, TOOL_DESCRIPTIONS } from "@quercle/sdk";
import { QuercleApi } from "../credentials/QuercleApi.credentials";
import { Quercle } from "../nodes/Quercle/Quercle.node";

describe("Quercle Node", () => {
	const node = new Quercle();

	it("should have correct display name", () => {
		expect(node.description.displayName).toBe("Quercle");
	});

	it("should have correct internal name", () => {
		expect(node.description.name).toBe("quercle");
	});

	it("should have an icon", () => {
		expect(node.description.icon).toBe("file:quercle.svg");
	});

	it("should have optional quercleApi credentials (env var fallback)", () => {
		const credentials = node.description.credentials;
		expect(credentials).toBeDefined();
		expect(credentials).toHaveLength(1);
		expect(credentials?.[0].name).toBe("quercleApi");
		expect(credentials?.[0].required).toBe(false);
	});

	it("should define search and fetch operations", () => {
		const operationProp = node.description.properties.find((p) => p.name === "operation");
		expect(operationProp).toBeDefined();
		expect(operationProp?.type).toBe("options");
		expect(operationProp?.options).toHaveLength(2);

		const options = operationProp?.options as Array<{
			name: string;
			value: string;
			description: string;
		}>;
		expect(options[0].value).toBe("search");
		expect(options[0].description).toBe(TOOL_DESCRIPTIONS.SEARCH);
		expect(options[1].value).toBe("fetch");
		expect(options[1].description).toBe(TOOL_DESCRIPTIONS.FETCH);
	});

	it("should use SDK field descriptions", () => {
		const queryProp = node.description.properties.find((p) => p.name === "query");
		expect(queryProp?.description).toBe(FIELD_DESCRIPTIONS.SEARCH_QUERY);

		const urlProp = node.description.properties.find((p) => p.name === "url");
		expect(urlProp?.description).toBe(FIELD_DESCRIPTIONS.FETCH_URL);

		const promptProp = node.description.properties.find((p) => p.name === "prompt");
		expect(promptProp?.description).toBe(FIELD_DESCRIPTIONS.FETCH_PROMPT);

		const domainsProp = node.description.properties.find((p) => p.name === "domains");
		expect(domainsProp?.description).toBe(FIELD_DESCRIPTIONS.ALLOWED_DOMAINS);
	});

	it("should have query field for search operation", () => {
		const queryProp = node.description.properties.find((p) => p.name === "query");
		expect(queryProp).toBeDefined();
		expect(queryProp?.type).toBe("string");
		expect(queryProp?.required).toBe(true);
		expect(queryProp?.displayOptions?.show?.operation).toContain("search");
	});

	it("should have domain filter options for search operation", () => {
		const domainFilterProp = node.description.properties.find((p) => p.name === "domainFilter");
		expect(domainFilterProp).toBeDefined();
		expect(domainFilterProp?.type).toBe("options");

		const options = domainFilterProp?.options as Array<{ name: string; value: string }>;
		expect(options).toHaveLength(3);
		expect(options.map((o) => o.value)).toContain("none");
		expect(options.map((o) => o.value)).toContain("allowed");
		expect(options.map((o) => o.value)).toContain("blocked");
	});

	it("should have url and prompt fields for fetch operation", () => {
		const urlProp = node.description.properties.find((p) => p.name === "url");
		expect(urlProp).toBeDefined();
		expect(urlProp?.type).toBe("string");
		expect(urlProp?.required).toBe(true);
		expect(urlProp?.displayOptions?.show?.operation).toContain("fetch");

		const promptProp = node.description.properties.find((p) => p.name === "prompt");
		expect(promptProp).toBeDefined();
		expect(promptProp?.type).toBe("string");
		expect(promptProp?.required).toBe(true);
		expect(promptProp?.displayOptions?.show?.operation).toContain("fetch");
	});

	it("should have execute function", () => {
		expect(typeof node.execute).toBe("function");
	});
});

describe("QuercleApi Credentials", () => {
	const credentials = new QuercleApi();

	it("should have correct name", () => {
		expect(credentials.name).toBe("quercleApi");
	});

	it("should have correct display name", () => {
		expect(credentials.displayName).toBe("Quercle API");
	});

	it("should have documentation URL", () => {
		expect(credentials.documentationUrl).toBe("https://quercle.dev/docs");
	});

	it("should have API key property", () => {
		const apiKeyProp = credentials.properties.find((p) => p.name === "apiKey");
		expect(apiKeyProp).toBeDefined();
		expect(apiKeyProp?.type).toBe("string");
		expect(apiKeyProp?.typeOptions?.password).toBe(true);
		expect(apiKeyProp?.required).toBe(true);
	});

	it("should have authentication configured", () => {
		expect(credentials.authenticate).toBeDefined();
		expect(credentials.authenticate.type).toBe("generic");
	});

	it("should use BASE_URL from SDK", () => {
		expect(credentials.test.request.baseURL).toBe(BASE_URL);
	});

	it("should have credential test configured", () => {
		expect(credentials.test).toBeDefined();
		expect(credentials.test.request.url).toBe("/v1/search");
		expect(credentials.test.request.method).toBe("POST");
	});
});
