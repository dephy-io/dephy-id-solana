CREATE MIGRATION m1jpfni6wypvwwv5l6zk5mfupnxwyxhbx7nlclorm7d37izlbvydoa
    ONTO initial
{
  CREATE EXTENSION graphql VERSION '1.0';
  CREATE TYPE default::TokenMetadata {
      CREATE REQUIRED PROPERTY additional: array<tuple<std::str, std::str>>;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY symbol: std::str;
      CREATE REQUIRED PROPERTY uri: std::str;
  };
  CREATE ABSTRACT TYPE default::SolanaAccount {
      CREATE REQUIRED PROPERTY pubkey: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE default::Admin EXTENDING default::SolanaAccount;
  CREATE TYPE default::Transaction {
      CREATE PROPERTY block_ts: std::datetime;
      CREATE PROPERTY err: std::str;
      CREATE REQUIRED PROPERTY processed: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY signature: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY slot: std::bigint;
  };
  CREATE ABSTRACT TYPE default::WithIx {
      CREATE REQUIRED LINK tx: default::Transaction {
          CREATE PROPERTY ix_index: std::int16;
      };
  };
  CREATE TYPE default::DePHY EXTENDING default::SolanaAccount, default::WithIx {
      CREATE REQUIRED LINK authority: default::Admin;
  };
  CREATE ABSTRACT TYPE default::SplAccount {
      CREATE PROPERTY token_account: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE ABSTRACT TYPE default::SplMint {
      CREATE LINK metadata: default::TokenMetadata;
      CREATE REQUIRED PROPERTY mint_account: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY mint_authority: std::str;
  };
  CREATE TYPE default::DID EXTENDING default::SplMint, default::SplAccount, default::WithIx;
  CREATE SCALAR TYPE default::KeyType EXTENDING enum<Ed25519, Secp256k1>;
  CREATE TYPE default::Device EXTENDING default::SolanaAccount, default::SplAccount, default::WithIx {
      CREATE REQUIRED PROPERTY key_type: default::KeyType;
      ALTER PROPERTY token_account {
          SET OWNED;
          SET REQUIRED;
          SET TYPE std::str;
          ALTER CONSTRAINT std::exclusive {
              SET OWNED;
          };
      };
  };
  ALTER TYPE default::DID {
      CREATE REQUIRED LINK device: default::Device {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Device {
      CREATE SINGLE LINK did := (.<device[IS default::DID]);
  };
  CREATE TYPE default::User EXTENDING default::SolanaAccount;
  ALTER TYPE default::DID {
      CREATE LINK user: default::User;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK dids := (.<user[IS default::DID]);
  };
  CREATE TYPE default::Product EXTENDING default::SplMint, default::WithIx;
  ALTER TYPE default::Device {
      CREATE REQUIRED LINK product: default::Product;
  };
  ALTER TYPE default::Product {
      CREATE MULTI LINK devices := (.<product[IS default::Device]);
  };
  CREATE TYPE default::Vendor EXTENDING default::SolanaAccount, default::SplMint, default::SplAccount, default::WithIx {
      ALTER PROPERTY token_account {
          SET OWNED;
          SET REQUIRED;
          SET TYPE std::str;
          ALTER CONSTRAINT std::exclusive {
              SET OWNED;
          };
      };
  };
  ALTER TYPE default::Product {
      CREATE REQUIRED LINK vendor: default::Vendor;
  };
  ALTER TYPE default::Vendor {
      CREATE MULTI LINK products := (.<vendor[IS default::Product]);
  };
};
