/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n    query getProducts {\n      Product {\n        mint_account\n        mint_authority\n        devices_count\n        metadata {\n          name\n          symbol\n          uri\n          additional\n        }\n        vendor {\n          pubkey\n        }\n      }\n    }\n  ": types.GetProductsDocument,
    "\n    query getProduct($mint_account: String, $limit: Int, $offset: String) {\n      Product(filter: { mint_account: {eq: $mint_account} }) {\n        mint_account\n        mint_authority\n        devices_count\n        metadata {\n          name\n          symbol\n          uri\n          additional\n        }\n        vendor {\n          pubkey\n        }\n        devices(order: { tx: {slot: {dir: ASC} } }, first: $limit, after: $offset) {\n          pubkey\n          signing_alg\n          token_account\n          tx {\n            block_ts\n          }\n          did {\n            token_account\n            mint_account\n            metadata {\n              name\n              symbol\n              uri\n              additional\n            }\n            owner {\n              pubkey\n            }\n          }\n        }\n      }\n    }\n  ": types.GetProductDocument,
    "\n    query getVendor($vendor_pubkey: String) {\n      Vendor(filter: { pubkey: {eq: $vendor_pubkey} }) {\n        pubkey\n        products_count\n        products {\n          mint_account\n          mint_authority\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          devices_count\n          tx {\n            block_ts\n          }\n        }\n      }\n    }\n  ": types.GetVendorDocument,
    "\n    query getDevice($device_pubkey: String) {\n      Device(filter: { pubkey: {eq: $device_pubkey} }) {\n        pubkey\n        signing_alg\n        token_account\n        tx {\n          block_ts\n        }\n        product {\n          mint_account\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          vendor {\n            pubkey\n          }\n        }\n        did {\n          mint_account\n          mint_authority\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          owner {\n            pubkey\n          }\n        }\n      }\n    }\n  ": types.GetDeviceDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getProducts {\n      Product {\n        mint_account\n        mint_authority\n        devices_count\n        metadata {\n          name\n          symbol\n          uri\n          additional\n        }\n        vendor {\n          pubkey\n        }\n      }\n    }\n  "): (typeof documents)["\n    query getProducts {\n      Product {\n        mint_account\n        mint_authority\n        devices_count\n        metadata {\n          name\n          symbol\n          uri\n          additional\n        }\n        vendor {\n          pubkey\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getProduct($mint_account: String, $limit: Int, $offset: String) {\n      Product(filter: { mint_account: {eq: $mint_account} }) {\n        mint_account\n        mint_authority\n        devices_count\n        metadata {\n          name\n          symbol\n          uri\n          additional\n        }\n        vendor {\n          pubkey\n        }\n        devices(order: { tx: {slot: {dir: ASC} } }, first: $limit, after: $offset) {\n          pubkey\n          signing_alg\n          token_account\n          tx {\n            block_ts\n          }\n          did {\n            token_account\n            mint_account\n            metadata {\n              name\n              symbol\n              uri\n              additional\n            }\n            owner {\n              pubkey\n            }\n          }\n        }\n      }\n    }\n  "): (typeof documents)["\n    query getProduct($mint_account: String, $limit: Int, $offset: String) {\n      Product(filter: { mint_account: {eq: $mint_account} }) {\n        mint_account\n        mint_authority\n        devices_count\n        metadata {\n          name\n          symbol\n          uri\n          additional\n        }\n        vendor {\n          pubkey\n        }\n        devices(order: { tx: {slot: {dir: ASC} } }, first: $limit, after: $offset) {\n          pubkey\n          signing_alg\n          token_account\n          tx {\n            block_ts\n          }\n          did {\n            token_account\n            mint_account\n            metadata {\n              name\n              symbol\n              uri\n              additional\n            }\n            owner {\n              pubkey\n            }\n          }\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getVendor($vendor_pubkey: String) {\n      Vendor(filter: { pubkey: {eq: $vendor_pubkey} }) {\n        pubkey\n        products_count\n        products {\n          mint_account\n          mint_authority\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          devices_count\n          tx {\n            block_ts\n          }\n        }\n      }\n    }\n  "): (typeof documents)["\n    query getVendor($vendor_pubkey: String) {\n      Vendor(filter: { pubkey: {eq: $vendor_pubkey} }) {\n        pubkey\n        products_count\n        products {\n          mint_account\n          mint_authority\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          devices_count\n          tx {\n            block_ts\n          }\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getDevice($device_pubkey: String) {\n      Device(filter: { pubkey: {eq: $device_pubkey} }) {\n        pubkey\n        signing_alg\n        token_account\n        tx {\n          block_ts\n        }\n        product {\n          mint_account\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          vendor {\n            pubkey\n          }\n        }\n        did {\n          mint_account\n          mint_authority\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          owner {\n            pubkey\n          }\n        }\n      }\n    }\n  "): (typeof documents)["\n    query getDevice($device_pubkey: String) {\n      Device(filter: { pubkey: {eq: $device_pubkey} }) {\n        pubkey\n        signing_alg\n        token_account\n        tx {\n          block_ts\n        }\n        product {\n          mint_account\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          vendor {\n            pubkey\n          }\n        }\n        did {\n          mint_account\n          mint_authority\n          metadata {\n            name\n            symbol\n            uri\n            additional\n          }\n          owner {\n            pubkey\n          }\n        }\n      }\n    }\n  "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;