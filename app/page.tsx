"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import LandingScreen from "@/components/LandingScreen";

export default function Home() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account");
      if (res.ok) {
        setAuthed(true);
        router.replace("/account");
      }
    })();
  }, [router]);

  return (
    <>
      <Header authed={authed} />
      <LandingScreen />
    </>
  );
}
