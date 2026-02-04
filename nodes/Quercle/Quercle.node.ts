import { FIELD_DESCRIPTIONS, QuercleClient, TOOL_DESCRIPTIONS } from "@quercle/sdk";
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

		const client = new QuercleClient({ apiKey });

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter("operation", i) as string;
				let result: string;

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

					result = await client.search(query, options);
				} else if (operation === "fetch") {
					const url = this.getNodeParameter("url", i) as string;
					const prompt = this.getNodeParameter("prompt", i) as string;

					result = await client.fetch(url, prompt);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				returnData.push({
					json: { result },
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
