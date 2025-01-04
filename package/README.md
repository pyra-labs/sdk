<div align="center">
  <img width="2500" alt="Quartz" src="https://cdn.prod.website-files.com/65707af0f4af991289bbd432/670e37661cdb2314fe8ba469_logo-glow-banner.jpg" />

  <h1 style="margin-top:20px;">Quartz SDK</h1>
</div>

Typescript SDK for interacting with the Quartz Protocol. 

Install using:

```bash
yarn add @quartz-labs/sdk
# or
npm install @quartz-labs/sdk
```

There is currently an issue with dependancy resolutions, so add the following to your package.json to fix:

```json
"resolutions": {
  "rpc-websockets": "^9.0.4",
  "@solana/web3.js": "^1.95.8"
}
```

If you want to use this SDK in a front-end, note that some Node modules don't work in the browser. Because of this, you'll normally want to import the SDK in your client side code like this:

```javascript
import * from "@quartz-labs/sdk/browser";
```

Server-side code can still be imported without the /browser path at the end, but you may need to set up your config so your web app doesn't try to bundle the problematic Node modules with the and client side code.

## Links

Website and waitlist: [quartzpay.io](https://quartzpay.io/)

Docs: [docs.quartzpay.io](https://docs.quartzpay.io/)

X: [@quartzpay](https://x.com/quartzpay)

Contact: [iarla@quartzpay.io](mailto:diego@quartzpay.io)
