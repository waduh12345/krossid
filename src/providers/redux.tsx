"use client";
import { SessionProvider } from "next-auth/react";
import { store } from "@/lib/store";
import { Provider } from "react-redux";
import { I18nProvider } from "@/contexts/i18n-context";

function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </Provider>
    </SessionProvider>
  );
}

export default ReduxProvider;
