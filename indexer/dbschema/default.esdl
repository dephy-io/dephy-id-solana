using extension graphql;

module default {
    global current_auth_user_id: uuid;
    alias current_auth_user := (
        select AuthUser filter .id = global current_auth_user_id
    );

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

        access policy auth_user_has_full_access
            allow all
            using (current_auth_user.is_admin ?? false) {
                errmessage := 'Admin Only'
            };
        access policy non_admins_can_only_select
            allow select
            using (not (current_auth_user.is_admin ?? false));
    }

    type TokenMetadata {
        name: str;
        symbol: str;
        uri: str;
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

        multi vendors := .<program[is Vendor];

        vendors_count := count(.vendors);
        products_count := count(.vendors.products);
        devices_count := count(.vendors.products.devices);
    }

    type Vendor extending SolanaAccount {
        required program: Program;
        multi products := .<vendor[is Product];

        products_count := count(.products);
        devices_count := count(.products.devices);
    }

    type Product extending SplMint, WithIx {
        required vendor: Vendor;

        multi devices := .<product[is Device];

        devices_count := count(.devices);
    }

    scalar type DeviceSigningAlgorithm extending enum<Ed25519, Secp256k1>;

    type Device extending SolanaAccount, SplAccount, WithIx {
        required product: Product;
        signing_alg: DeviceSigningAlgorithm;
        overloaded required token_account: str {
            constraint exclusive;
        };

        single did := .<device[is DID];
    }

    type User extending SolanaAccount {
        multi dids := .<owner[is DID];

        dids_count := count(.dids);
    }

    type DID extending SplMint, SplAccount, WithIx {
        required device: Device {
            constraint exclusive;
        };

        owner: User;
    }

    type AuthUser {
        required is_admin: bool { default := false };
    }
}

