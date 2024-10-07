import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import Globe from "@/components/ui/globe";
import HyperText from "@/components/ui/hyper-text";

export default function Home() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Globe className="absolute inset-0 z-0 opacity-45 dark:opacity-25" />
      <HyperText
        className="relative text-8xl font-bold text-black dark:text-white z-10"
        duration={2000}
        text="Messecure"
      />
      <div className="inline-block text-center justify-center z-10">
        <span className={title()}>Secure&nbsp;</span>
        <span className={title({ color: "violet" })}>end-to-end&nbsp;</span>
        <br />
        <span className={title()}>encrypted communication.</span>
        <div className={subtitle({ class: "mt-4" })}>
          Messages and video calls protected with advanced encryption.
        </div>
      </div>
      <Button as={Link} color="secondary" href={siteConfig.links.github}>
        <GithubIcon /> Check our GitHub
      </Button>
    </section>
  );
}
