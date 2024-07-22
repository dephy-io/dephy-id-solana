import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Bigint: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  Int64: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type Admin = {
  id: Scalars['ID']['output'];
  pubkey: Scalars['String']['output'];
};

export type Admin_Type = Admin & BaseObject & Object & SolanaAccount & {
  __typename?: 'Admin_Type';
  id: Scalars['ID']['output'];
  pubkey: Scalars['String']['output'];
};

export type AuthUser = {
  id: Scalars['ID']['output'];
  is_admin: Scalars['Boolean']['output'];
};

export type AuthUser_Type = AuthUser & BaseObject & Object & {
  __typename?: 'AuthUser_Type';
  id: Scalars['ID']['output'];
  is_admin: Scalars['Boolean']['output'];
};

/** Root object type. */
export type BaseObject = {
  id: Scalars['ID']['output'];
};

export type Did = {
  device: Device;
  id: Scalars['ID']['output'];
  metadata?: Maybe<TokenMetadata>;
  mint_account: Scalars['String']['output'];
  mint_authority?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
  token_account?: Maybe<Scalars['String']['output']>;
  tx: Transaction;
};


export type DidDeviceArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};


export type DidMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};


export type DidOwnerArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderUser>;
};


export type DidTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};

export type Did_Type = BaseObject & Did & Object & SplAccount & SplMint & WithIx & {
  __typename?: 'DID_Type';
  device: Device;
  id: Scalars['ID']['output'];
  metadata?: Maybe<TokenMetadata>;
  mint_account: Scalars['String']['output'];
  mint_authority?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
  token_account?: Maybe<Scalars['String']['output']>;
  tx: Transaction;
};


export type Did_TypeDeviceArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};


export type Did_TypeMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};


export type Did_TypeOwnerArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderUser>;
};


export type Did_TypeTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};

export type Device = {
  did?: Maybe<Did>;
  id: Scalars['ID']['output'];
  product: Product;
  pubkey: Scalars['String']['output'];
  signing_alg?: Maybe<DeviceSigningAlgorithm>;
  token_account?: Maybe<Scalars['String']['output']>;
  tx: Transaction;
};


export type DeviceDidArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDid>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDid>;
};


export type DeviceProductArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};


export type DeviceTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};

export enum DeviceSigningAlgorithm {
  Ed25519 = 'Ed25519',
  Secp256k1 = 'Secp256k1'
}

export type Device_Type = BaseObject & Device & Object & SolanaAccount & SplAccount & WithIx & {
  __typename?: 'Device_Type';
  did?: Maybe<Did>;
  id: Scalars['ID']['output'];
  product: Product;
  pubkey: Scalars['String']['output'];
  signing_alg?: Maybe<DeviceSigningAlgorithm>;
  token_account?: Maybe<Scalars['String']['output']>;
  tx: Transaction;
};


export type Device_TypeDidArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDid>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDid>;
};


export type Device_TypeProductArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};


export type Device_TypeTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};

export enum Endian {
  Big = 'Big',
  Little = 'Little'
}

export type FilterAdmin = {
  and?: InputMaybe<Array<FilterAdmin>>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterAdmin>;
  or?: InputMaybe<Array<FilterAdmin>>;
  pubkey?: InputMaybe<FilterString>;
};

export type FilterAuthUser = {
  and?: InputMaybe<Array<FilterAuthUser>>;
  id?: InputMaybe<FilterId>;
  is_admin?: InputMaybe<FilterBoolean>;
  not?: InputMaybe<FilterAuthUser>;
  or?: InputMaybe<Array<FilterAuthUser>>;
};

export type FilterBaseObject = {
  and?: InputMaybe<Array<FilterBaseObject>>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterBaseObject>;
  or?: InputMaybe<Array<FilterBaseObject>>;
};

export type FilterBigint = {
  eq?: InputMaybe<Scalars['Bigint']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Bigint']['input']>;
  gte?: InputMaybe<Scalars['Bigint']['input']>;
  in?: InputMaybe<Array<Scalars['Bigint']['input']>>;
  lt?: InputMaybe<Scalars['Bigint']['input']>;
  lte?: InputMaybe<Scalars['Bigint']['input']>;
  neq?: InputMaybe<Scalars['Bigint']['input']>;
};

export type FilterBoolean = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  neq?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FilterDid = {
  and?: InputMaybe<Array<FilterDid>>;
  device?: InputMaybe<NestedFilterDevice>;
  id?: InputMaybe<FilterId>;
  metadata?: InputMaybe<NestedFilterTokenMetadata>;
  mint_account?: InputMaybe<FilterString>;
  mint_authority?: InputMaybe<FilterString>;
  not?: InputMaybe<FilterDid>;
  or?: InputMaybe<Array<FilterDid>>;
  owner?: InputMaybe<NestedFilterUser>;
  token_account?: InputMaybe<FilterString>;
  tx?: InputMaybe<NestedFilterTransaction>;
};

export type FilterDecimal = {
  eq?: InputMaybe<Scalars['Decimal']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Decimal']['input']>;
  gte?: InputMaybe<Scalars['Decimal']['input']>;
  in?: InputMaybe<Array<Scalars['Decimal']['input']>>;
  lt?: InputMaybe<Scalars['Decimal']['input']>;
  lte?: InputMaybe<Scalars['Decimal']['input']>;
  neq?: InputMaybe<Scalars['Decimal']['input']>;
};

export type FilterDevice = {
  and?: InputMaybe<Array<FilterDevice>>;
  did?: InputMaybe<NestedFilterDid>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterDevice>;
  or?: InputMaybe<Array<FilterDevice>>;
  product?: InputMaybe<NestedFilterProduct>;
  pubkey?: InputMaybe<FilterString>;
  signing_alg?: InputMaybe<FilterDeviceSigningAlgorithm>;
  token_account?: InputMaybe<FilterString>;
  tx?: InputMaybe<NestedFilterTransaction>;
};

