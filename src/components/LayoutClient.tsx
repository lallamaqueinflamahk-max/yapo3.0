"use client";

import { usePathname } from "next/navigation";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "./nav/Navbar";
import { useSession } from "@/lib/auth";

// #region agent log
function _log(msg: string, data: Record<string, unknown>) {
  fetch("http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: "LayoutClient.tsx", message: msg, data, timestamp: Date.now(), sessionId: "debug-session", hypothesisId: "H2" }),
  }).catch(() => {});
}
// #endregion

const BACK_PAGES = ["/wallet", "/cerebro", "/chat", "/profile", "/dashboard", "/video", "/comunidad"];
const TITLES: Record<string, string> = {
  "/home": "YAPÓ",
  "/wallet": "Billetera",
  "/cerebro": "Buscador YAPÓ",
  "/chat": "Chat",
  "/video": "Video",
  "/dashboard": "Dashboard",
  "/profile": "Perfil",
  "/comunidad": "Comunidad",
};

interface MeData {
  planName: string | null;
  badges: string[];
  verified: boolean;
}

export default function LayoutClient() {
  // #region agent log
  _log("LayoutClient render start", {});
  // #endregion
  const pathname = usePathname();
  const authSession = useNextAuthSession().data;
  const yapoSession = useSession();
  const identity = yapoSession?.identity;
  // #region agent log
  _log("LayoutClient after hooks", { pathname: pathname ?? null, hasIdentity: !!identity });
  // #endregion
  const [meData, setMeData] = useState<MeData>({ planName: null, badges: [], verified: false });

  const showBack = pathname !== "/home" && pathname !== "/" && BACK_PAGES.some((p) => pathname.startsWith(p));
  const title = TITLES[pathname] ?? "YAPÓ";
  const userImage = (authSession?.user as { image?: string })?.image ?? undefined;
  const userName =
    (authSession?.user as { name?: string })?.name ??
    (identity?.userId === "safe-user" ? "Usuario" : identity?.userId === "dev-master" ? "Dev Master" : undefined);
  const role = (identity?.roles?.[0] ?? null) as import("@/lib/auth").RoleId | null;

  useEffect(() => {
    // #region agent log
    _log("LayoutClient mounted", { pathname: pathname ?? null });
    // #endregion
    if (!authSession?.user?.id) {
      setMeData({ planName: null, badges: [], verified: false });
      return;
    }
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const user = data.user ?? {};
        setMeData({
          planName: user.subscriptionPlanName ?? null,
          badges: Array.isArray(data.badges) ? data.badges : [],
          verified: Boolean(data.verified),
        });
      })
      .catch(() => setMeData({ planName: null, badges: [], verified: false }));
  }, [authSession?.user?.id]);

  return (
    <Navbar
      userImage={userImage}
      userName={userName}
      showBack={showBack}
      title={title}
      role={role}
      planName={meData.planName}
      badges={meData.badges}
      verified={meData.verified}
    />
  );
}