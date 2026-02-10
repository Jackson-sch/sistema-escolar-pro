"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { SedeDialog } from "./sede-dialog";
import {
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconMail,
  IconUser,
  IconPlus,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { deleteSedeAction } from "@/actions/sedes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SedesListProps {
  initialData: any[];
}

export function SedesList({ initialData }: SedesListProps) {
  const [sedes, setSedes] = useState(initialData);
  const [open, setOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<any>(null);
  const router = useRouter();

  // Sync with initialData if it changes (e.g. after server revalidate)
  // Actually, router.refresh() updates the prop passed from page.
  // So we should use initialData directly or sync state.
  // If we just use initialData, we don't need local state for data.

  const handleDelete = async (id: string, nombre: string) => {
    if (
      confirm(
        `¿Está seguro de eliminar la sede "${nombre}"? Esta acción no se puede deshacer.`,
      )
    ) {
      const res = await deleteSedeAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Sede eliminada correctamente");
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sedes Institucionales</h2>
          <p className="text-sm text-muted-foreground">
            Gestione las diferentes sedes o locales de la institución.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedSede(null);
            setOpen(true);
          }}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Nueva Sede
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialData.map((sede) => (
          <Card
            key={sede.id}
            className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/10"
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full ${sede.activo ? "bg-green-500" : "bg-gray-300"}`}
            />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <IconBuilding className="h-5 w-5 text-primary" />
                  {sede.nombre}
                </CardTitle>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedSede(sede);
                      setOpen(true);
                    }}
                  >
                    <IconPencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-red-600"
                    onClick={() => handleDelete(sede.id, sede.nombre)}
                  >
                    <IconTrash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-1">
                {sede.codigoIdentifier ? (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    Cod: {sede.codigoIdentifier}
                  </span>
                ) : null}
                {!sede.activo && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    Inactiva
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {sede.direccion && (
                <div className="flex items-start gap-2">
                  <IconMapPin className="h-4 w-4 mt-0.5 text-primary/70 shrink-0" />
                  <span>{sede.direccion}</span>
                </div>
              )}
              {(sede.telefono || sede.email) && (
                <div className="flex flex-col gap-1">
                  {sede.telefono && (
                    <div className="flex items-center gap-2">
                      <IconPhone className="h-4 w-4 text-primary/70 shrink-0" />
                      <span>{sede.telefono}</span>
                    </div>
                  )}
                  {sede.email && (
                    <div className="flex items-center gap-2">
                      <IconMail className="h-4 w-4 text-primary/70 shrink-0" />
                      <span>{sede.email}</span>
                    </div>
                  )}
                </div>
              )}
              {sede.director && (
                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <IconUser className="h-4 w-4 text-primary/70 shrink-0" />
                  <span className="font-medium text-foreground">
                    {sede.director}
                  </span>
                  <span className="text-xs">(Director)</span>
                </div>
              )}
            </CardContent>
            {/* <CardFooter className="bg-muted/20 px-6 py-3 text-xs text-muted-foreground flex justify-between">
              <span>Creado: {new Date(sede.createdAt).toLocaleDateString()}</span>
              <span>Niveles: {sede._count?.nivelesAcademicos || 0}</span>
            </CardFooter> */}
            <CardFooter className="bg-muted/10 px-6 py-2 text-xs text-muted-foreground flex justify-between items-center border-t">
              <span>
                Niveles asociados: {sede._count?.nivelesAcademicos || 0}
              </span>
            </CardFooter>
          </Card>
        ))}

        {initialData.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
            <IconBuilding className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No hay sedes registradas
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comience agregando una nueva sede para su institución.
            </p>
            <Button
              onClick={() => {
                setSelectedSede(null);
                setOpen(true);
              }}
            >
              <IconPlus className="mr-2 h-4 w-4" />
              Crear Primera Sede
            </Button>
          </div>
        )}
      </div>

      <SedeDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setSelectedSede(null);
        }}
        sede={selectedSede}
      />
    </div>
  );
}
