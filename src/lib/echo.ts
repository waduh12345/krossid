import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance: Echo<"reverb"> | null = null;
let currentToken: string | null = null;

export function getEcho(token: string): Echo<"reverb"> {
  // Re-create if token changed or no instance
  if (echoInstance && currentToken === token) return echoInstance;

  // Destroy old instance if token changed
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).Pusher = Pusher;
  }

  currentToken = token;

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
    forceTLS: process.env.NODE_ENV === "production",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return echoInstance;
}

export function destroyEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    currentToken = null;
  }
}
