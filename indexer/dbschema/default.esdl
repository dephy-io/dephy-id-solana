using extension graphql;

module default {
    type Transaction {
        required signature: str {
            constraint exclusive;
        };
        required slot: bigint;
        err: str;
        block_ts: datetime;
        required processed: bool {
            default := false;
        };
    }

    type TokenMetadata {
        name: str;
        symbol: str;
        required uri: str;
        required additional: array<tuple<str, str>>;
    }

    # TODO: maybe more account metadata
    abstract type SolanaAccount {
        required pubkey: str {
            constraint exclusive;
        };
    }

    abstract type SplMint {
        required mint_account: str {
            constraint exclusive;
        };

        mint_authority: str;

        metadata: TokenMetadata;
    }

    abstract type SplAccount {
        token_account: str {
            constraint exclusive;
        };
    }

    abstract type WithIx {
        required tx: Transaction {
            ix_index: int16;
        }
    }

    type Admin extending SolanaAccount {
    }

    type Program extending SolanaAccount, WithIx {
        required authority: Admin;
    }

    type Vendor extending SolanaAccount, SplMint, SplAccount, WithIx {
        overloaded required token_account: str {
            constraint exclusive;
        };

        multi products := .<vendor[is Product];
    }

    type Product extending SplMint, WithIx {
        required vendor: Vendor;

        multi devices := .<product[is Device];
    }

    scalar type DeviceSigningAlgorithm extending enum<Ed25519, Secp256k1>;

    type Device extending SolanaAccount, SplAccount, WithIx {
        required product: Product;
        required signing_alg: DeviceSigningAlgorithm;
        overloaded required token_account: str {
            constraint exclusive;
        };

        single did := .<device[is DID];
    }

    type User extending SolanaAccount {
        multi dids := .<owner[is DID];
    }

    type DID extending SplMint, SplAccount, WithIx {
        required device: Device {
            constraint exclusive;
        };

        owner: User;
    }
}
