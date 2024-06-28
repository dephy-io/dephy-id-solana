import Head from "next/head";
import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/queries";
import { Product } from "@/components/product";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: async () => getProducts(),
  });

  return (
    <>
      <Head>
        <title>Dephy Explorer</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container gap-12 px-4 py-16 ">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 ">
            {data
              ? data.Product?.map((product, i: number) => (
                  <Product key={i} product={product} />
                ))
              : null}
          </div>
        </div>
      </main>
    </>
  );
}
