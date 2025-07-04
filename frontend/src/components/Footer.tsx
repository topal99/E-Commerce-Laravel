import Link from "next/link"
import Image from 'next/image'; 

import { Facebook, Twitter, Instagram, Github } from "lucide-react"
// import Logo from "@/logo"

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Instagram, href: "#", name: "Instagram" },
  ]

  const footerLinks = {
    Company: [
      { text: "About us", href: "#" },
      { text: "Contact us", href: "#" },
      { text: "Careers", href: "#" },
      { text: "Press", href: "#" },
    ],
    Product: [
      { text: "Features", href: "#" },
      { text: "Pricing", href: "#" },
      { text: "Reviews", href: "#" },
      { text: "Updates", href: "#" },
    ],
    Support: [
      { text: "Help Center", href: "#" },
      { text: "FAQ", href: "#" },
      { text: "Shipping & Returns", href: "#" },
      { text: "Track Order", href: "#" },
    ],
  }

  return (
    <footer className="text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col">

            <div className="flex items-center gap-2 mb-4">
              <Image src="/mylogo.png" alt="E-Comm Logo" width={50} height={50} className="h-10 w-10" />
              <Link href="/">
                <span className="text-xl font-bold">E-Comm</span>
              </Link>
              </div>

            <p className="text-muted-foreground text-sm">
              Est earum aperiam commodi dolorum quo et. Voluptatibus excepturi rerum assumenda nulla delectus vitae praesentium atque. At iste illum sunt ipsa cum earum et. Sunt culpa alias a magni sint a.
            </p>
            
            <div className="flex gap-4 mt-6">
              {socialLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.text}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} E-Comm. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
