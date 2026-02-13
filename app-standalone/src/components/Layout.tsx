import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ActionBar from "./ActionBar";

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col">
      <Header />
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden pt-14 pb-24"
        role="main"
      >
        {children}
        <Footer />
      </main>
      <ActionBar />
    </div>
  );
}
