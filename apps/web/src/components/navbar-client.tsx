"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { ColumnLink, NavColumn, NavigationData } from "@/types";
import { MenuLink } from "./elements/menu-link";
import { SanityButtons } from "./elements/sanity-buttons";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { ModeToggle } from "./mode-toggle";

function DesktopColumnDropdown({
  column,
}: {
  column: Extract<NavColumn, { type: "column" }>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1 px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        type="button"
      >
        {column.title}
        <ChevronDown className="size-3 transition-transform group-hover:rotate-180" />
      </button>
      {isOpen ? (
        <div
          className="fade-in-0 zoom-in-95 absolute top-full left-0 z-50 min-w-[280px] animate-in rounded-lg border bg-popover p-2 shadow-lg"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          role="menu"
        >
          <div className="grid gap-1">
            {column.links?.map((link: ColumnLink) => (
              <MenuLink
                description={link.description || ""}
                href={link.href || ""}
                icon={link.icon}
                key={link._key}
                name={link.name || ""}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DesktopColumnLink({
  column,
}: {
  column: Extract<NavColumn, { type: "link" }>;
}) {
  if (!column.href) return null;

  return (
    <Link
      className="px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
      href={column.href}
    >
      {column.name}
    </Link>
  );
}

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex h-10 w-40 items-center">
            <div className="h-10 w-40 animate-pulse rounded bg-muted/50" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded bg-muted/50 md:hidden" />
        </div>
      </div>
    </header>
  );
}

export function NavbarClient({ navbarData, settingsData }: NavigationData) {
  const { columns, buttons } = navbarData || {};
  const { logo, siteTitle } = settingsData || {};

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex h-10 w-40 items-center">
            {logo && (
              <Logo
                alt={siteTitle || ""}
                height={40}
                image={logo}
                priority
                width={120}
              />
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {columns?.map((column) => {
              if (column.type === "column") {
                return (
                  <DesktopColumnDropdown column={column} key={column._key} />
                );
              }
              if (column.type === "link") {
                return <DesktopColumnLink column={column} key={column._key} />;
              }
              return null;
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <ModeToggle />
            <SanityButtons
              buttonClassName="rounded-lg"
              buttons={buttons || []}
              className="flex items-center gap-2"
            />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <MobileMenu navbarData={navbarData} settingsData={settingsData} />
          </div>
        </div>
      </div>
    </header>
  );
}
