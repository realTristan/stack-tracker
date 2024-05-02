"use client";

import {
  NavbarContent,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  Button,
  NavbarMenu,
  NavbarMenuItem,
  Navbar as NextUINavbar,
} from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <NextUINavbar
      onMenuOpenChange={setIsMenuOpen}
      height="100px"
      maxWidth="full"
      position="sticky"
      isBlurred={false}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="text-xl">Stack Tracker</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end" className="hidden gap-12 sm:flex">
        <NavbarItem>
          <Link href="/" className="text-black hover:underline">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/signin" className="text-black hover:underline">
            Sign in
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Button as={Link} color="primary" href="/signup">
            Sign up
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="gap-4">
        <NavbarMenuItem>
          <Link href="/" className="text-black hover:underline">
            Home
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link href="/signin" className="text-black hover:underline">
            Sign in
          </Link>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <Button href="/signup" color="primary">
            Sign up
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUINavbar>
  );
}
