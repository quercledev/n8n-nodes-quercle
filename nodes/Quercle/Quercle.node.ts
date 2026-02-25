import { QuercleClient, toolMetadata } from "@quercle/sdk";
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";

export class Quercle implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Quercle",
		name: "quercle",
		icon: "file:quercle.png",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "AI-powered web search and fetch",
		defaults: {
			name: "Quercle",
		},
		inputs: ["main"],
		outputs: ["main"],
		usableAsTool: true,
		credentials: [
			{
				name: "quercleApi",
				required: false,
			},
		],
		properties: [
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				options: [
					{
						name: "Search",
						value: "search",
						description: toolMetadata.search.description,
						action: "Perform AI powered web search",
					},
					{
						name: "Fetch",
						value: "fetch",
						description: toolMetadata.fetch.description,
						action: "Fetch and process content from a URL",
					},
					{
						name: "Raw Search",
						value: "rawSearch",
						description: toolMetadata.rawSearch.description,
						action: "Run raw web search",
					},
					{
						name: "Raw Fetch",
						value: "rawFetch",
						description: toolMetadata.rawFetch.description,
						action: "Fetch raw content from a URL",
					},
					{
						name: "Extract",
						value: "extract",
						description: toolMetadata.extract.description,
						action: "Extract relevant content from a URL",
					},
				],
				default: "search",
			},
			// Search operation fields
			{
				displayName: "Query",
				name: "query",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["search"],
					},
				},
				default: "",
				description: toolMetadata.search.parameters.query,
			},
			{
				displayName: "Domain Filter",
				name: "domainFilter",
				type: "options",
				displayOptions: {
					show: {
						operation: ["search"],
					},
				},
				options: [
					{ name: "None", value: "none" },
					{ name: "Allowed Domains", value: "allowed" },
					{ name: "Blocked Domains", value: "blocked" },
				],
				default: "none",
				description: "Filter search results by domain",
			},
			{
				displayName: "Domains",
				name: "domains",
				type: "string",
				displayOptions: {
					show: {
						operation: ["search"],
						domainFilter: ["allowed", "blocked"],
					},
				},
				default: "",
				description: toolMetadata.search.parameters.allowed_domains,
				placeholder: "example.com, another.com",
			},
			// Fetch operation fields
			{
				displayName: "URL",
				name: "url",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["fetch"],
					},
				},
				default: "",
				description: toolMetadata.fetch.parameters.url,
				placeholder: "https://example.com/page",
			},
			{
				displayName: "Prompt",
				name: "prompt",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["fetch"],
					},
				},
				default: "",
				description: toolMetadata.fetch.parameters.prompt,
				typeOptions: {
					rows: 4,
				},
				placeholder: "Extract the main article content and summarize it",
			},
			// Raw Search operation fields
			{
				displayName: "Query",
				name: "query",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["rawSearch"],
					},
				},
				default: "",
				description: toolMetadata.rawSearch.parameters.query,
			},
			{
				displayName: "Format",
				name: "format",
				type: "options",
				displayOptions: {
					show: {
						operation: ["rawSearch"],
					},
				},
				options: [
					{ name: "Markdown", value: "markdown" },
					{ name: "JSON", value: "json" },
				],
				default: "markdown",
				description: toolMetadata.rawSearch.parameters.format,
			},
			{
				displayName: "Use Safeguard",
				name: "useSafeguard",
				type: "boolean",
				displayOptions: {
					show: {
						operation: ["rawSearch"],
					},
				},
				default: false,
				description: toolMetadata.rawSearch.parameters.use_safeguard,
			},
			// Raw Fetch operation fields
			{
				displayName: "URL",
				name: "url",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["rawFetch"],
					},
				},
				default: "",
				description: toolMetadata.rawFetch.parameters.url,
				placeholder: "https://example.com/page",
			},
			{
				displayName: "Format",
				name: "format",
				type: "options",
				displayOptions: {
					show: {
						operation: ["rawFetch"],
					},
				},
				options: [
					{ name: "Markdown", value: "markdown" },
					{ name: "HTML", value: "html" },
				],
				default: "markdown",
				description: toolMetadata.rawFetch.parameters.format,
			},
			{
				displayName: "Use Safeguard",
				name: "useSafeguard",
				type: "boolean",
				displayOptions: {
					show: {
						operation: ["rawFetch"],
					},
				},
				default: false,
				description: toolMetadata.rawFetch.parameters.use_safeguard,
			},
			// Extract operation fields
			{
				displayName: "URL",
				name: "url",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["extract"],
					},
				},
				default: "",
				description: toolMetadata.extract.parameters.url,
				placeholder: "https://example.com/page",
			},
			{
				displayName: "Query",
				name: "query",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["extract"],
					},
				},
				default: "",
				description: toolMetadata.extract.parameters.query,
			},
			{
				displayName: "Format",
				name: "format",
				type: "options",
				displayOptions: {
					show: {
						operation: ["extract"],
					},
				},
				options: [
					{ name: "Markdown", value: "markdown" },
					{ name: "JSON", value: "json" },
				],
				default: "markdown",
				description: toolMetadata.extract.parameters.format,
			},
			{
				displayName: "Use Safeguard",
				name: "useSafeguard",
				type: "boolean",
				displayOptions: {
					show: {
						operation: ["extract"],
					},
				},
				default: false,
				description: toolMetadata.extract.parameters.use_safeguard,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get API key from credentials or environment variable
		let apiKey: string | undefined;
		try {
			const credentials = await this.getCredentials("quercleApi");
			apiKey = credentials?.apiKey as string;
		} catch {
			// Credentials not configured, try environment variable
		}

		if (!apiKey) {
			apiKey = process.env.QUERCLE_API_KEY;
		}

		if (!apiKey) {
			throw new NodeOperationError(
				this.getNode(),
				"No API key provided. Set QUERCLE_API_KEY environment variable or configure Quercle API credentials.",
			);
		}

		const client = new QuercleClient({ apiKey });

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter("operation", i) as string;
				let result: string;
				let unsafe: boolean | undefined;

				if (operation === "search") {
					const query = this.getNodeParameter("query", i) as string;
					const domainFilter = this.getNodeParameter("domainFilter", i) as string;

					const options: { allowedDomains?: string[]; blockedDomains?: string[] } = {};

					if (domainFilter !== "none") {
						const domains = (this.getNodeParameter("domains", i) as string)
							.split(",")
							.map((d) => d.trim())
							.filter((d) => d);

						if (domainFilter === "allowed") {
							options.allowedDomains = domains;
						} else {
							options.blockedDomains = domains;
						}
					}

					result = (await client.search(query, options)).result;
				} else if (operation === "fetch") {
					const url = this.getNodeParameter("url", i) as string;
					const prompt = this.getNodeParameter("prompt", i) as string;

					result = (await client.fetch(url, prompt)).result;
				} else if (operation === "rawSearch") {
					const query = this.getNodeParameter("query", i) as string;
					const format = this.getNodeParameter("format", i) as "markdown" | "json";
					const useSafeguard = this.getNodeParameter("useSafeguard", i) as boolean;

					const response = await client.rawSearch(query, { format, useSafeguard });
					result =
						typeof response.result === "string" ? response.result : JSON.stringify(response.result);
					unsafe = response.unsafe;
				} else if (operation === "rawFetch") {
					const url = this.getNodeParameter("url", i) as string;
					const format = this.getNodeParameter("format", i) as "markdown" | "html";
					const useSafeguard = this.getNodeParameter("useSafeguard", i) as boolean;

					const response = await client.rawFetch(url, { format, useSafeguard });
					result = response.result;
					unsafe = response.unsafe;
				} else if (operation === "extract") {
					const url = this.getNodeParameter("url", i) as string;
					const query = this.getNodeParameter("query", i) as string;
					const format = this.getNodeParameter("format", i) as "markdown" | "json";
					const useSafeguard = this.getNodeParameter("useSafeguard", i) as boolean;

					const response = await client.extract(url, query, { format, useSafeguard });
					result =
						typeof response.result === "string" ? response.result : JSON.stringify(response.result);
					unsafe = response.unsafe;
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				returnData.push({
					json: { result, unsafe },
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
