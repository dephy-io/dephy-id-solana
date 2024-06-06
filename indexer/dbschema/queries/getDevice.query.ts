// GENERATED by @edgedb/generate v0.5.3

import type {Executor} from "edgedb";

export type GetDeviceArgs = {
  readonly "pubkey": string;
};

export type GetDeviceReturns = {
  "pubkey": string;
  "signing_alg": ("Ed25519" | "Secp256k1");
  "token_account": string;
  "block_ts": Date | null;
  "did": {
    "token_account": string | null;
    "mint_account": string;
    "owner": {
      "pubkey": string;
    } | null;
    "metadata": {
      "name": string | null;
      "uri": string | null;
      "symbol": string | null;
      "additional": Array<[string, string]>;
    } | null;
  } | null;
  "product": {
    "mint_account": string;
    "metadata": {
      "name": string | null;
      "symbol": string | null;
      "uri": string | null;
      "additional": Array<[string, string]>;
    } | null;
    "vendor": {
      "pubkey": string;
    };
  };
} | null;

export function getDevice(client: Executor, args: GetDeviceArgs): Promise<GetDeviceReturns> {
  return client.querySingle(`\
select default::Device {
  pubkey,
  signing_alg,
  token_account,
  block_ts := .tx.block_ts,
  did: {
    token_account,
    mint_account,
    owner: {
      pubkey
    },
    metadata: {
      name,
      uri,
      symbol,
      additional
    }
  },
  product: {
    mint_account,
    metadata: {
      name,
      symbol,
      uri,
      additional
    },
    vendor: {
      pubkey
    }
  }
}
filter .pubkey = <str>$pubkey`, args);

}
