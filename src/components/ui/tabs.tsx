"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextType = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextType | null>(null);

function useTabsCtx() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used inside <Tabs>");
  return ctx;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const v = value ?? internal;
  const setV = (next: string) => {
    if (onValueChange) onValueChange(next);
    if (value === undefined) setInternal(next);
  };
  return (
    <TabsContext.Provider value={{ value: v, setValue: setV }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const { value: current, setValue } = useTabsCtx();
  const active = current === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        active
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-background/40",
        className
      )}
      {...props}
    />
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { value: current } = useTabsCtx();
  if (current !== value) return null;
  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in",
        className
      )}
      {...props}
    />
  );
}
