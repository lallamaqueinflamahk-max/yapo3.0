import type { ReactNode } from "react";
import Navbar from "./nav/Navbar";
import Footer from "./Footer";
import ActionBar from "./ActionBar";
import LayoutClient from "./LayoutClient";

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col">
      <LayoutClient />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-24" role="main">
        {children}
        <Footer />
      </main>
      <ActionBar />
    </div>
  );
}
