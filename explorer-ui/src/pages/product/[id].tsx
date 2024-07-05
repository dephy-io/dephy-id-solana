/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

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
import { Input } from "@/components/ui/input";

import { getProduct, getDevice } from "@/queries";
import { type Product, type Did, type Maybe } from "@/gql/graphql";
import { Product as ProductItem } from "@/components/product";

interface Device {
  id: string;
  pubkey: string;
  did?: Maybe<Did>;
}

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

  const [pubkey, setPubkey] = useState("");
  const [device, setDevice] = useState<Device | null>(null);

  const { data: deviceData } = useQuery({
    queryKey: ["device", pubkey],
    queryFn: () => getDevice(pubkey),
    enabled: !!pubkey,
  });

  useEffect(() => {
    if (deviceData?.Device) {
      const { id, did, pubkey } = deviceData.Device[0] as unknown as Device;

      setDevice({ id, did, pubkey });
    } else {
      setDevice(null);
    }
  }, [deviceData]);

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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPubkey(event.target.value);
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
                <CardTitle className="flex items-center justify-between text-amber-100">
                  Devices
                  <div className="relative ml-auto flex md:flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="device pubkey..."
                      className="w-[200px] rounded-lg bg-background pl-8"
                      value={pubkey}
                      onChange={handleSearch}
                    />
                  </div>
                </CardTitle>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {device ? (
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>{device.pubkey}</TableCell>
                        <TableCell>{device.did?.metadata?.name}</TableCell>
                      </TableRow>
                    ) : null}
                    {!device &&
                      product?.devices?.map(({ pubkey, did }, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {page * limit + i + 1}
                            {/* <Link href={`/device/${pubkey}`}>
                              {page * limit + i + 1}
                            </Link> */}
                          </TableCell>
                          <TableCell>{pubkey}</TableCell>
                          <TableCell className="text-center">
                            {did?.metadata?.name}
                          </TableCell>
                          {/* <TableCell>{did?.metadata?.owner?.pubkey}</TableCell> */}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-between">
                {!device ? (
                  <>
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
                  </>
                ) : null}
              </CardFooter>
            </Card>
          ) : null}
        </div>
      </main>
    </>
  );
}
