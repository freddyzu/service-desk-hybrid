import Image from "next/image"
import { cn } from "@/lib/utils"

type MagmaBrandProps = {
  compact?: boolean
  className?: string
}

export function MagmaBrand({ compact = false, className }: MagmaBrandProps) {
  return (
    <div className={cn("magma-brand", compact && "magma-brand--compact", className)}>
      <Image
        className="magma-icon"
        src="/magma-favicon.png"
        alt="Magma"
        width={30}
        height={30}
        priority
      />
      <span className="magma-wordmark" aria-label="MAGMA GROWTH">
        <span>MAGMA</span>
        <small>GROWTH</small>
      </span>
      {!compact && (
        <>
          <span className="magma-divider" aria-hidden="true" />
          <span className="magma-product-label">SERVICE DESK</span>
        </>
      )}
    </div>
  )
}
