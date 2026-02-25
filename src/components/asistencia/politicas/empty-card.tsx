import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconPlus } from "@tabler/icons-react";

export default function EmptyCard({
  handleOpenDialog,
}: {
  handleOpenDialog: () => void;
}) {
  return (
    <Card className="border-dashed h-80 flex flex-col items-center justify-center text-muted-foreground bg-card/50 border-[#2a262433] hover:border-primary transition-all duration-500">
      <Button
        onClick={() => handleOpenDialog()}
        variant="outline"
        className="group size-20 rounded-full border-dashed mb-4 hover:border-blue-500 transition-all duration-500"
      >
        <IconPlus className="size-8 group-hover:scale-125 transition-transform" />
      </Button>
      <p className="font-bold text-foreground mb-1">Sin políticas activas</p>
      <p className="text-xs text-muted-foreground px-10 text-center">
        Aún no has configurado reglas específicas.{" "}
        <button
          onClick={() => handleOpenDialog()}
          className="text-blue-500 font-bold hover:underline"
        >
          Crear primera regla
        </button>
      </p>
    </Card>
  );
}
