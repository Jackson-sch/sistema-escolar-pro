"use client";

import {
  IconId,
  IconCalendarFilled,
  IconBuildingCommunity,
} from "@tabler/icons-react";
import { calculateAge } from "@/lib/utils";

interface StudentProfilePreviewProps {
  student: any;
}

export function StudentProfilePreview({
  student,
}: StudentProfilePreviewProps) {
  if (!student) return null;

  return (
    <div className="mt-2 p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group/profile">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/profile:opacity-20 transition-opacity">
        <IconId className="h-16 w-16" />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
          {student.name[0]}
          {student.apellidoPaterno[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-foreground truncate capitalize">
            {student.name} {student.apellidoPaterno} {student.apellidoMaterno}
          </h4>
          <div className="flex flex-wrap gap-y-2 gap-x-4 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="p-1 rounded-md bg-white/5">
                <IconId className="h-3 w-3 text-violet-400" />
              </div>
              <span className="font-medium tracking-wide">
                DNI: {student.dni}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="p-1 rounded-md bg-white/5">
                <IconCalendarFilled className="h-3 w-3 text-pink-400" />
              </div>
              <span className="font-medium tracking-wide">
                {calculateAge(student.fechaNacimiento)} años
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="p-1 rounded-md bg-white/5">
                <IconBuildingCommunity className="h-3 w-3 text-blue-400" />
              </div>
              <span className="font-medium tracking-wide">
                {student.direccion || "Sin dirección"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
