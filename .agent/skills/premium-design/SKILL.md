# Premium Design Skill

This skill provides guidelines and utilities to implement the "Premium Solid" aesthetic of the EduPeru Pro project. It focuses on replacing default Shadcn/Tailwind colors with the project's custom `oklch` palette and ensuring consistent high-end visual styles using **solid card backgrounds** with subtle borders.

## Core Design Principles

1.  **Use Variables**: Never use hardcoded Tailwind colors (e.g., `bg-blue-500`). Use CSS variables (`bg-primary`, `text-muted-foreground`, etc.).
2.  **Opacity Layers**: Use opacity variants of variables for depth (e.g., `bg-primary/10`, `border-border/50`).
3.  **Solid Cards**: Use `bg-card/80` with `border border-border/50` for card surfaces. **Do NOT use** `liquid-glass`, `glassmorphism`, `backdrop-blur`, or semi-transparent backgrounds like `bg-card/40`.
4.  **Soft Borders**: Use `border border-border/50` with medium opacity for clean separation.
5.  **Motion & Interactions**: Use Tailwind animate classes (`animate-in`, `fade-in`, `slide-in-from-bottom-4`, etc.) for all entry points and interactions.
6.  **Typography**: Use `font-black` for emphasis on small labels, `font-bold` for values, and `font-mono` for numeric data.
7.  **Hover States**: Use `hover:bg-card hover:shadow-md hover:-translate-y-0.5` for interactive cards instead of `hover:scale-[1.02]`.

## ⛔ Deprecated Patterns (DO NOT USE)

| Pattern | Reason |
|---------|--------|
| `liquid-glass` | Removed from project — causes visual inconsistency |
| `backdrop-blur-xl` / `backdrop-blur-md` | No longer part of the card design system |
| `bg-card/40` or `bg-card/30` | Too transparent — use `bg-card/80` instead |
| `shadow-2xl` | Too heavy — use `shadow-sm` for cards |
| `rounded-[2rem]` / `rounded-[3rem]` | Use standard `rounded-2xl` instead |
| `rounded-[1.25rem]` | Use standard `rounded-xl` or `rounded-2xl` |

## Color Mapping Reference

| Element             | Recommended Usage                          | Rationale                         |
| ------------------- | ------------------------------------------ | --------------------------------- |
| **Card Surfaces**   | `bg-card/80 border border-border/50`       | Main containers and cards         |
| **Sub-items**       | `bg-muted/50 border border-border/30`      | Rows, list items, nested elements |
| **Backgrounds**     | `bg-background`                            | Page-level background             |
| **Borders**         | `border-border/50`                         | Clean, visible separation         |
| **Primary Actions** | `bg-primary` / `text-primary-foreground`   | Call to action                    |
| **Secondary/Muted** | `bg-muted/20` / `text-muted-foreground/60` | Background elements, descriptions |
| **Status: Info**    | `text-sky-500` / `bg-sky-500/10`           | Institutional, info, calm         |
| **Status: Success** | `text-emerald-500` / `bg-emerald-500/10`   | Completed, verified               |
| **Status: Warning** | `text-amber-500` / `bg-amber-500/10`       | Pending, attention                |
| **Status: Danger**  | `text-rose-500` / `bg-rose-500/10`         | Holidays, errors, destructive     |

## Implementation Workflow

1.  **Audit**: Identify `liquid-glass`, `bg-card/40`, `backdrop-blur`, `shadow-2xl`, or `rounded-[2rem]` patterns.
2.  **Replace**: Change to `bg-card/80 border border-border/50 rounded-2xl shadow-sm`.
3.  **Sub-items**: Use `bg-muted/50 border border-border/30` for nested elements (rows, legends, stats).
4.  **Animate**: Ensure the component has entry animations (`animate-in fade-in`).

## Example: Premium Card

```tsx
<Card className="bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden transition-all hover:bg-card hover:shadow-md hover:-translate-y-0.5">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
      Premium Title
    </CardTitle>
    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
      <Icon className="h-4 w-4 text-primary" />
    </div>
  </CardHeader>
  <CardContent>
    <h3 className="text-2xl font-black tracking-tighter text-foreground">
      S/ 12,500.00
    </h3>
    <p className="text-xs text-muted-foreground mt-1">
      Premium description
    </p>
  </CardContent>
</Card>
```

## Example: Sub-item Row

```tsx
<div className="p-3.5 rounded-2xl bg-muted/50 border border-border/30 hover:bg-muted/80 transition-all duration-300 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
      <Icon className="size-5" />
    </div>
    <div>
      <p className="text-sm font-bold text-foreground/90">Item Name</p>
      <p className="text-[11px] text-muted-foreground/60">Sub detail</p>
    </div>
  </div>
  <Badge variant="outline" className="font-mono text-xs">Value</Badge>
</div>
```
