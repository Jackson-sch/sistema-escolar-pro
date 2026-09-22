"use client";

import { IconUsers } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface UserItem {
  id: string;
  name?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  email?: string | null;
  role: string;
  image?: string | null;
  createdAt: string | Date;
}

export function InstitucionUsersTable({ users }: { users: UserItem[] }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden">
      <div className="p-4 px-6 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <IconUsers className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Usuarios y Miembros Vinculados
            </h3>
            <p className="text-xs text-muted-foreground">
              Directores, docentes y personal de la institución
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs font-mono font-bold">
          {users.length} miembros
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="text-xs font-bold">Usuario</TableHead>
              <TableHead className="text-xs font-bold">Rol</TableHead>
              <TableHead className="text-xs font-bold text-right">
                Fecha Registro
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const fullName =
                `${user.name || ""} ${user.apellidoPaterno || ""} ${user.apellidoMaterno || ""}`.trim() ||
                "Sin nombre";
              const initials = (user.name?.[0] || user.email?.[0] || "U").toUpperCase();

              return (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user.image || undefined} alt={fullName} />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-tight">
                          {fullName}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("es-PE", { timeZone: "America/Lima" })}
                  </TableCell>
                </TableRow>
              );
            })}

            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-xs text-muted-foreground italic"
                >
                  No hay usuarios vinculados a esta institución todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
