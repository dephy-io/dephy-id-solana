/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getProduct } from "@/queries";
import { type Product } from "@/gql/graphql";

const limit = 50;

export default function Product() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 0));

  const { data } = useQuery({
    queryKey: ["product", router?.query?.id],
    queryFn: async ({ queryKey }) => {
      const [_key, id] = queryKey;

      if (typeof id === "string") {
        return getProduct(id, page, limit);
      } else {
        console.error("Invalid id type. Expected string, got", typeof id);
      }
    },
    enabled: !!router?.query?.id,
  });

  useEffect(() => {
    if (data?.Product) {
      const productData = data.Product[0] as Product;
      setProduct(productData);
    }
  }, [data]);
  return (
    <>
      <Head>
        <title>Dephy Explorer</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {product ? (
            <>
              <div>
                <Link href={`/product/${product.mint_account}`}>
                  {product.metadata.name}
                </Link>
                <div>{product.metadata.symbol}</div>
                <div>{product.metadata.uri}</div>
                <a
                  target="_blank"
                  href={`https://solana.fm/address/${product.mint_account}`}
                >
                  {product.mint_account}
                </a>
              </div>
              <div>
                <div>{product.devices_count} devices</div>
              </div>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pubkey</th>
                      <th>Name</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.devices?.map(({ pubkey, did }, i) => (
                      <tr key={i}>
                        <td>
                          <Link href={`/device/${pubkey}`}>
                            {page * limit + i + 1}
                          </Link>
                        </td>
                        <td>{pubkey}</td>
                        <td>{did?.metadata?.name}</td>
                        <td>{did?.metadata?.owner?.pubkey}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
