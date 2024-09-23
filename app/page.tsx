import {Link} from "@nextui-org/link";
import {Snippet} from "@nextui-org/snippet";
import {Code} from "@nextui-org/code";
import {button as buttonStyles} from "@nextui-org/theme";

import {siteConfig} from "@/config/site";
import {title, subtitle} from "@/components/primitives";
import {GithubIcon} from "@/components/icons";
import HyperText from "@/components/magicui/hyper-text";
import Globe from "@/components/magicui/globe";
import {RainbowButton} from "@/components/magicui/rainbow-button";
import NextLink from "next/link";
import {Button} from "@nextui-org/button";

export default function Home() {
      return (
            <section className="relative flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                  <Globe className="absolute inset-0 z-0 opacity-15"/>
                  <HyperText
                        className="relative text-8xl font-bold text-black dark:text-white z-10"
                        text="Messecure"
                        duration={2000}
                  />
                  <div className="inline-block text-center justify-center z-10">
                        <span className={title()}>Secure&nbsp;</span>
                        <span className={title({color: "violet"})}>end-to-end&nbsp;</span>
                        <br/>
                        <span className={title()}>encrypted communication.</span>
                        <div className={subtitle({class: "mt-4"})}>
                              Messages and video calls protected with advanced encryption.
                        </div>
                  </div>
                  {/*<NextLink href={siteConfig.links.github} className="z-10">*/}
                  <Button as={Link} color="secondary" href={siteConfig.links.github}>
                     <GithubIcon /> Check our GitHub
                  </Button>
                  {/*</NextLink>*/}
            </section>

            // <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            //   <div className="inline-block max-w-xl text-center justify-center">
            //     <span className={title()}>Make&nbsp;</span>
            //     <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
            //     <br />
            //     <span className={title()}>
            //       websites regardless of your design experience.
            //     </span>
            //     <div className={subtitle({ class: "mt-4" })}>
            //       Beautiful, fast and modern React UI library.
            //     </div>
            //   </div>
            //
            //   <div className="flex gap-3">
            //     <Link
            //       isExternal
            //       className={buttonStyles({
            //         color: "primary",
            //         radius: "full",
            //         variant: "shadow",
            //       })}
            //       href={siteConfig.links.docs}
            //     >
            //       Documentation
            //     </Link>
            //     <Link
            //       isExternal
            //       className={buttonStyles({ variant: "bordered", radius: "full" })}
            //       href={siteConfig.links.github}
            //     >
            //       <GithubIcon size={20} />
            //       GitHub
            //     </Link>
            //   </div>
            //
            //   <div className="mt-8">
            //     <Snippet hideCopyButton hideSymbol variant="bordered">
            //       <span>
            //         Get started by editing <Code color="primary">app/page.tsx</Code>
            //       </span>
            //     </Snippet>
            //   </div>
            // </section>
      );
}
