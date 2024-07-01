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

export const Footer = ({ className }: { className?: string }) => {
  return (
    <div
      className={`${"flex items-center justify-between px-8 pb-4 pt-8"} ${className}`}
    >
      <Link href="/">
        <Image src={Logo} alt="" className="w-30 h-8" />
      </Link>

      <div className="flex items-center justify-between gap-6">
        {medias.map(({ icon, link }, index) => (
          <a
            key={index}
            target="_blank"
            href={link}
            className="flex flex-col items-center justify-center text-white"
          >
            <Image src={icon} className="h-5 w-6" alt={link} />
          </a>
        ))}
      </div>
    </div>
  );
};
