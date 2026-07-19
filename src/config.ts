import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "wallet-portfolio",
  slug: "wallet-portfolio",
  description: "Full crypto wallet holdings across chains -- ETH, ERC-20 tokens, USD values. Portfolio tracking for agents.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/portfolio",
      price: "$0.008",
      description: "Get full portfolio with all token balances and USD values",
      toolName: "wallet_get_portfolio",
      toolDescription: `Use this when you need to check a crypto wallet's holdings across chains. Returns a full portfolio breakdown in JSON.

1. nativeBalance: ETH balance with USD value
2. tokens: array of ERC-20 tokens with symbol, balance, USD value, contract address
3. totalValueUsd: aggregate portfolio value in USD
4. chain: which network was queried

Example output: {"nativeBalance":{"symbol":"ETH","balance":"1.234","valueUsd":3827.50},"tokens":[{"symbol":"USDC","balance":"500.00","valueUsd":500.00}],"totalValueUsd":4327.50,"chain":"base"}

Use this BEFORE executing a swap to verify the wallet has sufficient balance. Essential for portfolio tracking, balance checks, and agent self-reporting.

Do NOT use for gas prices -- use gas_get_current_price instead. Do NOT use for swap quotes -- use dex_get_swap_quote instead. Do NOT use for yield opportunities -- use defi_find_best_yields instead.`,
      inputSchema: {
        type: "object",
        properties: {
          address: { type: "string", description: "Wallet address (0x...)" },
          chain: {
            type: "string",
            enum: ["base", "ethereum"],
            description: "Blockchain network (default: base)",
          },
        },
        required: ["address"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "address": {
              "type": "string",
              "description": "Wallet address"
            },
            "chain": {
              "type": "string",
              "description": "Blockchain"
            },
            "nativeBalance": {
              "type": "object",
              "properties": {
                "symbol": {
                  "type": "string"
                },
                "balance": {
                  "type": "string"
                },
                "priceUsd": {
                  "type": "number"
                },
                "valueUsd": {
                  "type": "number"
                }
              }
            },
            "tokens": {
              "type": "array",
              "items": {
                "type": "object"
              }
            },
            "totalPortfolioUsd": {
              "type": "number"
            },
            "tokenCount": {
              "type": "number"
            },
            "timestamp": {
              "type": "string"
            }
          },
          "required": [
            "address",
            "chain",
            "totalPortfolioUsd"
          ]
        },
    },
    {
      method: "POST",
      path: "/api/portfolio",
      price: "$0.008",
      description: "Get full portfolio with all token balances and USD values (POST variant)",
      toolName: "wallet_get_portfolio",
      toolDescription: `Use this when you need to check a crypto wallet's holdings across chains. Returns a full portfolio breakdown in JSON.

1. nativeBalance: ETH balance with USD value
2. tokens: array of ERC-20 tokens with symbol, balance, USD value, contract address
3. totalValueUsd: aggregate portfolio value in USD
4. chain: which network was queried

Example output: {"nativeBalance":{"symbol":"ETH","balance":"1.234","valueUsd":3827.50},"tokens":[{"symbol":"USDC","balance":"500.00","valueUsd":500.00}],"totalValueUsd":4327.50,"chain":"base"}

Use this BEFORE executing a swap to verify the wallet has sufficient balance. Essential for portfolio tracking, balance checks, and agent self-reporting.

Do NOT use for gas prices -- use gas_get_current_price instead. Do NOT use for swap quotes -- use dex_get_swap_quote instead. Do NOT use for yield opportunities -- use defi_find_best_yields instead.`,
      inputSchema: {
        type: "object",
        properties: {
          address: { type: "string", description: "Wallet address (0x...)" },
          chain: {
            type: "string",
            enum: ["base", "ethereum"],
            description: "Blockchain network (default: base)",
          },
        },
        required: ["address"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "address": {
              "type": "string",
              "description": "Wallet address"
            },
            "chain": {
              "type": "string",
              "description": "Blockchain"
            },
            "nativeBalance": {
              "type": "object",
              "properties": {
                "symbol": {
                  "type": "string"
                },
                "balance": {
                  "type": "string"
                },
                "priceUsd": {
                  "type": "number"
                },
                "valueUsd": {
                  "type": "number"
                }
              }
            },
            "tokens": {
              "type": "array",
              "items": {
                "type": "object"
              }
            },
            "totalPortfolioUsd": {
              "type": "number"
            },
            "tokenCount": {
              "type": "number"
            },
            "timestamp": {
              "type": "string"
            }
          },
          "required": [
            "address",
            "chain",
            "totalPortfolioUsd"
          ]
        },
    },
    {
      method: "GET",
      path: "/api/balance",
      price: "$0.003",
      description: "Get ETH and USDC balance only",
      toolName: "wallet_get_balance",
      toolDescription: `Use this when you need a quick check of a wallet's ETH and USDC balance only. Returns a lightweight JSON response -- cheaper than full portfolio.

1. ethBalance: native ETH balance with USD value
2. usdcBalance: USDC balance with USD value
3. chain: which network was queried

Example output: {"ethBalance":{"balance":"2.5","valueUsd":7750.00},"usdcBalance":{"balance":"1000.00","valueUsd":1000.00},"chain":"base"}

Use this FOR quick pre-trade balance verification when you only care about ETH and USDC. Faster and cheaper than wallet_get_portfolio.

Do NOT use for full portfolio with all tokens -- use wallet_get_portfolio instead. Do NOT use for gas prices -- use gas_get_current_price instead.`,
      inputSchema: {
        type: "object",
        properties: {
          address: { type: "string", description: "Wallet address (0x...)" },
          chain: {
            type: "string",
            enum: ["base", "ethereum"],
            description: "Blockchain network (default: base)",
          },
        },
        required: ["address"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "address": {
              "type": "string"
            },
            "chain": {
              "type": "string"
            },
            "eth": {
              "type": "object",
              "properties": {
                "balance": {
                  "type": "string"
                },
                "priceUsd": {
                  "type": "number"
                },
                "valueUsd": {
                  "type": "number"
                }
              }
            }
          },
          "required": [
            "address",
            "chain",
            "eth"
          ]
        },
    },
    {
      method: "POST",
      path: "/api/balance",
      price: "$0.003",
      description: "Get ETH and USDC balance only (POST variant)",
      toolName: "wallet_get_balance",
      toolDescription: `Use this when you need a quick check of a wallet's ETH and USDC balance only. Returns a lightweight JSON response -- cheaper than full portfolio.

1. ethBalance: native ETH balance with USD value
2. usdcBalance: USDC balance with USD value
3. chain: which network was queried

Example output: {"ethBalance":{"balance":"2.5","valueUsd":7750.00},"usdcBalance":{"balance":"1000.00","valueUsd":1000.00},"chain":"base"}

Use this FOR quick pre-trade balance verification when you only care about ETH and USDC. Faster and cheaper than wallet_get_portfolio.

Do NOT use for full portfolio with all tokens -- use wallet_get_portfolio instead. Do NOT use for gas prices -- use gas_get_current_price instead.`,
      inputSchema: {
        type: "object",
        properties: {
          address: { type: "string", description: "Wallet address (0x...)" },
          chain: {
            type: "string",
            enum: ["base", "ethereum"],
            description: "Blockchain network (default: base)",
          },
        },
        required: ["address"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "address": {
              "type": "string"
            },
            "chain": {
              "type": "string"
            },
            "eth": {
              "type": "object",
              "properties": {
                "balance": {
                  "type": "string"
                },
                "priceUsd": {
                  "type": "number"
                },
                "valueUsd": {
                  "type": "number"
                }
              }
            }
          },
          "required": [
            "address",
            "chain",
            "eth"
          ]
        },
    },
  ],
};
