"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";
import React from 'react';

const AntdConfig = ({ children }: { children: React.ReactNode }) => {
  const { theme: currentTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render with default theme server-side to avoid hydration mismatch
    return (
        <ConfigProvider direction="rtl">
            {children}
        </ConfigProvider>
    );
  }

  const isDark = currentTheme === 'dark' || resolvedTheme === 'dark';

  return (
    <ConfigProvider
      direction="rtl"
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default function ThemesProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <AntdConfig>{children}</AntdConfig>
    </NextThemesProvider>
  );
}
