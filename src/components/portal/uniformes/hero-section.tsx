import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <>
      <div className="lg:col-span-2 relative h-[400px] rounded-[3rem] overflow-hidden group">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD05GD9SQDwx0Gz8icLHRbwNbo2kbKgaeClXAJ29QUTrOPr29DDQJNmDNEuySGp5l02NVhg2sZfXkvqDw0K0X_uRYc-QaqmIxzTDFf8Kvs5mCjniV_N1l1VvtiT6W5ODh2u3rgzNUvmHzTe52ACjqNuP4GDcRjGuQaW4BFOA1aQW2ABxszBD7njxq64rGuJdsrd1JjYCLVkZSe8oHrzWcmQDM6ojAQs0-hoRjC-I_23RVZPMT3r0xg14LHRYWwq7ynuBj6pgMLJYsI"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Heritage Formal Wear"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 space-y-4">
          <Badge className="bg-blue-500/20 text-blue-500 border-none px-4 py-1 text-[10px] font-black tracking-widest uppercase">
            Nueva Temporada
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Uniformería de Gala
          </h2>
          <p className="text-slate-200 text-sm font-medium max-w-md leading-relaxed">
            Blazers y camisas confeccionados con precisión para los estándares
            académicos modernos.
          </p>
          <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-12 px-8 font-black flex gap-2 group">
            Explorar Colección{" "}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="relative h-[400px] rounded-[3rem] overflow-hidden group">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP9SVkh2sFAn6lSnnZIgUrYT9fs1vc-FW9KknwTlI0NA7UOMhEzdoOiMmMKZA7GWgnaGa9VIiuLPXgNofluNqQrgkp0-UQOrVWDI9IcEWFpAPrf7pM360BIon9fD0s9C__PGzPsftHoLxC0yuQM83Km6_PGjDkGoVzJV8DbaL4gdfk6r13ivDJ4VWhojls2HuvYdFFcF22OgQmsph0Dt2MkDoZBljQvdGzkyMjUId1L1fMggaO61DLwL6yeGLe7EjLA9A3eNiDuwI"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Elite Athletics"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-10 left-10">
          <h3 className="text-2xl font-black text-white">Deportes Elite</h3>
          <p className="text-slate-300 text-xs font-medium mt-1">
            Kits deportivos de alto rendimiento.
          </p>
        </div>
      </div>
    </>
  );
}