export type FilterDeviceSigningAlgorithm = {
  eq?: InputMaybe<DeviceSigningAlgorithm>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<DeviceSigningAlgorithm>;
  gte?: InputMaybe<DeviceSigningAlgorithm>;
  in?: InputMaybe<Array<DeviceSigningAlgorithm>>;
  lt?: InputMaybe<DeviceSigningAlgorithm>;
  lte?: InputMaybe<DeviceSigningAlgorithm>;
  neq?: InputMaybe<DeviceSigningAlgorithm>;
};

export type FilterEndian = {
  eq?: InputMaybe<Endian>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Endian>;
  gte?: InputMaybe<Endian>;
  in?: InputMaybe<Array<Endian>>;
  lt?: InputMaybe<Endian>;
  lte?: InputMaybe<Endian>;
  neq?: InputMaybe<Endian>;
};

export type FilterFloat = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

export type FilterId = {
  eq?: InputMaybe<Scalars['ID']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<Scalars['ID']['input']>>;
  neq?: InputMaybe<Scalars['ID']['input']>;
};

export type FilterInt = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

export type FilterInt64 = {
  eq?: InputMaybe<Scalars['Int64']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Int64']['input']>;
  gte?: InputMaybe<Scalars['Int64']['input']>;
  in?: InputMaybe<Array<Scalars['Int64']['input']>>;
  lt?: InputMaybe<Scalars['Int64']['input']>;
  lte?: InputMaybe<Scalars['Int64']['input']>;
  neq?: InputMaybe<Scalars['Int64']['input']>;
};

export type FilterJson = {
  eq?: InputMaybe<Scalars['JSON']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['JSON']['input']>;
  gte?: InputMaybe<Scalars['JSON']['input']>;
  in?: InputMaybe<Array<Scalars['JSON']['input']>>;
  lt?: InputMaybe<Scalars['JSON']['input']>;
  lte?: InputMaybe<Scalars['JSON']['input']>;
  neq?: InputMaybe<Scalars['JSON']['input']>;
};

export type FilterJsonEmpty = {
  eq?: InputMaybe<JsonEmpty>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<JsonEmpty>;
  gte?: InputMaybe<JsonEmpty>;
  in?: InputMaybe<Array<JsonEmpty>>;
  lt?: InputMaybe<JsonEmpty>;
  lte?: InputMaybe<JsonEmpty>;
  neq?: InputMaybe<JsonEmpty>;
};

export type FilterObject = {
  and?: InputMaybe<Array<FilterObject>>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterObject>;
  or?: InputMaybe<Array<FilterObject>>;
};

export type FilterProduct = {
  and?: InputMaybe<Array<FilterProduct>>;
  devices?: InputMaybe<NestedFilterDevice>;
  devices_count?: InputMaybe<FilterInt64>;
  id?: InputMaybe<FilterId>;
  metadata?: InputMaybe<NestedFilterTokenMetadata>;
  mint_account?: InputMaybe<FilterString>;
  mint_authority?: InputMaybe<FilterString>;
  not?: InputMaybe<FilterProduct>;
  or?: InputMaybe<Array<FilterProduct>>;
  tx?: InputMaybe<NestedFilterTransaction>;
  vendor?: InputMaybe<NestedFilterVendor>;
};

export type FilterProgram = {
  and?: InputMaybe<Array<FilterProgram>>;
  authority?: InputMaybe<NestedFilterAdmin>;
  devices_count?: InputMaybe<FilterInt64>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterProgram>;
  or?: InputMaybe<Array<FilterProgram>>;
  products_count?: InputMaybe<FilterInt64>;
  pubkey?: InputMaybe<FilterString>;
  tx?: InputMaybe<NestedFilterTransaction>;
  vendors?: InputMaybe<NestedFilterVendor>;
  vendors_count?: InputMaybe<FilterInt64>;
};

export type FilterSolanaAccount = {
  and?: InputMaybe<Array<FilterSolanaAccount>>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterSolanaAccount>;
  or?: InputMaybe<Array<FilterSolanaAccount>>;
  pubkey?: InputMaybe<FilterString>;
};

export type FilterSplAccount = {
  and?: InputMaybe<Array<FilterSplAccount>>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterSplAccount>;
  or?: InputMaybe<Array<FilterSplAccount>>;
  token_account?: InputMaybe<FilterString>;
};

export type FilterSplMint = {
  and?: InputMaybe<Array<FilterSplMint>>;
  id?: InputMaybe<FilterId>;
  metadata?: InputMaybe<NestedFilterTokenMetadata>;
  mint_account?: InputMaybe<FilterString>;
  mint_authority?: InputMaybe<FilterString>;
  not?: InputMaybe<FilterSplMint>;
  or?: InputMaybe<Array<FilterSplMint>>;
};

export type FilterString = {
  eq?: InputMaybe<Scalars['String']['input']>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
};

export type FilterTokenMetadata = {
  and?: InputMaybe<Array<FilterTokenMetadata>>;
  id?: InputMaybe<FilterId>;
  name?: InputMaybe<FilterString>;
  not?: InputMaybe<FilterTokenMetadata>;
  or?: InputMaybe<Array<FilterTokenMetadata>>;
  symbol?: InputMaybe<FilterString>;
  uri?: InputMaybe<FilterString>;
};

export type FilterTransaction = {
  and?: InputMaybe<Array<FilterTransaction>>;
  block_ts?: InputMaybe<FilterString>;
  err?: InputMaybe<FilterString>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterTransaction>;
  or?: InputMaybe<Array<FilterTransaction>>;
  processed?: InputMaybe<FilterBoolean>;
  signature?: InputMaybe<FilterString>;
  slot?: InputMaybe<FilterBigint>;
};

export type FilterUser = {
  and?: InputMaybe<Array<FilterUser>>;
  dids?: InputMaybe<NestedFilterDid>;
  dids_count?: InputMaybe<FilterInt64>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterUser>;
  or?: InputMaybe<Array<FilterUser>>;
  pubkey?: InputMaybe<FilterString>;
};

export type FilterVendor = {
  and?: InputMaybe<Array<FilterVendor>>;
  devices_count?: InputMaybe<FilterInt64>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterVendor>;
  or?: InputMaybe<Array<FilterVendor>>;
  products?: InputMaybe<NestedFilterProduct>;
  products_count?: InputMaybe<FilterInt64>;
  program?: InputMaybe<NestedFilterProgram>;
  pubkey?: InputMaybe<FilterString>;
};

