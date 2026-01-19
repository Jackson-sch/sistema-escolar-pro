import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconAlertCircle } from "@tabler/icons-react";
import { ReactNode } from "react";

interface NotasTableProps {
  children: ReactNode;
  isEmpty: boolean;
}

export function NotasTable({ children, isEmpty }: NotasTableProps) {
  return (
    <div className="rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-sm shadow-2xl shadow-violet-500/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/40">
            <TableHead className="w-[60px] text-center text-[10px] font-black uppercase tracking-widest hidden md:table-cell">
              ORD
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">
              Estudiante
            </TableHead>
            <TableHead className="w-[140px] text-center text-[10px] font-black uppercase tracking-widest">
              Calificación
            </TableHead>
            <TableHead className="w-[140px] text-right text-[10px] font-black uppercase tracking-widest hidden sm:table-cell">
              Estado
            </TableHead>
            <TableHead className="w-[80px] text-center text-[10px] font-black uppercase tracking-widest">
              Feedback
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty ? (
            <TableRow>
              <TableCell colSpan={5} className="h-80 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground animate-in fade-in zoom-in duration-500">
                  <div className="p-4 rounded-full bg-muted/20 mb-4">
                    <IconAlertCircle className="size-10 opacity-20" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">
                    No se han encontrado registros
                  </p>
                  <p className="text-[10px] font-medium mt-1 opacity-30">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
}
