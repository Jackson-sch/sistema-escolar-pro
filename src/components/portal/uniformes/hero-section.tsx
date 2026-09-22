import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <>
      <div className="group relative h-[400px] overflow-hidden rounded-2xl border border-border/50 shadow-sm lg:col-span-2">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD05GD9SQDwx0Gz8icLHRbwNbo2kbKgaeClXAJ29QUTrOPr29DDQJNmDNEuySGp5l02NVhg2sZfXkvqDw0K0X_uRYc-QaqmIxzTDFf8Kvs5mCjniV_N1l1VvtiT6W5ODh2u3rgzNUvmHzTe52ACjqNuP4GDcRjGuQaW4BFOA1aQW2ABxszBD7njxq64rGuJdsrd1JjYCLVkZSe8oHrzWcmQDM6ojAQs0-hoRjC-I_23RVZPMT3r0xg14LHRYWwq7ynuBj6pgMLJYsI"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Heritage Formal Wear"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 space-y-4">
          <Badge className="bg-blue-500/20 text-blue-500 border-none px-4 py-1 text-[10px] font-black tracking-widest uppercase">
            Temporada Escolar 2026
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Indumentaria & Material Escolar
          </h2>
          <p className="text-slate-200 text-sm font-medium max-w-md leading-relaxed">
            Uniformes oficiales, agendas institucionales, libros de plan lector y útiles escolares con entrega coordinada.
          </p>
          <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-12 px-8 font-black flex gap-2 group cursor-pointer">
            Explorar Catálogo{" "}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="group relative h-[400px] overflow-hidden rounded-2xl border border-border/50 shadow-sm">
        <Image
          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&auto=format&fit=crop&q=80"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Agendas y Libros"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-10 left-10">
          <h3 className="text-2xl font-black text-white">Agendas & Libros 2026</h3>
          <p className="text-slate-300 text-xs font-medium mt-1">
            Material pedagógico oficial y libretas de control.
          </p>
        </div>
      </div>
    </>
  );
}
