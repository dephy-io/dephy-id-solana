import Head from "next/head";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronsRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getProducts, getPrograms } from "@/queries";
import { Product } from "@/components/product";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: async () => getProducts(),
  });

  const { data: programData } = useQuery({
    queryKey: ["program"],
    queryFn: async () => getPrograms(),
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
          {programData?.Program?.length ? (
            <div className="mb-10 grid gap-4 md:grid-cols-3 md:gap-8">
              <Card className="border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">
                    Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/vendors"
                    className="flex items-center justify-between text-2xl font-bold text-orange-400 hover:opacity-60 active:opacity-70"
                  >
                    {programData.Program[0]?.vendors_count}
                    <ChevronsRight size={16} />
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">
                    Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/products"
                    className="flex items-center justify-between text-2xl font-bold text-orange-400 hover:opacity-60 active:opacity-70"
                  >
                    {programData.Program[0]?.products_count}
                    <ChevronsRight size={16} />
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">
                    Devices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">
                    {programData.Program[0]?.devices_count}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
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