export type FilterWithIx = {
  and?: InputMaybe<Array<FilterWithIx>>;
  id?: InputMaybe<FilterId>;
  not?: InputMaybe<FilterWithIx>;
  or?: InputMaybe<Array<FilterWithIx>>;
  tx?: InputMaybe<NestedFilterTransaction>;
};

export type Filtercurrent_Auth_User = {
  and?: InputMaybe<Array<Filtercurrent_Auth_User>>;
  id?: InputMaybe<FilterId>;
  is_admin?: InputMaybe<FilterBoolean>;
  not?: InputMaybe<Filtercurrent_Auth_User>;
  or?: InputMaybe<Array<Filtercurrent_Auth_User>>;
};

export type InsertAdmin = {
  pubkey: Scalars['String']['input'];
};

export type InsertAuthUser = {
  is_admin?: InputMaybe<Scalars['Boolean']['input']>;
};

export type InsertDid = {
  device: NestedInsertDevice;
  metadata?: InputMaybe<NestedInsertTokenMetadata>;
  mint_account: Scalars['String']['input'];
  mint_authority?: InputMaybe<Scalars['String']['input']>;
  owner?: InputMaybe<NestedInsertUser>;
  token_account?: InputMaybe<Scalars['String']['input']>;
  tx: NestedInsertTransaction;
};

export type InsertDevice = {
  product: NestedInsertProduct;
  pubkey: Scalars['String']['input'];
  signing_alg?: InputMaybe<DeviceSigningAlgorithm>;
  token_account: Scalars['String']['input'];
  tx: NestedInsertTransaction;
};

export type InsertProduct = {
  metadata?: InputMaybe<NestedInsertTokenMetadata>;
  mint_account: Scalars['String']['input'];
  mint_authority?: InputMaybe<Scalars['String']['input']>;
  tx: NestedInsertTransaction;
  vendor: NestedInsertVendor;
};

export type InsertProgram = {
  authority: NestedInsertAdmin;
  pubkey: Scalars['String']['input'];
  tx: NestedInsertTransaction;
};

export type InsertTokenMetadata = {
  name?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  uri?: InputMaybe<Scalars['String']['input']>;
};

export type InsertTransaction = {
  block_ts?: InputMaybe<Scalars['String']['input']>;
  err?: InputMaybe<Scalars['String']['input']>;
  processed?: InputMaybe<Scalars['Boolean']['input']>;
  signature: Scalars['String']['input'];
  slot: Scalars['Bigint']['input'];
};

export type InsertUser = {
  pubkey: Scalars['String']['input'];
};

export type InsertVendor = {
  program: NestedInsertProgram;
  pubkey: Scalars['String']['input'];
};

export enum JsonEmpty {
  DeleteKey = 'DeleteKey',
  Error = 'Error',
  ReturnEmpty = 'ReturnEmpty',
  ReturnTarget = 'ReturnTarget',
  UseNull = 'UseNull'
}

export type Mutation = {
  __typename?: 'Mutation';
  delete_Admin?: Maybe<Array<Admin_Type>>;
  delete_AuthUser?: Maybe<Array<AuthUser_Type>>;
  delete_DID?: Maybe<Array<Did_Type>>;
  delete_Device?: Maybe<Array<Device_Type>>;
  delete_Product?: Maybe<Array<Product_Type>>;
  delete_Program?: Maybe<Array<Program_Type>>;
  delete_TokenMetadata?: Maybe<Array<TokenMetadata_Type>>;
  delete_Transaction?: Maybe<Array<Transaction_Type>>;
  delete_User?: Maybe<Array<User_Type>>;
  delete_Vendor?: Maybe<Array<Vendor_Type>>;
  delete_current_auth_user?: Maybe<Array<Current_Auth_User>>;
  insert_Admin?: Maybe<Array<Admin_Type>>;
  insert_AuthUser?: Maybe<Array<AuthUser_Type>>;
  insert_DID?: Maybe<Array<Did_Type>>;
  insert_Device?: Maybe<Array<Device_Type>>;
  insert_Product?: Maybe<Array<Product_Type>>;
  insert_Program?: Maybe<Array<Program_Type>>;
  insert_TokenMetadata?: Maybe<Array<TokenMetadata_Type>>;
  insert_Transaction?: Maybe<Array<Transaction_Type>>;
  insert_User?: Maybe<Array<User_Type>>;
  insert_Vendor?: Maybe<Array<Vendor_Type>>;
  update_Admin?: Maybe<Array<Admin>>;
  update_AuthUser?: Maybe<Array<AuthUser>>;
  update_DID?: Maybe<Array<Did>>;
  update_Device?: Maybe<Array<Device>>;
  update_Product?: Maybe<Array<Product>>;
  update_Program?: Maybe<Array<Program>>;
  update_SolanaAccount?: Maybe<Array<SolanaAccount>>;
  update_SplAccount?: Maybe<Array<SplAccount>>;
  update_SplMint?: Maybe<Array<SplMint>>;
  update_TokenMetadata?: Maybe<Array<TokenMetadata>>;
  update_Transaction?: Maybe<Array<Transaction>>;
  update_User?: Maybe<Array<User>>;
  update_Vendor?: Maybe<Array<Vendor>>;
  update_WithIx?: Maybe<Array<WithIx>>;
};


export type MutationDelete_AdminArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterAdmin>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAdmin>;
};


export type MutationDelete_AuthUserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterAuthUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAuthUser>;
};


export type MutationDelete_DidArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDid>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDid>;
};


export type MutationDelete_DeviceArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};


export type MutationDelete_ProductArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};


export type MutationDelete_ProgramArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProgram>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProgram>;
};


export type MutationDelete_TokenMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};


export type MutationDelete_TransactionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};


export type MutationDelete_UserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderUser>;
};


export type MutationDelete_VendorArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};


export type MutationDelete_Current_Auth_UserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Filtercurrent_Auth_User>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Ordercurrent_Auth_User>;
};


export type MutationInsert_AdminArgs = {
  data: Array<InsertAdmin>;
};


