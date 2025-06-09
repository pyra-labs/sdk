<div align="center">
  <img width="2500" alt="Pyra" src="https://pyra.fi/open-graph.jpg" />

  <h1 style="margin-top:20px;">Pyra SDK</h1>
</div>

Typescript SDK for interacting with the Pyra Protocol. 

Install using:

```bash
yarn add @quartz-labs/sdk
# or
npm install @quartz-labs/sdk
```

There is currently an issue with dependency resolutions, so add the following to your package.json to fix:

```json
"resolutions": {
  "rpc-websockets": "9.0.4",
  "@solana/web3.js": "1.98.0"
}
```

If you want to use this SDK in a front-end, note that some Node modules don't work in the browser. Because of this, you'll normally want to import the SDK in your client side code like this:

```javascript
import * from "@quartz-labs/sdk/browser";
```

Server-side code can still be imported without the /browser path at the end, but you may need to set up your config so your web app doesn't try to bundle the problematic Node modules with the and client side code.

## Basic setup

Create a Quartz Client with:

```javascript
import { QuartzClient } from "@quartz-labs/sdk";
import { Connection } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const client = QuartzClient.fetchClient(connection);
```

The majority of this SDK can then be accessed through the client, eg:

```javascript
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const depositApy = client.getDepositRate(marketIndex);
const createAccountInstructions = client.makeInitQuartzUserIxs(address);

const user = client.getQuartzAccount(address);
const health = user.getHealth();
const stablecoinBalances = user.getMultipleTokenBalances(stablecoinIndices);
const depositInstructions = user.makeDepositIx(
  LAMPORTS_PER_SOL,
  marketIndexSol,
  true // true = can change position from loan <-> collateral, false = will limit amount deposited to prevent this
);
```

## Links

Website: [pyra.fi](https://pyra.fi/)

Docs: [docs.pyra.fi](https://docs.pyra.fi/)

X: [@GetPyra](https://x.com/GetPyra)

Discord: [discord.gg/GetPyra](https:discord.gg/GetPyra)

Contact: [diego@pyra.fi](mailto:diego@pyra.fi)
