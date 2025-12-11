"use client"

import { Suspense } from "react"
import { Container } from "~/components/ui/container"
import { CtaContent } from "~/components/sections/cta-content"

export function CtaSection() {
  return (
    <Container>
      <Suspense fallback={
        <div className="h-[600px] flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded-md w-full h-full" />
        </div>
      }>
        <CtaContent />
      </Suspense>
    </Container>
  )
}