export type MutationInsert_AuthUserArgs = {
  data: Array<InsertAuthUser>;
};


export type MutationInsert_DidArgs = {
  data: Array<InsertDid>;
};


export type MutationInsert_DeviceArgs = {
  data: Array<InsertDevice>;
};


export type MutationInsert_ProductArgs = {
  data: Array<InsertProduct>;
};


export type MutationInsert_ProgramArgs = {
  data: Array<InsertProgram>;
};


export type MutationInsert_TokenMetadataArgs = {
  data: Array<InsertTokenMetadata>;
};


export type MutationInsert_TransactionArgs = {
  data: Array<InsertTransaction>;
};


export type MutationInsert_UserArgs = {
  data: Array<InsertUser>;
};


export type MutationInsert_VendorArgs = {
  data: Array<InsertVendor>;
};


export type MutationUpdate_AdminArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateAdmin;
  filter?: InputMaybe<FilterAdmin>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAdmin>;
};


export type MutationUpdate_AuthUserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateAuthUser;
  filter?: InputMaybe<FilterAuthUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAuthUser>;
};


export type MutationUpdate_DidArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateDid;
  filter?: InputMaybe<FilterDid>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDid>;
};


export type MutationUpdate_DeviceArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateDevice;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};


export type MutationUpdate_ProductArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateProduct;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};


export type MutationUpdate_ProgramArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateProgram;
  filter?: InputMaybe<FilterProgram>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProgram>;
};


export type MutationUpdate_SolanaAccountArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateSolanaAccount;
  filter?: InputMaybe<FilterSolanaAccount>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderSolanaAccount>;
};


export type MutationUpdate_SplAccountArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateSplAccount;
  filter?: InputMaybe<FilterSplAccount>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderSplAccount>;
};


export type MutationUpdate_SplMintArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateSplMint;
  filter?: InputMaybe<FilterSplMint>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderSplMint>;
};


export type MutationUpdate_TokenMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateTokenMetadata;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};


export type MutationUpdate_TransactionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateTransaction;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};


export type MutationUpdate_UserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateUser;
  filter?: InputMaybe<FilterUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderUser>;
};


export type MutationUpdate_VendorArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateVendor;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};


export type MutationUpdate_WithIxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data: UpdateWithIx;
  filter?: InputMaybe<FilterWithIx>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderWithIx>;
};

export type NestedFilterAdmin = {
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  pubkey?: InputMaybe<FilterString>;
};

export type NestedFilterDid = {
  device?: InputMaybe<NestedFilterDevice>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  metadata?: InputMaybe<NestedFilterTokenMetadata>;
  mint_account?: InputMaybe<FilterString>;
  mint_authority?: InputMaybe<FilterString>;
  owner?: InputMaybe<NestedFilterUser>;
  token_account?: InputMaybe<FilterString>;
  tx?: InputMaybe<NestedFilterTransaction>;
};

export type NestedFilterDevice = {
  did?: InputMaybe<NestedFilterDid>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  product?: InputMaybe<NestedFilterProduct>;
  pubkey?: InputMaybe<FilterString>;
  signing_alg?: InputMaybe<FilterDeviceSigningAlgorithm>;
  token_account?: InputMaybe<FilterString>;
  tx?: InputMaybe<NestedFilterTransaction>;
};

export type NestedFilterProduct = {
  devices?: InputMaybe<NestedFilterDevice>;
  devices_count?: InputMaybe<FilterInt64>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  metadata?: InputMaybe<NestedFilterTokenMetadata>;
  mint_account?: InputMaybe<FilterString>;
  mint_authority?: InputMaybe<FilterString>;
  tx?: InputMaybe<NestedFilterTransaction>;
  vendor?: InputMaybe<NestedFilterVendor>;
};

export type NestedFilterProgram = {
  authority?: InputMaybe<NestedFilterAdmin>;
  devices_count?: InputMaybe<FilterInt64>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  products_count?: InputMaybe<FilterInt64>;
  pubkey?: InputMaybe<FilterString>;
  tx?: InputMaybe<NestedFilterTransaction>;
  vendors?: InputMaybe<NestedFilterVendor>;
  vendors_count?: InputMaybe<FilterInt64>;
};

export type NestedFilterTokenMetadata = {
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  name?: InputMaybe<FilterString>;
  symbol?: InputMaybe<FilterString>;
  uri?: InputMaybe<FilterString>;
};

export type NestedFilterTransaction = {
  block_ts?: InputMaybe<FilterString>;
  err?: InputMaybe<FilterString>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  processed?: InputMaybe<FilterBoolean>;
  signature?: InputMaybe<FilterString>;
  slot?: InputMaybe<FilterBigint>;
};

export type NestedFilterUser = {
  dids?: InputMaybe<NestedFilterDid>;
  dids_count?: InputMaybe<FilterInt64>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  pubkey?: InputMaybe<FilterString>;
};

export type NestedFilterVendor = {
  devices_count?: InputMaybe<FilterInt64>;
  exists?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<FilterId>;
  products?: InputMaybe<NestedFilterProduct>;
  products_count?: InputMaybe<FilterInt64>;
  program?: InputMaybe<NestedFilterProgram>;
  pubkey?: InputMaybe<FilterString>;
};

export type NestedInsertAdmin = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertAdmin>;
  filter?: InputMaybe<FilterAdmin>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAdmin>;
};

export type NestedInsertDevice = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertDevice>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};

export type NestedInsertProduct = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertProduct>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};

export type NestedInsertProgram = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertProgram>;
  filter?: InputMaybe<FilterProgram>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProgram>;
};

export type NestedInsertTokenMetadata = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertTokenMetadata>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};

export type NestedInsertTransaction = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertTransaction>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};

export type NestedInsertUser = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertUser>;
  filter?: InputMaybe<FilterUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderUser>;
};

export type NestedInsertVendor = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<InsertVendor>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};

export type NestedUpdateAdmin = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterAdmin>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAdmin>;
};

export type NestedUpdateDevice = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};

export type NestedUpdateProduct = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};

export type NestedUpdateProgram = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProgram>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProgram>;
};

