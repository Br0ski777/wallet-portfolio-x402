import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

// --- RPC Config ---
const RPC_URLS: Record<string, string> = {
  base: "https://mainnet.base.org",
  ethereum: "https://ethereum-rpc.publicnode.com",
};

const USDC_CONTRACTS: Record<string, string> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
};

// Top ERC-20 tokens to check (address per chain)
const TOKEN_LIST: Record<string, { symbol: string; decimals: number; coingeckoId: string; contracts: Record<string, string> }> = {
  USDC: {
    symbol: "USDC", decimals: 6, coingeckoId: "usd-coin",
    contracts: {
      base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
  },
  USDT: {
    symbol: "USDT", decimals: 6, coingeckoId: "tether",
    contracts: {
      ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
  },
  DAI: {
    symbol: "DAI", decimals: 18, coingeckoId: "dai",
    contracts: {
      base: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      ethereum: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
  },
  WETH: {
    symbol: "WETH", decimals: 18, coingeckoId: "weth",
    contracts: {
      base: "0x4200000000000000000000000000000000000006",
      ethereum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
  },
  WBTC: {
    symbol: "WBTC", decimals: 8, coingeckoId: "wrapped-bitcoin",
    contracts: {
      base: "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b",
      ethereum: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    },
  },
  cbETH: {
    symbol: "cbETH", decimals: 18, coingeckoId: "coinbase-wrapped-staked-eth",
    contracts: {
      base: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      ethereum: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
    },
  },
  AERO: {
    symbol: "AERO", decimals: 18, coingeckoId: "aerodrome-finance",
    contracts: {
      base: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    },
  },
  DEGEN: {
    symbol: "DEGEN", decimals: 18, coingeckoId: "degen-base",
    contracts: {
      base: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    },
  },
};

// --- Price cache ---
let priceCache: { prices: Record<string, number>; ts: number } = { prices: {}, ts: 0 };
const PRICE_TTL = 60_000; // 60s

async function getUsdPrices(): Promise<Record<string, number>> {
  if (Date.now() - priceCache.ts < PRICE_TTL && Object.keys(priceCache.prices).length > 0) {
    return priceCache.prices;
  }
  try {
    const ids = ["ethereum", ...new Set(Object.values(TOKEN_LIST).map(t => t.coingeckoId))].join(",");
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, {
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json() as Record<string, { usd: number }>;
    const prices: Record<string, number> = {};
    for (const [id, val] of Object.entries(data)) {
      prices[id] = val.usd;
    }
    priceCache = { prices, ts: Date.now() };
    return prices;
  } catch (e) {
    // Return stale cache or defaults
    if (Object.keys(priceCache.prices).length > 0) return priceCache.prices;
    return { ethereum: 2500, "usd-coin": 1, tether: 1, dai: 1, weth: 2500, "wrapped-bitcoin": 65000 };
  }
}

// --- RPC helpers ---
async function rpcCall(rpcUrl: string, method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json() as { result?: unknown; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function getEthBalance(rpcUrl: string, address: string): Promise<bigint> {
  const hex = (await rpcCall(rpcUrl, "eth_getBalance", [address, "latest"])) as string;
  return BigInt(hex);
}

// ERC-20 balanceOf(address) selector = 0x70a08231
async function getTokenBalance(rpcUrl: string, tokenContract: string, walletAddress: string): Promise<bigint> {
  const paddedAddress = walletAddress.toLowerCase().replace("0x", "").padStart(64, "0");
  const data = `0x70a08231${paddedAddress}`;
  const hex = (await rpcCall(rpcUrl, "eth_call", [{ to: tokenContract, data }, "latest"])) as string;
  return BigInt(hex || "0x0");
}

function formatBalance(raw: bigint, decimals: number): string {
  const str = raw.toString().padStart(decimals + 1, "0");
  const intPart = str.slice(0, str.length - decimals) || "0";
  const decPart = str.slice(str.length - decimals).slice(0, 6);
  return `${intPart}.${decPart}`;
}

function isValidAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

// --- Route handlers ---
export function registerRoutes(app: Hono) {
  async function handlePortfolio(
    c: any,
    params: { address?: string; chain?: string }
  ) {
    await tryRequirePayment(0.003);
    const address = params.address;
    const chain = (params.chain || "base").toLowerCase();

    if (!address || !isValidAddress(address)) {
      return c.json({ error: "Invalid or missing address parameter. Must be 0x + 40 hex chars." }, 400);
    }
    if (!RPC_URLS[chain]) {
      return c.json({ error: `Unsupported chain: ${chain}. Use 'base' or 'ethereum'.` }, 400);
    }

    const rpcUrl = RPC_URLS[chain];

    try {
      const [ethBalanceRaw, prices] = await Promise.all([
        getEthBalance(rpcUrl, address),
        getUsdPrices(),
      ]);

      const ethBalance = formatBalance(ethBalanceRaw, 18);
      const ethPrice = prices["ethereum"] || 0;
      const ethUsd = parseFloat(ethBalance) * ethPrice;

      // Fetch all token balances in parallel
      const tokenEntries = Object.values(TOKEN_LIST).filter(t => t.contracts[chain]);
      const tokenBalances = await Promise.all(
        tokenEntries.map(async (token) => {
          try {
            const raw = await getTokenBalance(rpcUrl, token.contracts[chain], address);
            const balance = formatBalance(raw, token.decimals);
            const balanceNum = parseFloat(balance);
            const price = prices[token.coingeckoId] || 0;
            return {
              symbol: token.symbol,
              contract: token.contracts[chain],
              balance,
              balanceRaw: raw.toString(),
              priceUsd: price,
              valueUsd: Math.round(balanceNum * price * 100) / 100,
            };
          } catch {
            return null;
          }
        })
      );

      const tokens = tokenBalances.filter((t): t is NonNullable<typeof t> => t !== null && parseFloat(t.balance) > 0);
      const totalTokensUsd = tokens.reduce((sum, t) => sum + t.valueUsd, 0);
      const totalPortfolioUsd = Math.round((ethUsd + totalTokensUsd) * 100) / 100;

      return c.json({
        address,
        chain,
        nativeBalance: {
          symbol: "ETH",
          balance: ethBalance,
          priceUsd: ethPrice,
          valueUsd: Math.round(ethUsd * 100) / 100,
        },
        tokens,
        totalPortfolioUsd,
        tokenCount: tokens.length,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      return c.json({ error: "RPC error: " + e.message }, 502);
    }
  }

  async function handleBalance(
    c: any,
    params: { address?: string; chain?: string }
  ) {
    await tryRequirePayment(0.001);
    const address = params.address;
    const chain = (params.chain || "base").toLowerCase();

    if (!address || !isValidAddress(address)) {
      return c.json({ error: "Invalid or missing address parameter. Must be 0x + 40 hex chars." }, 400);
    }
    if (!RPC_URLS[chain]) {
      return c.json({ error: `Unsupported chain: ${chain}. Use 'base' or 'ethereum'.` }, 400);
    }

    const rpcUrl = RPC_URLS[chain];
    const usdcContract = USDC_CONTRACTS[chain];

    try {
      const [ethBalanceRaw, usdcBalanceRaw, prices] = await Promise.all([
        getEthBalance(rpcUrl, address),
        getTokenBalance(rpcUrl, usdcContract, address),
        getUsdPrices(),
      ]);

      const ethBalance = formatBalance(ethBalanceRaw, 18);
      const usdcBalance = formatBalance(usdcBalanceRaw, 6);
      const ethPrice = prices["ethereum"] || 0;
      const ethUsd = parseFloat(ethBalance) * ethPrice;
      const usdcUsd = parseFloat(usdcBalance) * (prices["usd-coin"] || 1);

      return c.json({
        address,
        chain,
        eth: {
          balance: ethBalance,
          priceUsd: ethPrice,
          valueUsd: Math.round(ethUsd * 100) / 100,
        },
        usdc: {
          balance: usdcBalance,
          valueUsd: Math.round(usdcUsd * 100) / 100,
        },
        totalUsd: Math.round((ethUsd + usdcUsd) * 100) / 100,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      return c.json({ error: "RPC error: " + e.message }, 502);
    }
  }

  app.get("/api/portfolio", async (c) => {
    return handlePortfolio(c, {
      address: c.req.query("address"),
      chain: c.req.query("chain"),
    });
  });

  // POST mirror of the GET route above -- Bazaar (CDP) only reliably indexes
  // POST payments with valid payloads (~82% conversion vs ~14% for GET-only
  // resources, confirmed empirically). Same params, same logic, just body
  // instead of query string.
  app.post("/api/portfolio", async (c) => {
    const body = await c.req.json().catch(() => ({}) as any);
    return handlePortfolio(c, {
      address: body.address,
      chain: body.chain,
    });
  });

  app.get("/api/balance", async (c) => {
    return handleBalance(c, {
      address: c.req.query("address"),
      chain: c.req.query("chain"),
    });
  });

  // POST mirror of the GET route above -- Bazaar (CDP) only reliably indexes
  // POST payments with valid payloads (~82% conversion vs ~14% for GET-only
  // resources, confirmed empirically). Same params, same logic, just body
  // instead of query string.
  app.post("/api/balance", async (c) => {
    const body = await c.req.json().catch(() => ({}) as any);
    return handleBalance(c, {
      address: body.address,
      chain: body.chain,
    });
  });
}
