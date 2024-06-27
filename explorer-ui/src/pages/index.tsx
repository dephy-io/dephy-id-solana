import Head from "next/head";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/queries";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: async () => getProducts(),
  });
  console.log(data);

  return (
    <>
      <Head>
        <title>Dephy Explorer</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {data
            ? data.Product?.map(
                ({ metadata: { name, symbol, uri }, mint_account }, i) => (
                  <div key={i}>
                    <Link href={`/product/${mint_account}`}>{name}</Link>
                    <div>{symbol}</div>
                    <div>{uri}</div>
                    <a
                      target="_blank"
                      href={`https://solana.fm/address/${mint_account}`}
                    >
                      {mint_account}
                    </a>
                  </div>
                ),
              )
            : null}
        </div>
      </main>
    </>
  );
}
