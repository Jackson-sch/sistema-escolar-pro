"use client";
import { RouteError } from "@/components/common/route-error";
export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <RouteError reset={reset} homeUrl="/portal" />; }
