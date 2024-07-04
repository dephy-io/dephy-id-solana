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
  CardFooter,
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
                      <TableHead>Name</TableHead>
                      <TableHead>Mint Account</TableHead>
                      <TableHead>Url</TableHead>
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
                        <TableCell>{product.metadata?.name}</TableCell>
                        <TableCell>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://solana.fm/address/${product.mint_account}`}
                            className="flex items-center gap-x-1 hover:opacity-60 active:opacity-70"
                          >
                            {product.mint_account}
                            <Link2 className="h-4 w-4 text-amber-100" />
                          </a>
                        </TableCell>
                        <TableCell>
                          {product.metadata?.uri ? (
                            <a
                              href={product.metadata?.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-x-1 hover:opacity-60 active:opacity-70"
                            >
                              {product.metadata?.uri}
                              <Link2 className="h-4 w-4 text-amber-100" />
                            </a>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              {/* <CardFooter className="justify-between">
                <div className="flex items-center gap-1 text-xs text-[#9DC8B9]">
                  Showing
                  <strong>
                    {page * limit + 1}-{(page + 1) * limit}
                  </strong>
                  of <strong>{data.Product?.length}</strong> devices
                </div>
              </CardFooter> */}
            </Card>
          ) : null}
        </div>
      </main>
    </>
  );
}