export type NestedUpdateTokenMetadata = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};

export type NestedUpdateTransaction = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};

export type NestedUpdateUser = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderUser>;
};

export type NestedUpdateVendor = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};

/** Root object type for user-defined types */
export type Object = {
  id: Scalars['ID']['output'];
};

export type OrderAdmin = {
  id?: InputMaybe<Ordering>;
  pubkey?: InputMaybe<Ordering>;
};

export type OrderAuthUser = {
  id?: InputMaybe<Ordering>;
  is_admin?: InputMaybe<Ordering>;
};

export type OrderBaseObject = {
  id?: InputMaybe<Ordering>;
};

export type OrderDid = {
  device?: InputMaybe<OrderDevice>;
  id?: InputMaybe<Ordering>;
  metadata?: InputMaybe<OrderTokenMetadata>;
  mint_account?: InputMaybe<Ordering>;
  mint_authority?: InputMaybe<Ordering>;
  owner?: InputMaybe<OrderUser>;
  token_account?: InputMaybe<Ordering>;
  tx?: InputMaybe<OrderTransaction>;
};

export type OrderDevice = {
  did?: InputMaybe<OrderDid>;
  id?: InputMaybe<Ordering>;
  product?: InputMaybe<OrderProduct>;
  pubkey?: InputMaybe<Ordering>;
  signing_alg?: InputMaybe<Ordering>;
  token_account?: InputMaybe<Ordering>;
  tx?: InputMaybe<OrderTransaction>;
};

export type OrderObject = {
  id?: InputMaybe<Ordering>;
};

export type OrderProduct = {
  devices_count?: InputMaybe<Ordering>;
  id?: InputMaybe<Ordering>;
  metadata?: InputMaybe<OrderTokenMetadata>;
  mint_account?: InputMaybe<Ordering>;
  mint_authority?: InputMaybe<Ordering>;
  tx?: InputMaybe<OrderTransaction>;
  vendor?: InputMaybe<OrderVendor>;
};

export type OrderProgram = {
  authority?: InputMaybe<OrderAdmin>;
  devices_count?: InputMaybe<Ordering>;
  id?: InputMaybe<Ordering>;
  products_count?: InputMaybe<Ordering>;
  pubkey?: InputMaybe<Ordering>;
  tx?: InputMaybe<OrderTransaction>;
  vendors_count?: InputMaybe<Ordering>;
};

export type OrderSolanaAccount = {
  id?: InputMaybe<Ordering>;
  pubkey?: InputMaybe<Ordering>;
};

export type OrderSplAccount = {
  id?: InputMaybe<Ordering>;
  token_account?: InputMaybe<Ordering>;
};

export type OrderSplMint = {
  id?: InputMaybe<Ordering>;
  metadata?: InputMaybe<OrderTokenMetadata>;
  mint_account?: InputMaybe<Ordering>;
  mint_authority?: InputMaybe<Ordering>;
};

export type OrderTokenMetadata = {
  id?: InputMaybe<Ordering>;
  name?: InputMaybe<Ordering>;
  symbol?: InputMaybe<Ordering>;
  uri?: InputMaybe<Ordering>;
};

export type OrderTransaction = {
  block_ts?: InputMaybe<Ordering>;
  err?: InputMaybe<Ordering>;
  id?: InputMaybe<Ordering>;
  processed?: InputMaybe<Ordering>;
  signature?: InputMaybe<Ordering>;
  slot?: InputMaybe<Ordering>;
};

export type OrderUser = {
  dids_count?: InputMaybe<Ordering>;
  id?: InputMaybe<Ordering>;
  pubkey?: InputMaybe<Ordering>;
};

export type OrderVendor = {
  devices_count?: InputMaybe<Ordering>;
  id?: InputMaybe<Ordering>;
  products_count?: InputMaybe<Ordering>;
  program?: InputMaybe<OrderProgram>;
  pubkey?: InputMaybe<Ordering>;
};

export type OrderWithIx = {
  id?: InputMaybe<Ordering>;
  tx?: InputMaybe<OrderTransaction>;
};

export type Ordercurrent_Auth_User = {
  id?: InputMaybe<Ordering>;
  is_admin?: InputMaybe<Ordering>;
};

export type Ordering = {
  dir: DirectionEnum;
  nulls?: InputMaybe<NullsOrderingEnum>;
};

export type Product = {
  devices?: Maybe<Array<Device>>;
  devices_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  metadata?: Maybe<TokenMetadata>;
  mint_account: Scalars['String']['output'];
  mint_authority?: Maybe<Scalars['String']['output']>;
  tx: Transaction;
  vendor: Vendor;
};


export type ProductDevicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};


export type ProductMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};


export type ProductTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};


export type ProductVendorArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};

export type Product_Type = BaseObject & Object & Product & SplMint & WithIx & {
  __typename?: 'Product_Type';
  devices?: Maybe<Array<Device>>;
  devices_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  metadata?: Maybe<TokenMetadata>;
  mint_account: Scalars['String']['output'];
  mint_authority?: Maybe<Scalars['String']['output']>;
  tx: Transaction;
  vendor: Vendor;
};


export type Product_TypeDevicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};


export type Product_TypeMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};


export type Product_TypeTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};


export type Product_TypeVendorArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};

export type Program = {
  authority: Admin;
  devices_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  products_count: Scalars['Int64']['output'];
  pubkey: Scalars['String']['output'];
  tx: Transaction;
  vendors?: Maybe<Array<Vendor>>;
  vendors_count: Scalars['Int64']['output'];
};


export type ProgramAuthorityArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterAdmin>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAdmin>;
};


export type ProgramTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};


export type ProgramVendorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};

export type Program_Type = BaseObject & Object & Program & SolanaAccount & WithIx & {
  __typename?: 'Program_Type';
  authority: Admin;
  devices_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  products_count: Scalars['Int64']['output'];
  pubkey: Scalars['String']['output'];
  tx: Transaction;
  vendors?: Maybe<Array<Vendor>>;
  vendors_count: Scalars['Int64']['output'];
};


export type Program_TypeAuthorityArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterAdmin>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAdmin>;
};


export type Program_TypeTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};


