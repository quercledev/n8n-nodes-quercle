# @quercle/n8n

AI-powered web search, fetch, and extraction node for [n8n](https://n8n.io).

## Install

1. Go to **Settings > Community Nodes** in your n8n instance
2. Enter `@quercle/n8n-nodes-quercle`
3. Agree to the risks and install

Alternatively, install manually:

```bash
cd ~/.n8n/nodes
npm install @quercle/n8n-nodes-quercle
```

Restart n8n after manual installation.

## Setup

### Credentials

1. Get an API key from [quercle.dev](https://quercle.dev) (starts with `qk_`)
2. In n8n, go to **Credentials > New Credential**
3. Search for **Quercle API**
4. Paste your API key and save

### Environment Variable

For self-hosted n8n, you can set the API key as an environment variable instead:

```bash
export QUERCLE_API_KEY=qk_your_api_key_here
```

If both a credential and the environment variable are configured, the credential takes precedence.

## Operations

### Search

AI-synthesized web search. Returns a natural-language answer with source citations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Query | string | Yes | The search query |
| Domain Filter | options | No | `None`, `Allowed Domains`, or `Blocked Domains` |
| Domains | string | No | Comma-separated list of domains (shown when a filter is selected) |

### Fetch

Fetch a URL and analyze its content with an AI prompt. Returns a processed result based on your instructions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| URL | string | Yes | The URL to fetch |
| Prompt | string | Yes | Instructions for how to process the page content |

### Raw Search

Raw web search results without AI synthesis. Returns search results directly in your chosen format.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Query | string | Yes | The search query |
| Format | options | No | `Markdown` (default) or `JSON` |
| Use Safeguard | boolean | No | Enable content safety filtering (default: off) |

### Raw Fetch

Fetch raw page content from a URL without AI processing.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| URL | string | Yes | The URL to fetch |
| Format | options | No | `Markdown` (default) or `HTML` |
| Use Safeguard | boolean | No | Enable content safety filtering (default: off) |

### Extract

Extract relevant content from a URL based on a query. Returns only the parts of the page that match your query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| URL | string | Yes | The URL to extract from |
| Query | string | Yes | What content to extract from the page |
| Format | options | No | `Markdown` (default) or `JSON` |
| Use Safeguard | boolean | No | Enable content safety filtering (default: off) |

## Usage

All operations return a `result` field. Operations with the safeguard option also return an `unsafe` field indicating whether the content was flagged.

### Using Search in a workflow

1. Add a **Quercle** node
2. Set Operation to **Search**
3. Enter a query, optionally restrict to specific domains
4. The output `result` contains the AI-generated answer with citations

```
Operation: Search
Query: {{ $json.searchTerm }}
Domain Filter: Allowed Domains
Domains: github.com, stackoverflow.com
```

### Using Fetch in a workflow

1. Add a **Quercle** node
2. Set Operation to **Fetch**
3. Provide a URL and a prompt describing what to extract or summarize

```
Operation: Fetch
URL: {{ $json.url }}
Prompt: Extract the product name, price, and availability. Return as JSON.
```

### Using Raw Search for structured data

Choose **Raw Search** with JSON format when you need machine-readable search results for downstream processing.

```
Operation: Raw Search
Query: {{ $json.topic }}
Format: JSON
```

### Using Raw Fetch for full page content

Choose **Raw Fetch** when you need the complete page content (e.g., to feed into another AI node).

```
Operation: Raw Fetch
URL: {{ $json.url }}
Format: Markdown
```

### Using Extract for targeted content

Choose **Extract** when you only need specific information from a page.

```
Operation: Extract
URL: https://example.com/pricing
Query: pricing tiers and feature comparison
Format: JSON
```

### Using as an AI Agent tool

The Quercle node has `usableAsTool` enabled, so you can attach it directly to an n8n AI Agent node. The agent can then call Search, Fetch, or any other operation as part of its reasoning loop.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| **No API key provided** | Neither credential nor env var is set | Add a Quercle API credential or set `QUERCLE_API_KEY` |
| **401 Unauthorized** | Invalid API key | Verify your key at [quercle.dev](https://quercle.dev) |
| **402 Payment Required** | Insufficient credits | Add credits at [quercle.dev](https://quercle.dev) |
| **403 Forbidden** | Inactive account | Contact support@quercle.dev |
| **504 Gateway Timeout** | Target page is slow to respond | Retry, or try a different URL |

Enable **Continue on Fail** in the node settings to prevent a single failed item from stopping the entire workflow. Failed items return `{ "error": "error message" }` instead of throwing.

## License

MIT
