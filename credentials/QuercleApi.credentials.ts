import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from "n8n-workflow";

const BASE_URL = "https://api.quercle.dev";

export class QuercleApi implements ICredentialType {
	name = "quercleApi";
	displayName = "Quercle API";
	documentationUrl = "https://quercle.dev/docs";
	properties: INodeProperties[] = [
		{
			displayName: "API Key",
			name: "apiKey",
			type: "string",
			typeOptions: { password: true },
			default: "",
			required: true,
			description:
				"Your Quercle API key (starts with qk_). Can also be set via QUERCLE_API_KEY environment variable.",
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: "generic",
		properties: {
			headers: {
				Authorization: "=Bearer {{$credentials.apiKey}}",
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: BASE_URL,
			url: "/v1/search",
			method: "POST",
			body: {
				query: "test",
			},
		},
	};
}
