"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import InviteBanner from "@/components/InviteBanner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hasCouple, coupleMembers } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const isSolo = !hasCouple || coupleMembers.length === 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {isSolo && <InviteBanner />}
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
