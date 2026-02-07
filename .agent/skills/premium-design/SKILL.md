# Premium Design Skill

This skill provides guidelines and utilities to implement the "Premium Dark" aesthetic of the EduPeru Pro project. It focuses on replacing default Shadcn/Tailwind colors with the project's custom `oklch` palette and ensuring consistent high-end visual styles.

## Core Design Principles

1.  **Use Variables**: Never use hardcoded Tailwind colors (e.g., `bg-blue-500`). Use CSS variables (`bg-primary`, `text-muted-foreground`, etc.).
2.  **Opacity Layers**: Use opacity variants of variables for depth (e.g., `bg-primary/10`, `border-border/40`).
3.  **Glassmorphism**: Apply `backdrop-blur-xl` and semi-transparent backgrounds (`bg-card/40`) for advanced UI elements.
4.  **Soft Borders**: Use `border border-border/40` or `border-2` with low opacity for a premium feel.
5.  **Motion & Interactions**: Use `framer-motion` or Tailwind animate classes (`animate-in`, `fade-in`, etc.) for all entry points and interactions.
6.  **Typography**: Use `font-display` for headings (if available) and `font-black` for emphasis on small text.

## Color Mapping Reference

| Element             | Recommended Usage                          | Rationale                         |
| ------------------- | ------------------------------------------ | --------------------------------- |
| **Backgrounds**     | `bg-background` or `bg-card/40`            | Main surfaces and containers      |
| **Borders**         | `border-border/40`                         | Subtle, non-intrusive separation  |
| **Primary Actions** | `bg-primary` / `text-primary-foreground`   | Call to action                    |
| **Secondary/Muted** | `bg-muted/20` / `text-muted-foreground/60` | Background elements, descriptions |
| **Status: Info**    | `text-sky-500` / `bg-sky-500/10`           | Institutional, info, calm         |
| **Status: Success** | `text-emerald-500` / `bg-emerald-500/10`   | Completed, verified               |
| **Status: Warning** | `text-amber-500` / `bg-amber-500/10`       | Pending, attention                |
| **Status: Danger**  | `text-rose-500` / `bg-rose-500/10`         | Holidays, errors, destructive     |

## Implementation Workflow

1.  **Audit**: Identify hardcoded colors like `bg-rose-500` or `text-violet-500`.
2.  **Replace**: Change to appropriate semantic variables or themed variants (e.g., `bg-rose-500` -> `bg-destructive` if it's destructive, or `bg-rose-500/10` for subtle indicators).
3.  **Enhance**: Add `backdrop-blur` and `shadow-2xl` to cards.
4.  **Animate**: Ensure the component has entry animations.

## Example: Premium Card

```tsx
<Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95">
  <CardHeader className="bg-muted/10 border-b border-border/40">
    <h3 className="text-xl font-bold text-foreground">Premium Title</h3>
  </CardHeader>
  <CardContent className="p-6">
    <p className="text-sm text-muted-foreground/80">
      Premium content description.
    </p>
  </CardContent>
</Card>
```