export type Program_TypeVendorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};

export type Query = {
  __typename?: 'Query';
  Admin?: Maybe<Array<Admin>>;
  AuthUser?: Maybe<Array<AuthUser>>;
  BaseObject?: Maybe<Array<BaseObject>>;
  DID?: Maybe<Array<Did>>;
  Device?: Maybe<Array<Device>>;
  Object?: Maybe<Array<Object>>;
  Product?: Maybe<Array<Product>>;
  Program?: Maybe<Array<Program>>;
  SolanaAccount?: Maybe<Array<SolanaAccount>>;
  SplAccount?: Maybe<Array<SplAccount>>;
  SplMint?: Maybe<Array<SplMint>>;
  TokenMetadata?: Maybe<Array<TokenMetadata>>;
  Transaction?: Maybe<Array<Transaction>>;
  User?: Maybe<Array<User>>;
  Vendor?: Maybe<Array<Vendor>>;
  WithIx?: Maybe<Array<WithIx>>;
  current_auth_user?: Maybe<Array<Current_Auth_User>>;
};


export type QueryAdminArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterAdmin>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAdmin>;
};


export type QueryAuthUserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterAuthUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderAuthUser>;
};


export type QueryBaseObjectArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterBaseObject>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderBaseObject>;
};


export type QueryDidArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDid>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDid>;
};


export type QueryDeviceArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDevice>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDevice>;
};


export type QueryObjectArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterObject>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderObject>;
};


export type QueryProductArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};


export type QueryProgramArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProgram>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProgram>;
};


export type QuerySolanaAccountArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterSolanaAccount>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderSolanaAccount>;
};


export type QuerySplAccountArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterSplAccount>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderSplAccount>;
};


export type QuerySplMintArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterSplMint>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderSplMint>;
};


export type QueryTokenMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};


export type QueryTransactionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};


export type QueryUserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterUser>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderUser>;
};


export type QueryVendorArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterVendor>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderVendor>;
};


export type QueryWithIxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterWithIx>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderWithIx>;
};


export type QueryCurrent_Auth_UserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Filtercurrent_Auth_User>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Ordercurrent_Auth_User>;
};

export type SolanaAccount = {
  id: Scalars['ID']['output'];
  pubkey: Scalars['String']['output'];
};

export type SplAccount = {
  id: Scalars['ID']['output'];
  token_account?: Maybe<Scalars['String']['output']>;
};

export type SplMint = {
  id: Scalars['ID']['output'];
  metadata?: Maybe<TokenMetadata>;
  mint_account: Scalars['String']['output'];
  mint_authority?: Maybe<Scalars['String']['output']>;
};


export type SplMintMetadataArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTokenMetadata>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTokenMetadata>;
};

export type TokenMetadata = {
  additional: Array<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type TokenMetadata_Type = BaseObject & Object & TokenMetadata & {
  __typename?: 'TokenMetadata_Type';
  additional: Array<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type Transaction = {
  block_ts?: Maybe<Scalars['String']['output']>;
  err?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  processed: Scalars['Boolean']['output'];
  signature: Scalars['String']['output'];
  slot: Scalars['Bigint']['output'];
};

export type Transaction_Type = BaseObject & Object & Transaction & {
  __typename?: 'Transaction_Type';
  block_ts?: Maybe<Scalars['String']['output']>;
  err?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  processed: Scalars['Boolean']['output'];
  signature: Scalars['String']['output'];
  slot: Scalars['Bigint']['output'];
};

export type UpdateAdmin = {
  pubkey?: InputMaybe<UpdateOp_Pubkey_Admin>;
};

export type UpdateAuthUser = {
  is_admin?: InputMaybe<UpdateOp_Is_Admin_AuthUser>;
};

export type UpdateDid = {
  device?: InputMaybe<UpdateOp_Device_Did>;
  metadata?: InputMaybe<UpdateOp_Metadata_Did>;
  mint_account?: InputMaybe<UpdateOp_Mint_Account_Did>;
  mint_authority?: InputMaybe<UpdateOp_Mint_Authority_Did>;
  owner?: InputMaybe<UpdateOp_Owner_Did>;
  token_account?: InputMaybe<UpdateOp_Token_Account_Did>;
  tx?: InputMaybe<UpdateOp_Tx_Did>;
};

export type UpdateDevice = {
  product?: InputMaybe<UpdateOp_Product_Device>;
  pubkey?: InputMaybe<UpdateOp_Pubkey_Device>;
  signing_alg?: InputMaybe<UpdateOp_Signing_Alg_Device>;
  token_account?: InputMaybe<UpdateOp_Token_Account_Device>;
  tx?: InputMaybe<UpdateOp_Tx_Device>;
};

export type UpdateOp_Authority_Program = {
  set?: InputMaybe<NestedUpdateAdmin>;
};

export type UpdateOp_Block_Ts_Transaction = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOp_Device_Did = {
  set?: InputMaybe<NestedUpdateDevice>;
};

export type UpdateOp_Err_Transaction = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Is_Admin_AuthUser = {
  set?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateOp_Metadata_Did = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  set?: InputMaybe<NestedUpdateTokenMetadata>;
};

export type UpdateOp_Metadata_Product = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  set?: InputMaybe<NestedUpdateTokenMetadata>;
};

export type UpdateOp_Metadata_SplMint = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  set?: InputMaybe<NestedUpdateTokenMetadata>;
};

export type UpdateOp_Mint_Account_Did = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Mint_Account_Product = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Mint_Account_SplMint = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Mint_Authority_Did = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Mint_Authority_Product = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Mint_Authority_SplMint = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Name_TokenMetadata = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Owner_Did = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  set?: InputMaybe<NestedUpdateUser>;
};

export type UpdateOp_Processed_Transaction = {
  set?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateOp_Product_Device = {
  set?: InputMaybe<NestedUpdateProduct>;
};

export type UpdateOp_Program_Vendor = {
  set?: InputMaybe<NestedUpdateProgram>;
};

export type UpdateOp_Pubkey_Admin = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Pubkey_Device = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Pubkey_Program = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Pubkey_SolanaAccount = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Pubkey_User = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Pubkey_Vendor = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Signature_Transaction = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Signing_Alg_Device = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  set?: InputMaybe<DeviceSigningAlgorithm>;
};

