"use client";

import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="size-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 transition-colors group"
      title="Cerrar sesión"
    >
      <IconLogout className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
    </button>
  );
}
