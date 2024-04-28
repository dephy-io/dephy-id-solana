using extension graphql;

module default {
    type Transaction {
        required signature: str {
            constraint exclusive;
        };
        required slot: bigint;
        err: str;
        required processed: bool {
            default := false;
        };
    }

    type TokenMetadata {
        required name: str;
        required symbol: str;
        required uri: str;
        required additional: array<tuple<str, str>>;
    }

    type Vendor {
        required pubkey: str {
            constraint exclusive;
        };
        required mint_account: str  {
            constraint exclusive;
        };
        required token_account: str;
        metadata: TokenMetadata;

        multi products := .<vendor[is Product];
    }

    type Product {
        required mint_account: str {
            constraint exclusive;
        };
        required vendor: Vendor;
        metadata: TokenMetadata;

        multi devices := .<product[is Device];
    }

    type Device {
        required pubkey: str {
            constraint exclusive;
        };

        required token_account: str;
        required product: Product;

        single did := .<device[is DID];
    }

    type User {
        required pubkey: str {
            constraint exclusive;
        };

        multi dids := .<user[is DID];
    }

    type DID {
        required mint_account: str {
            constraint exclusive;
        };

        required token_account: str;
        required device: Device {
            constraint exclusive;
        };
        required user: User;

        metadata: TokenMetadata;
    }
}

