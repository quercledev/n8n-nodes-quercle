import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";

const BASE_URL = "https://api.quercle.dev";

const TOOL_DESCRIPTIONS = {
	SEARCH:
		"Search the web and get an AI-synthesized answer with citations. The response includes the answer and source URLs that can be fetched for further investigation. Optionally filter by allowed or blocked domains.",
	FETCH:
		"Fetch a web page and analyze its content using AI. Provide a URL and a prompt describing what information you want to extract or how to analyze the content. The raw HTML is NOT returned - only the AI's analysis based on your prompt.",
};

const FIELD_DESCRIPTIONS = {
	SEARCH_QUERY: "The search query to find information about. Be specific",
	FETCH_URL: "The URL to fetch and analyze",
	FETCH_PROMPT:
		"Instructions for how to analyze the page content. Be specific about what information you want to extract",
	ALLOWED_DOMAINS: "Only include results from these domains (e.g., 'example.com, *.example.org')",
};

export class Quercle implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Quercle",
		name: "quercle",
		icon: "file:quercle.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "AI-powered web search and fetch",
		defaults: {
			name: "Quercle",
		},
		inputs: ["main"],
		outputs: ["main"],
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
						description: TOOL_DESCRIPTIONS.SEARCH,
						action: "Perform AI powered web search",
					},
					{
						name: "Fetch",
						value: "fetch",
						description: TOOL_DESCRIPTIONS.FETCH,
						action: "Fetch and process content from a URL",
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
				description: FIELD_DESCRIPTIONS.SEARCH_QUERY,
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
				description: FIELD_DESCRIPTIONS.ALLOWED_DOMAINS,
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
				description: FIELD_DESCRIPTIONS.FETCH_URL,
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
				description: FIELD_DESCRIPTIONS.FETCH_PROMPT,
				typeOptions: {
					rows: 4,
				},
				placeholder: "Extract the main article content and summarize it",
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

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter("operation", i) as string;
				let response: { result: string };

				const headers = {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				};

				if (operation === "search") {
					const query = this.getNodeParameter("query", i) as string;
					const domainFilter = this.getNodeParameter("domainFilter", i) as string;

					const body: {
						query: string;
						allowed_domains?: string[];
						blocked_domains?: string[];
					} = { query };

					if (domainFilter !== "none") {
						const domains = (this.getNodeParameter("domains", i) as string)
							.split(",")
							.map((d) => d.trim())
							.filter((d) => d);

						if (domainFilter === "allowed") {
							body.allowed_domains = domains;
						} else {
							body.blocked_domains = domains;
						}
					}

					response = await this.helpers.httpRequest({
						method: "POST",
						url: `${BASE_URL}/v1/search`,
						headers,
						body,
						json: true,
					});
				} else if (operation === "fetch") {
					const url = this.getNodeParameter("url", i) as string;
					const prompt = this.getNodeParameter("prompt", i) as string;

					response = await this.helpers.httpRequest({
						method: "POST",
						url: `${BASE_URL}/v1/fetch`,
						headers,
						body: { url, prompt },
						json: true,
					});
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				returnData.push({
					json: { result: response.result },
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
