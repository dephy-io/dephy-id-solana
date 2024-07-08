/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Head from "next/head";
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

import { getVendors } from "@/queries";

const limit = 50;

export default function Vendors() {
  const page = 0;

  const { data } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => getVendors(),
  });

  return (
    <>
      <Head>
        <title>Vendors - Dephy Explorer</title>
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
                  {data.Vendor?.length} vendors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Pubkey</TableHead>
                      <TableHead>Products Count</TableHead>
                      <TableHead>Devices Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.Vendor?.map((vendor, i) => (
                      <TableRow key={i}>
                        <TableCell>{page * limit + i + 1}</TableCell>
                        <TableCell>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://solana.fm/address/${vendor.pubkey}`}
                            className="flex items-center gap-x-1 hover:opacity-60 active:opacity-70"
                          >
                            {vendor.pubkey}
                            <Link2 className="h-4 w-4 text-amber-100" />
                          </a>
                        </TableCell>
                        <TableCell className="text-center">
                          {vendor.products_count}
                        </TableCell>
                        <TableCell className="text-center">
                          {vendor.devices_count}
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
