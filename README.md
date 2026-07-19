# Wallet Portfolio Tracker API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://wallet-portfolio.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Full crypto wallet holdings across chains -- ETH, ERC-20 tokens, USD values. Portfolio tracking for agents. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "wallet-portfolio": {
      "url": "https://wallet-portfolio.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl "https://wallet-portfolio.api.klymax402.com/api/portfolio?address=0x0000000000000000000000000000000000dEaD"
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `wallet_get_portfolio` | GET | `/api/portfolio` | $0.008 | Get full portfolio with all token balances and USD values |
| `wallet_get_portfolio` | POST | `/api/portfolio` | $0.008 | Get full portfolio with all token balances and USD values (POST variant) |
| `wallet_get_balance` | GET | `/api/balance` | $0.003 | Get ETH and USDC balance only |
| `wallet_get_balance` | POST | `/api/balance` | $0.003 | Get ETH and USDC balance only (POST variant) |

### `wallet_get_portfolio`

Use this when you need to check a crypto wallet's holdings across chains. Returns a full portfolio breakdown in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `address` | string | yes | Wallet address (0x...) |
| `chain` | string | no | Blockchain network (default: base) |

**Returns**

- `nativeBalance` -- ETH balance with USD value
- `tokens` -- array of ERC-20 tokens with symbol, balance, USD value, contract address
- `totalValueUsd` -- aggregate portfolio value in USD
- `chain` -- which network was queried

Example response:

```json
{"nativeBalance":{"symbol":"ETH","balance":"1.234","valueUsd":3827.50},"tokens":[{"symbol":"USDC","balance":"500.00","valueUsd":500.00}],"totalValueUsd":4327.50,"chain":"base"}
```

**When to use**: executing a swap to verify the wallet has sufficient balance. Essential for portfolio tracking, balance checks, and agent self-reporting.

**Not for**: gas prices (use `gas_get_current_price`), swap quotes (use `dex_get_swap_quote`), yield opportunities (use `defi_find_best_yields`).

### `wallet_get_portfolio`

Use this when you need to check a crypto wallet's holdings across chains. Returns a full portfolio breakdown in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `address` | string | yes | Wallet address (0x...) |
| `chain` | string | no | Blockchain network (default: base) |

**Returns**

- `nativeBalance` -- ETH balance with USD value
- `tokens` -- array of ERC-20 tokens with symbol, balance, USD value, contract address
- `totalValueUsd` -- aggregate portfolio value in USD
- `chain` -- which network was queried

Example response:

```json
{"nativeBalance":{"symbol":"ETH","balance":"1.234","valueUsd":3827.50},"tokens":[{"symbol":"USDC","balance":"500.00","valueUsd":500.00}],"totalValueUsd":4327.50,"chain":"base"}
```

**When to use**: executing a swap to verify the wallet has sufficient balance. Essential for portfolio tracking, balance checks, and agent self-reporting.

**Not for**: gas prices (use `gas_get_current_price`), swap quotes (use `dex_get_swap_quote`), yield opportunities (use `defi_find_best_yields`).

### `wallet_get_balance`

Use this when you need a quick check of a wallet's ETH and USDC balance only. Returns a lightweight JSON response -- cheaper than full portfolio.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `address` | string | yes | Wallet address (0x...) |
| `chain` | string | no | Blockchain network (default: base) |

**Returns**

- `ethBalance` -- native ETH balance with USD value
- `usdcBalance` -- USDC balance with USD value
- `chain` -- which network was queried

Example response:

```json
{"ethBalance":{"balance":"2.5","valueUsd":7750.00},"usdcBalance":{"balance":"1000.00","valueUsd":1000.00},"chain":"base"}
```

**When to use**: quick pre-trade balance verification when you only care about ETH and USDC. Faster and cheaper than wallet_get_portfolio.

**Not for**: full portfolio with all tokens (use `wallet_get_portfolio`), gas prices (use `gas_get_current_price`).

### `wallet_get_balance`

Use this when you need a quick check of a wallet's ETH and USDC balance only. Returns a lightweight JSON response -- cheaper than full portfolio.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `address` | string | yes | Wallet address (0x...) |
| `chain` | string | no | Blockchain network (default: base) |

**Returns**

- `ethBalance` -- native ETH balance with USD value
- `usdcBalance` -- USDC balance with USD value
- `chain` -- which network was queried

Example response:

```json
{"ethBalance":{"balance":"2.5","valueUsd":7750.00},"usdcBalance":{"balance":"1000.00","valueUsd":1000.00},"chain":"base"}
```

**When to use**: quick pre-trade balance verification when you only care about ETH and USDC. Faster and cheaper than wallet_get_portfolio.

**Not for**: full portfolio with all tokens (use `wallet_get_portfolio`), gas prices (use `gas_get_current_price`).

## Example agent prompts

- "Check a crypto wallet's holdings across chains"
- "Check a crypto wallet's holdings across chains"
- "A quick check of a wallet's ETH and USDC balance only"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