export type UpdateOp_Slot_Transaction = {
  decrement?: InputMaybe<Scalars['Bigint']['input']>;
  increment?: InputMaybe<Scalars['Bigint']['input']>;
  set?: InputMaybe<Scalars['Bigint']['input']>;
};

export type UpdateOp_Symbol_TokenMetadata = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Token_Account_Did = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Token_Account_Device = {
  append?: InputMaybe<Scalars['String']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Token_Account_SplAccount = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Tx_Did = {
  set?: InputMaybe<NestedUpdateTransaction>;
};

export type UpdateOp_Tx_Device = {
  set?: InputMaybe<NestedUpdateTransaction>;
};

export type UpdateOp_Tx_Product = {
  set?: InputMaybe<NestedUpdateTransaction>;
};

export type UpdateOp_Tx_Program = {
  set?: InputMaybe<NestedUpdateTransaction>;
};

export type UpdateOp_Tx_WithIx = {
  set?: InputMaybe<NestedUpdateTransaction>;
};

export type UpdateOp_Uri_TokenMetadata = {
  append?: InputMaybe<Scalars['String']['input']>;
  clear?: InputMaybe<Scalars['Boolean']['input']>;
  prepend?: InputMaybe<Scalars['String']['input']>;
  set?: InputMaybe<Scalars['String']['input']>;
  slice?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateOp_Vendor_Product = {
  set?: InputMaybe<NestedUpdateVendor>;
};

export type UpdateProduct = {
  metadata?: InputMaybe<UpdateOp_Metadata_Product>;
  mint_account?: InputMaybe<UpdateOp_Mint_Account_Product>;
  mint_authority?: InputMaybe<UpdateOp_Mint_Authority_Product>;
  tx?: InputMaybe<UpdateOp_Tx_Product>;
  vendor?: InputMaybe<UpdateOp_Vendor_Product>;
};

export type UpdateProgram = {
  authority?: InputMaybe<UpdateOp_Authority_Program>;
  pubkey?: InputMaybe<UpdateOp_Pubkey_Program>;
  tx?: InputMaybe<UpdateOp_Tx_Program>;
};

export type UpdateSolanaAccount = {
  pubkey?: InputMaybe<UpdateOp_Pubkey_SolanaAccount>;
};

export type UpdateSplAccount = {
  token_account?: InputMaybe<UpdateOp_Token_Account_SplAccount>;
};

export type UpdateSplMint = {
  metadata?: InputMaybe<UpdateOp_Metadata_SplMint>;
  mint_account?: InputMaybe<UpdateOp_Mint_Account_SplMint>;
  mint_authority?: InputMaybe<UpdateOp_Mint_Authority_SplMint>;
};

export type UpdateTokenMetadata = {
  name?: InputMaybe<UpdateOp_Name_TokenMetadata>;
  symbol?: InputMaybe<UpdateOp_Symbol_TokenMetadata>;
  uri?: InputMaybe<UpdateOp_Uri_TokenMetadata>;
};

export type UpdateTransaction = {
  block_ts?: InputMaybe<UpdateOp_Block_Ts_Transaction>;
  err?: InputMaybe<UpdateOp_Err_Transaction>;
  processed?: InputMaybe<UpdateOp_Processed_Transaction>;
  signature?: InputMaybe<UpdateOp_Signature_Transaction>;
  slot?: InputMaybe<UpdateOp_Slot_Transaction>;
};

export type UpdateUser = {
  pubkey?: InputMaybe<UpdateOp_Pubkey_User>;
};

export type UpdateVendor = {
  program?: InputMaybe<UpdateOp_Program_Vendor>;
  pubkey?: InputMaybe<UpdateOp_Pubkey_Vendor>;
};

export type UpdateWithIx = {
  tx?: InputMaybe<UpdateOp_Tx_WithIx>;
};

export type User = {
  dids?: Maybe<Array<Did>>;
  dids_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  pubkey: Scalars['String']['output'];
};


export type UserDidsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDid>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDid>;
};

export type User_Type = BaseObject & Object & SolanaAccount & User & {
  __typename?: 'User_Type';
  dids?: Maybe<Array<Did>>;
  dids_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  pubkey: Scalars['String']['output'];
};


export type User_TypeDidsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterDid>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderDid>;
};

export type Vendor = {
  devices_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  products?: Maybe<Array<Product>>;
  products_count: Scalars['Int64']['output'];
  program: Program;
  pubkey: Scalars['String']['output'];
};


export type VendorProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};


export type VendorProgramArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProgram>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProgram>;
};

export type Vendor_Type = BaseObject & Object & SolanaAccount & Vendor & {
  __typename?: 'Vendor_Type';
  devices_count: Scalars['Int64']['output'];
  id: Scalars['ID']['output'];
  products?: Maybe<Array<Product>>;
  products_count: Scalars['Int64']['output'];
  program: Program;
  pubkey: Scalars['String']['output'];
};


export type Vendor_TypeProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProduct>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProduct>;
};


export type Vendor_TypeProgramArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterProgram>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderProgram>;
};

export type WithIx = {
  id: Scalars['ID']['output'];
  tx: Transaction;
};


export type WithIxTxArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FilterTransaction>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<OrderTransaction>;
};

export type Current_Auth_User = {
  __typename?: 'current_auth_user';
  id: Scalars['ID']['output'];
  is_admin: Scalars['Boolean']['output'];
};

