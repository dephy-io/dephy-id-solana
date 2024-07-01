import { type ReactElement } from "react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto max-w-full grow md:max-w-[960px]">{children}</div>
      <Footer />
    </div>
  );
}
