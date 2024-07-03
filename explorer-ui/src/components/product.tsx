/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Link2, ChevronsRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductType {
  __typename?: "Product_Type";
  mint_account: string;
  mint_authority?: string | null;
  devices_count: any;
  metadata?: {
    __typename?: "TokenMetadata_Type";
    name?: string | null;
    symbol?: string | null;
    uri?: string | null;
    additional: Array<any>;
  } | null;
  vendor: { __typename?: "Vendor_Type"; pubkey: string };
}

export function Product({ product }: { product: ProductType }) {
  return (
    <Card className="border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">
          {product.metadata?.symbol}
        </CardTitle>
        {product.metadata?.uri ? (
          <a
            href={product.metadata?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 active:opacity-70"
          >
            <Link2 className="h-4 w-4 text-amber-100" />
          </a>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-400">
          <Link
            className="flex items-center justify-between py-2 hover:opacity-60 active:opacity-70"
            href={`/product/${product.mint_account}`}
          >
            {product.metadata?.name}
            <ChevronsRight size={16} />
          </Link>
        </div>
        <p className="mt-2 text-xs text-[#9DC8B9]">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://solana.fm/address/${product.mint_account}`}
            className="hover:opacity-60 active:opacity-70"
          >
            {product.mint_account}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
