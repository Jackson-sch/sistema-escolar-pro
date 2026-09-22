import { IconChevronRight } from "@tabler/icons-react";

const WIZARD_STEPS = [
  { n: 1, label: "Datos del Aula" },
  { n: 2, label: "Malla y Cursos" },
  { n: 3, label: "Docentes & Final" },
] as const;

export function WizardStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
      {WIZARD_STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          {i > 0 && (
            <IconChevronRight
              size={16}
              className="text-muted-foreground/40 mr-2"
            />
          )}
          <div
            className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step >= s.n
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s.n}
          </div>
          <span
            className={`text-xs font-bold ${
              step === s.n ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
