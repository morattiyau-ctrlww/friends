"use client"

import dynamic from "next/dynamic"

const Feed = dynamic(() => import("@/components/feed"), {
  ssr: false,
  loading: () => <p className="sr-only">Loading feed…</p>,
})

export default function Page() {
  return <Feed />
}
