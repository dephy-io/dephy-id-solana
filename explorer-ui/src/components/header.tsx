/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Link from "next/link";
import Image from "next/image";

import Logo from "@/assets/logo_text.svg";
import Discord from "@/assets/discord.svg";
import Twitter from "@/assets/twitter.svg";
import Github from "@/assets/github.svg";

const medias = [
  {
    icon: Discord,
    link: "https://discord.gg/Wbx2BAn2A4",
  },
  {
    icon: Twitter,
    link: "https://twitter.com/dephynetwork",
  },
  {
    icon: Github,
    link: "https://github.com/dephy-io",
  },
];

export const Header = function () {
  return (
    <div className="flex h-[69px] w-full items-center justify-between bg-neutral-900 px-8 py-4">
      <div className="flex h-8 items-center justify-start gap-[11px]">
        <Link href="/">
          <Image src={Logo} alt="" className="w-30 h-8" />
        </Link>
      </div>

      <div className="flex items-center justify-start gap-6">
        {medias.map(({ icon, link }, i) => (
          <a key={i} target="_blank" href={link} className="flex items-center">
            <Image src={icon} className="h-5 w-6" alt={link} />
          </a>
        ))}
      </div>
    </div>
  );
};