/** Enum value used to specify ordering direction. */
export enum DirectionEnum {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Enum value used to specify how nulls are ordered. */
export enum NullsOrderingEnum {
  Biggest = 'BIGGEST',
  Smallest = 'SMALLEST'
}

export type GetProductsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetProductsQuery = { __typename?: 'Query', Product?: Array<{ __typename?: 'Product_Type', mint_account: string, mint_authority?: string | null, devices_count: any, metadata?: { __typename?: 'TokenMetadata_Type', name?: string | null, symbol?: string | null, uri?: string | null, additional: Array<any> } | null, vendor: { __typename?: 'Vendor_Type', pubkey: string } }> | null };

export type GetProductQueryVariables = Exact<{
  mint_account?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetProductQuery = { __typename?: 'Query', Product?: Array<{ __typename?: 'Product_Type', mint_account: string, mint_authority?: string | null, devices_count: any, metadata?: { __typename?: 'TokenMetadata_Type', name?: string | null, symbol?: string | null, uri?: string | null, additional: Array<any> } | null, vendor: { __typename?: 'Vendor_Type', pubkey: string }, devices?: Array<{ __typename?: 'Device_Type', pubkey: string, signing_alg?: DeviceSigningAlgorithm | null, token_account?: string | null, tx: { __typename?: 'Transaction_Type', block_ts?: string | null }, did?: { __typename?: 'DID_Type', token_account?: string | null, mint_account: string, metadata?: { __typename?: 'TokenMetadata_Type', name?: string | null, symbol?: string | null, uri?: string | null, additional: Array<any> } | null, owner?: { __typename?: 'User_Type', pubkey: string } | null } | null }> | null }> | null };

export type GetVendorsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetVendorsQuery = { __typename?: 'Query', Vendor?: Array<{ __typename?: 'Vendor_Type', pubkey: string, products_count: any, devices_count: any, products?: Array<{ __typename?: 'Product_Type', mint_account: string, mint_authority?: string | null, devices_count: any, metadata?: { __typename?: 'TokenMetadata_Type', name?: string | null, symbol?: string | null, uri?: string | null, additional: Array<any> } | null, tx: { __typename?: 'Transaction_Type', block_ts?: string | null } }> | null }> | null };

export type GetVendorQueryVariables = Exact<{
  vendor_pubkey?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetVendorQuery = { __typename?: 'Query', Vendor?: Array<{ __typename?: 'Vendor_Type', pubkey: string, products_count: any, devices_count: any, products?: Array<{ __typename?: 'Product_Type', mint_account: string, mint_authority?: string | null, devices_count: any, metadata?: { __typename?: 'TokenMetadata_Type', name?: string | null, symbol?: string | null, uri?: string | null, additional: Array<any> } | null, tx: { __typename?: 'Transaction_Type', block_ts?: string | null } }> | null }> | null };

export type GetDeviceQueryVariables = Exact<{
  device_pubkey?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetDeviceQuery = { __typename?: 'Query', Device?: Array<{ __typename?: 'Device_Type', pubkey: string, signing_alg?: DeviceSigningAlgorithm | null, token_account?: string | null, tx: { __typename?: 'Transaction_Type', block_ts?: string | null }, product: { __typename?: 'Product_Type', mint_account: string, metadata?: { __typename?: 'TokenMetadata_Type', name?: string | null, symbol?: string | null, uri?: string | null, additional: Array<any> } | null, vendor: { __typename?: 'Vendor_Type', pubkey: string } }, did?: { __typename?: 'DID_Type', mint_account: string, mint_authority?: string | null, metadata?: { __typename?: 'TokenMetadata_Type', name?: string | null, symbol?: string | null, uri?: string | null, additional: Array<any> } | null, owner?: { __typename?: 'User_Type', pubkey: string } | null } | null }> | null };

export type GetProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProgramsQuery = { __typename?: 'Query', Program?: Array<{ __typename?: 'Program_Type', pubkey: string, vendors_count: any, products_count: any, devices_count: any, authority: { __typename?: 'Admin_Type', pubkey: string } }> | null };


export const GetProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mint_account"}},{"kind":"Field","name":{"kind":"Name","value":"mint_authority"}},{"kind":"Field","name":{"kind":"Name","value":"devices_count"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"additional"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}}]}}]}}]}}]} as unknown as DocumentNode<GetProductsQuery, GetProductsQueryVariables>;
export const GetProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mint_account"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mint_account"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mint_account"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mint_account"}},{"kind":"Field","name":{"kind":"Name","value":"mint_authority"}},{"kind":"Field","name":{"kind":"Name","value":"devices_count"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"additional"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"devices"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"tx"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"slot"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"dir"},"value":{"kind":"EnumValue","value":"ASC"}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}},{"kind":"Field","name":{"kind":"Name","value":"signing_alg"}},{"kind":"Field","name":{"kind":"Name","value":"token_account"}},{"kind":"Field","name":{"kind":"Name","value":"tx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block_ts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"did"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token_account"}},{"kind":"Field","name":{"kind":"Name","value":"mint_account"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"additional"}}]}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetProductQuery, GetProductQueryVariables>;
export const GetVendorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getVendors"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Vendor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"devices_count"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mint_account"}},{"kind":"Field","name":{"kind":"Name","value":"mint_authority"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"additional"}}]}},{"kind":"Field","name":{"kind":"Name","value":"devices_count"}},{"kind":"Field","name":{"kind":"Name","value":"tx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block_ts"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetVendorsQuery, GetVendorsQueryVariables>;
export const GetVendorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getVendor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vendor_pubkey"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Vendor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"pubkey"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vendor_pubkey"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"devices_count"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mint_account"}},{"kind":"Field","name":{"kind":"Name","value":"mint_authority"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"additional"}}]}},{"kind":"Field","name":{"kind":"Name","value":"devices_count"}},{"kind":"Field","name":{"kind":"Name","value":"tx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block_ts"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetVendorQuery, GetVendorQueryVariables>;
export const GetDeviceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getDevice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"device_pubkey"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Device"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"pubkey"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"device_pubkey"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}},{"kind":"Field","name":{"kind":"Name","value":"signing_alg"}},{"kind":"Field","name":{"kind":"Name","value":"token_account"}},{"kind":"Field","name":{"kind":"Name","value":"tx"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block_ts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mint_account"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"additional"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"did"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mint_account"}},{"kind":"Field","name":{"kind":"Name","value":"mint_authority"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"additional"}}]}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetDeviceQuery, GetDeviceQueryVariables>;
export const GetProgramsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getPrograms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Program"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}},{"kind":"Field","name":{"kind":"Name","value":"authority"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pubkey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendors_count"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"devices_count"}}]}}]}}]} as unknown as DocumentNode<GetProgramsQuery, GetProgramsQueryVariables>;