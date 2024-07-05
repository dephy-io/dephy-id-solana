import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql'
import { gql, GraphQLClient } from 'graphql-request'
import type {
  GetProductQuery,
  GetProductQueryVariables,
  GetProductsQuery,
  GetVendorQuery,
  GetVendorQueryVariables,
  GetDeviceQuery,
  GetDeviceQueryVariables,
  GetProgramsQuery,
  GetProductsQueryVariables,
  GetVendorsQuery,
  GetVendorsQueryVariables
} from './gql/graphql'

import { env } from '@/env';

// const endpoint = 'http://localhost:10701/branch/main/graphql'
// const endpoint = 'https://indexer-dev-api.dephy.id/branch/main/graphql/explore'

export const gqlClient = new GraphQLClient(env.NEXT_PUBLIC_GRAPHQL_URI)

export async function getProducts(offset = 0, limit = 50) {
  const query: TypedDocumentNode<GetProductsQuery> = parse(gql`
    query getProducts ($limit: Int, $offset: String) {
      Product(first: $limit, after: $offset) {
        mint_account
        mint_authority
        devices_count
        metadata {
          name
          symbol
          uri
          additional
        }
        vendor {
          pubkey
        }
      }
    }
  `)

  const variables: GetProductsQueryVariables = {
    offset: `${offset - 1}`,
    limit,
  }

  return await gqlClient.request(query, variables)
}

export async function getProduct(mint_account: string, offset: number, limit: number) {
  const query: TypedDocumentNode<GetProductQuery> = parse(gql`
    query getProduct($mint_account: String, $limit: Int, $offset: String) {
      Product(filter: { mint_account: {eq: $mint_account} }) {
        mint_account
        mint_authority
        devices_count
        metadata {
          name
          symbol
          uri
          additional
        }
        vendor {
          pubkey
        }
        devices(order: { tx: {slot: {dir: ASC} } }, first: $limit, after: $offset) {
          pubkey
          signing_alg
          token_account
          tx {
            block_ts
          }
          did {
            token_account
            mint_account
            metadata {
              name
              symbol
              uri
              additional
            }
            owner {
              pubkey
            }
          }
        }
      }
    }
  `)

  const variables: GetProductQueryVariables = {
    mint_account,
    offset: (offset - 1).toString(),
    limit,
  }

  return await gqlClient.request(query, variables)
}

export async function getVendors(offset = 0, limit = 50) {
  const query: TypedDocumentNode<GetVendorsQuery> = parse(gql`
  query getVendors ($limit: Int, $offset: String) {
    Vendor(first: $limit, after: $offset) {
      pubkey
      products_count
      devices_count
      products {
        mint_account
        mint_authority
        metadata {
          name
          symbol
          uri
          additional
        }
        devices_count
        tx {
          block_ts
        }
      }
    }
  }
  `)

  const variables: GetVendorsQueryVariables = {
    offset: `${offset - 1}`,
    limit
  }

  return await gqlClient.request(query, variables)
}

export async function getVendor(vendor_pubkey: string) {
  const query: TypedDocumentNode<GetVendorQuery> = parse(gql`
    query getVendor($vendor_pubkey: String) {
      Vendor(filter: { pubkey: {eq: $vendor_pubkey} }) {
        pubkey
        products_count
        devices_count
        products {
          mint_account
          mint_authority
          metadata {
            name
            symbol
            uri
            additional
          }
          devices_count
          tx {
            block_ts
          }
        }
      }
    }
  `)

  const variables: GetVendorQueryVariables = {
    vendor_pubkey
  }

  return await gqlClient.request(query, variables)
}

export async function getDevice(device_pubkey: string) {
  const query: TypedDocumentNode<GetDeviceQuery> = parse(gql`
    query getDevice($device_pubkey: String) {
      Device(filter: { pubkey: {eq: $device_pubkey} }) {
        pubkey
        signing_alg
        token_account
        tx {
          block_ts
        }
        product {
          mint_account
          metadata {
            name
            symbol
            uri
            additional
          }
          vendor {
            pubkey
          }
        }
        did {
          mint_account
          mint_authority
          metadata {
            name
            symbol
            uri
            additional
          }
          owner {
            pubkey
          }
        }
      }
    }
  `)

  const variables: GetDeviceQueryVariables = {
    device_pubkey
  }

  return await gqlClient.request(query, variables)
}

export async function getPrograms() {
  const query: TypedDocumentNode<GetProgramsQuery> = parse(gql`
    query getPrograms {
      Program {
        pubkey
        authority {
          pubkey
        }
        vendors_count
        products_count
        devices_count
      }
    }
  `)

  const variables = {}

  return await gqlClient.request(query, variables)
}
