import Link from "next/link"
import { ArrowUpRight, ClipboardCheck, PackageCheck, Wrench } from "lucide-react"
import { MagmaBrand } from "@/components/magma-brand"

export default function Home() {
  return (
    <div className="min-h-full w-full">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <MagmaBrand />
        <Link href="/login" className="font-mono text-[11px] font-bold tracking-[.16em] text-[#d9cfc8] transition-colors hover:text-primary">ACCEDER →</Link>
      </header>
      <main className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:py-24">
        <section>
          <p className="mb-5 font-mono text-[11px] font-bold tracking-[.18em] text-primary">OPERACIÓN {"//"} SIN FRICCIÓN</p>
          <h1 className="max-w-3xl font-[family:var(--font-anton)] text-5xl leading-[.95] tracking-tight text-[#f3efea] sm:text-7xl">CUANDO ALGO FALLA, EL EQUIPO ACTÚA.</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Magma Service Desk concentra reportes, seguimiento e inventario para que los problemas no se queden esperando en un chat.</p>
          <Link href="/login" className="mt-9 inline-flex h-11 items-center gap-2 bg-primary px-5 font-mono text-xs font-black tracking-[.12em] text-primary-foreground transition-transform hover:-translate-y-0.5">ENTRAR AL CENTRO DE OPERACIONES <ArrowUpRight className="size-4" /></Link>
        </section>
        <section className="border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-[10px] font-bold tracking-[.18em] text-primary">EL SISTEMA</p>
          <div className="mt-7 space-y-6">
            <div className="flex gap-4"><ClipboardCheck className="mt-1 size-5 text-primary" /><div><h2 className="font-semibold">Reporta con contexto</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Ubicación, evidencia y detalle para resolver bien desde el inicio.</p></div></div>
            <div className="flex gap-4"><Wrench className="mt-1 size-5 text-primary" /><div><h2 className="font-semibold">Gestiona la ejecución</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Cada solicitud tiene estado, responsable y trazabilidad.</p></div></div>
            <div className="flex gap-4"><PackageCheck className="mt-1 size-5 text-primary" /><div><h2 className="font-semibold">Cuida los recursos</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">El consumo de insumos queda asociado a la solución real.</p></div></div>
          </div>
        </section>
      </main>
      <div className="overflow-hidden border-y border-border py-3 font-mono text-[10px] font-bold tracking-[.16em] text-[#d9cfc8]"><div className="animate-[pulse_4s_ease-in-out_infinite] whitespace-nowrap">REPORTES CLAROS <span className="mx-4 text-primary">{"//"}</span> RESPUESTA ORDENADA <span className="mx-4 text-primary">{"//"}</span> CONTROL DE INSUMOS <span className="mx-4 text-primary">{"//"}</span> OPERACIÓN QUE AVANZA</div></div>
    </div>
  );
}
