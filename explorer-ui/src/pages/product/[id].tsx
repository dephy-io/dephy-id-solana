/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  // PaginationEllipsis,
  // PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { getProduct } from "@/queries";
import { type Product } from "@/gql/graphql";
import { Product as ProductItem } from "@/components/product";

const limit = 50;

export default function Product() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(Number(searchParams.get("page") ?? 0));
  const [product, setProduct] = useState<Product | null>(null);

  const { data } = useQuery({
    queryKey: ["product", router?.query?.id, page],
    queryFn: async ({ queryKey }) => {
      const [_key, id] = queryKey;

      if (typeof id === "string") {
        return getProduct(id, page * limit, limit);
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

  const handleSwitchPage = (page: number) => {
    let _page = page;

    if (page < 0) {
      _page = 0;
    }

    if (page > product?.devices_count / limit) {
      _page = Math.floor(product?.devices_count / limit);
    }

    setPage(_page);
  };

  return (
    <>
      <Head>
        <title>Dephy Explorer</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <div className="px-4 py-16">
          {product ? <ProductItem product={product} /> : null}

          {product ? (
            <Card className="mt-10">
              <CardHeader>
                <CardTitle className="text-amber-100">Devices</CardTitle>
                <CardDescription className="text-[#9DC8B9]">
                  {product?.devices_count} devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Pubkey</TableHead>
                      <TableHead>Name</TableHead>
                      {/* <TableHead>Owner</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product?.devices?.map(({ pubkey, did }, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Link href={`/device/${pubkey}`}>
                            {page * limit + i + 1}
                          </Link>
                        </TableCell>
                        <TableCell>{pubkey}</TableCell>
                        <TableCell>{did?.metadata?.name}</TableCell>
                        {/* <TableCell>{did?.metadata?.owner?.pubkey}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex items-center gap-1 text-xs text-[#9DC8B9]">
                  Showing
                  <strong>
                    {page * limit + 1}-{(page + 1) * limit}
                  </strong>
                  of <strong>{product.devices_count}</strong> devices
                </div>
                <Pagination className="mx-0 w-auto text-white">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handleSwitchPage(page - 1)}
                        href="#"
                      />
                    </PaginationItem>
                    {/* <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem> */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handleSwitchPage(page + 1)}
                        href="#"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            </Card>
          ) : null}
        </div>
      </main>
    </>
  );
}
