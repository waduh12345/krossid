"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";

// ...fungsi urlBase64ToUint8Array dan komponen lain tetap...

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home");
  }, [router]);

  return null;
}
