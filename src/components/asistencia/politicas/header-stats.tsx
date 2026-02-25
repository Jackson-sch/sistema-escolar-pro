import { Card } from "@/components/ui/card";
import { IconHourglass, IconLayersIntersect, IconSettings } from "@tabler/icons-react";

export default function HeaderStats({ politicas }: { politicas: any[] }) {

  const DataPoliticas = [
    {
      title: "Niveles Activos",
      value: politicas
        .filter((p) => p.activo)
        .length.toString()
        .padStart(2, "0"),
      icon: <IconLayersIntersect className="size-6" />,
    },
    {
      title: "Tolerancia Promedio",
      value:
        politicas.length > 0
          ? Math.round(
              politicas.reduce((acc, p) => acc + p.tolerancia, 0) /
                politicas.length,
            )
          : 0,
      icon: <IconHourglass className="size-6" />,
    },
  ];

  return (
    <>
      {DataPoliticas.map((item, index) => (
        <Card
          className="flex items-center gap-4 px-6 py-4 bg-card/50 border-muted shadow-2xl"
          key={index}
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            {item.icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {item.title}
            </p>
            <p className="text-2xl font-black">{item.value}</p>
          </div>
        </Card>
      ))}
    </>
  );
}
