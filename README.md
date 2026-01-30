# @quercle/n8n-nodes-quercle

AI-powered web search and fetch nodes for [n8n](https://n8n.io).

## Features

- **Search**: Perform AI-powered web searches with optional domain filtering
- **Fetch**: Fetch and process web content with custom AI instructions

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `@quercle/n8n-nodes-quercle`
4. Agree to the risks and select **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install @quercle/n8n-nodes-quercle
```

Then restart n8n.

## Authentication

You can provide your API key in two ways:

### Option 1: Environment Variable (Recommended for self-hosted)

Set the `QUERCLE_API_KEY` environment variable:

```bash
export QUERCLE_API_KEY=qk_your_api_key_here
```

### Option 2: n8n Credentials

1. Get your API key from [Quercle Dashboard](https://quercle.dev)
2. In n8n, go to **Credentials** and create new credentials
3. Search for **Quercle API**
4. Enter your API key (starts with `qk_`)

**Note:** If both are configured, the n8n credential takes precedence.

## Operations

### Search

Perform AI-powered web search that returns synthesized answers with source citations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Query | string | Yes | The search query |
| Domain Filter | options | No | Filter by allowed or blocked domains |
| Domains | string | No | Comma-separated list of domains (when filter is set) |

**Example Use Cases:**
- Research competitors and market trends
- Find documentation and technical answers
- Gather news and updates on specific topics

### Fetch

Fetch content from a URL and process it with custom AI instructions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| URL | string | Yes | The URL to fetch |
| Prompt | string | Yes | Instructions for processing the content |

**Example Use Cases:**
- Extract structured data from web pages
- Summarize articles and documentation
- Monitor pricing or product information

## Workflow Examples

### Example 1: Research Pipeline

Create a workflow that researches a topic and sends a summary:

1. **Manual Trigger** - Start the workflow
2. **Quercle (Search)** - Search for "latest AI developments 2025"
3. **Send Email** - Send the search results

### Example 2: Content Monitoring

Monitor a webpage for changes and extract key information:

1. **Schedule Trigger** - Run every hour
2. **Quercle (Fetch)** - Fetch URL with prompt "Extract the main headline and any price changes"
3. **IF** - Check if content changed
4. **Slack** - Send notification

### Example 3: Multi-Source Research

Research from multiple sources with domain filtering:

1. **Manual Trigger**
2. **Quercle (Search)** - Query with allowed domains: `github.com, stackoverflow.com`
3. **Quercle (Search)** - Query with allowed domains: `docs.python.org, pypi.org`
4. **Merge** - Combine results
5. **OpenAI** - Synthesize findings

### Example 4: Web Scraping Pipeline

Extract and process data from multiple pages:

1. **Spreadsheet** - List of URLs to process
2. **Loop Over Items**
3. **Quercle (Fetch)** - Process each URL with extraction prompt
4. **Google Sheets** - Save extracted data

## Node Configuration

### Search Node

```
Operation: Search
Query: {{ $json.searchTerm }}
Domain Filter: Allowed Domains
Domains: example.com, docs.example.com
```

### Fetch Node

```
Operation: Fetch
URL: {{ $json.url }}
Prompt: Extract the product name, price, and availability status. Return as JSON.
```

## Working with Expressions

Use n8n expressions to make your queries dynamic:

**Dynamic Search Query:**
```
Query: latest news about {{ $json.company }} {{ $json.topic }}
```

**Dynamic URL:**
```
URL: https://example.com/products/{{ $json.productId }}
```

**Dynamic Prompt:**
```
Prompt: Extract {{ $json.fields.join(', ') }} from this page
```

## Error Handling

The node supports n8n's "Continue on Fail" option. When enabled:
- Failed items return `{ "error": "error message" }` instead of stopping the workflow
- Other items continue processing normally

Common errors:
- **401**: Invalid API key - check your credentials
- **402**: Insufficient credits - add credits at quercle.dev
- **403**: Inactive account - contact support
- **504**: Request timeout - the page may be slow to respond

## Best Practices

1. **Use Domain Filters** - When searching for specific sources, use allowed domains to get more relevant results
2. **Be Specific in Prompts** - Clear instructions in fetch prompts produce better results
3. **Handle Errors** - Enable "Continue on Fail" for batch processing
4. **Cache Results** - For repeated queries, consider caching with n8n's built-in caching

## Requirements

- n8n >= 1.0.0
- Quercle API key ([get one here](https://quercle.dev))

## Resources

- [Quercle Documentation](https://quercle.dev/docs)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [n8n Expressions](https://docs.n8n.io/code/expressions/)

## License

MIT
