# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TypeScript SDK (`@quartz-labs/sdk`) for the Pyra Protocol on Solana — a DeFi platform built on Drift Protocol. Provides account management, deposits/withdrawals, swaps, and spend functionality.

**Naming note**: Quartz was the previous name for Pyra. The SDK still uses "Quartz" naming throughout (package name, class names, program references), but all references to "Quartz" mean Pyra.

## Commands

```bash
yarn install        # Install dependencies
yarn lint           # Lint and auto-fix with Biome
yarn build          # Install + lint + compile TypeScript (full pipeline)
yarn doc            # Generate TypeDoc documentation
yarn deploy         # Build + npm publish + generate docs
```

There is no test suite currently. Jest is configured (`jest.config.js` with ts-jest/ESM) but no test files exist.

## Architecture

### Entry Points

- `src/index.ts` — Node.js entry, re-exports browser entry + `QuartzClient` + `QuartzUser` + node-helpers
- `src/index.browser.ts` — Browser entry, exports configs/types/utils without Node-dependent code
- Package exports: `@quartz-labs/sdk` (Node) and `@quartz-labs/sdk/browser` (browser-safe)

### Core Classes

**`QuartzClient`** (`src/QuartzClient.class.ts`) — Main entry point. Initialized via `QuartzClient.fetchClient(connection)`. Manages the Drift client singleton, fetches user accounts, provides protocol-level queries (rates, open orders), and creates account initialization instructions.

**`QuartzUser`** (`src/QuartzUser.class.ts`) — Represents a user account. All transaction methods return `{ ixs, lookupTables, signers }` for building `VersionedTransaction`s. Handles deposits, timelocked withdrawals (initiate → fulfil two-step), swaps (v1 Jupiter, v2), spend transactions, and health/balance queries.

**`DriftUser`** (`src/types/classes/DriftUser.class.ts`) — Wrapper around Drift SDK's user account for balance and collateral calculations.

**`DriftClientService`** (`src/services/driftClientService.ts`) — Singleton managing a shared `DriftClient` instance.

### Key Directories

- `src/config/` — Program IDs, addresses, market index constants, and token definitions (14 supported tokens)
- `src/types/idl/` — Anchor IDL for the Pyra program (`pyra.json` + generated `pyra.ts`)
- `src/types/accounts/` — Account deserialization types (`WithdrawOrder`, `SpendLimitsOrder`)
- `src/types/interfaces/` — `Token`, `TimeLock`, `AccountMeta`, `PythResponse`
- `src/utils/accounts.ts` — PDA derivation functions (`getVaultPublicKey`, `getDriftUserPublicKey`, etc.)
- `src/utils/helpers.ts` — Transaction building (`buildTransaction`), compute unit estimation, `retryWithBackoff`, unit conversion
- `src/utils/jupiter.ts` — Jupiter swap route integration
- `src/utils/node-helpers.ts` — Node-only utilities (keypair derivation)

### Key Patterns

- **Instruction builder return type**: All `make*Ixs()` methods return `{ ixs: TransactionInstruction[], lookupTables: AddressLookupTableAccount[], signers: (Keypair | Signer)[] }`
- **MarketIndex**: A union type `1 | 0 | 5 | 22 | 28 | 3 | 6 | 19 | 8 | 32 | 11 | 45 | 4 | 57` with a const array for iteration. Used as keys in `Record<MarketIndex, T>` throughout.
- **BN.js**: All on-chain numeric values use `BN` from `bn.js`
- **Timelock security**: Withdrawals and spend limit changes require a two-step initiate/fulfil pattern with a slot-based delay
- **ESM with `.js` extensions**: All imports use `.js` extensions per `verbatimModuleSyntax` and NodeNext module resolution

## Code Style

- **Formatter/Linter**: Biome — tab indentation, double quotes, organized imports
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`, `noImplicitOverride`, `isolatedModules`
- **File naming**: `*.class.ts` for classes, `*.interface.ts` for interfaces, `*.account.ts` for account types
- **Module**: ESM (`"type": "module"` in package.json), target ES2022, NodeNext module resolution
