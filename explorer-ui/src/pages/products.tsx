/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Head from "next/head";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getProducts } from "@/queries";

const limit = 50;

export default function Products() {
  const page = 0;

  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: async () => getProducts(),
  });

  return (
    <>
      <Head>
        <title>Products - Dephy Explorer</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <div className="px-4 py-16">
          {data ? (
            <Card className="mt-10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-amber-100">
                  Products
                </CardTitle>
                <CardDescription className="text-[#9DC8B9]">
                  {data.Product?.length} products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Mint Account</TableHead>
                      <TableHead>Url</TableHead>
                      <TableHead>SolanaFM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.Product?.map((product, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Link href={`/product/${product.mint_account}`}>
                            {page * limit + i + 1}
                          </Link>
                        </TableCell>
                        <TableCell>{product.metadata?.symbol}</TableCell>
                        <TableCell>{product.metadata?.name}</TableCell>
                        <TableCell>{product.mint_account}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://solana.fm/address/${product.mint_account}`}
                            className="hover:opacity-60 active:opacity-70"
                          >
                            <Link2 className="h-4 w-4 text-amber-100" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </>
  );
}
