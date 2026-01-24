"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import React, { useState } from "react";
import ThemesProvider from "@/components/ThemesProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AntdRegistry>
        <ThemesProvider>{children}</ThemesProvider>
      </AntdRegistry>
    </QueryClientProvider>
  );
}
