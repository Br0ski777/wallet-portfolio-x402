import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "wallet-portfolio",
  slug: "wallet-portfolio",
  description: "Check crypto wallet holdings across chains — ETH balance, ERC-20 tokens, USD values.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/portfolio",
      price: "$0.003",
      description: "Get full portfolio with all token balances and USD values",
      toolName: "wallet_get_portfolio",
      toolDescription: "Use this when you need to check a crypto wallet's holdings. Returns ETH balance, USDC balance, all ERC-20 token balances with USD values, total portfolio value. Supports Base, Ethereum mainnet. Do NOT use for transaction history — use wallet_get_transactions instead. Ideal for portfolio tracking, balance checks before trading, agent self-reporting.",
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
    },
    {
      method: "GET",
      path: "/api/balance",
      price: "$0.001",
      description: "Get ETH and USDC balance only",
      toolName: "wallet_get_balance",
      toolDescription: "Use this when you need a quick check of a wallet's ETH and USDC balance. Lighter and cheaper than full portfolio. Returns native ETH balance and USDC balance with USD values. Supports Base, Ethereum mainnet. Do NOT use if you need all token balances — use wallet_get_portfolio instead.",
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
    },
  ],
};
