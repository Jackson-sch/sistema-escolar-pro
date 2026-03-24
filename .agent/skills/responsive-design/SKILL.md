# Responsive Design Skill

This skill provides guidelines and common patterns to ensure the school system portal is fully responsive across all devices (mobile, tablet, desktop).

## Core Principles

1.  **Mobile First**: Design for small screens first, then add complexity for larger screens using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
2.  **Fluid Layouts**: Use percentages, `flex-1`, or `grid-cols` instead of fixed pixel widths.
3.  **Touch Friendly**: Ensure interactive elements have a minimum size of 44x44px for touch targets on mobile.
4.  **Content Priority**: Hide less critical information on mobile using `hidden md:block`.
5.  **Reflow**: Use `flex-col md:flex-row` to stack elements on mobile and align them horizontally on desktop.

## Responsive Checklist

| Feature        | Mobile Strategy               | Desktop Strategy                  |
| :------------- | :---------------------------- | :-------------------------------- |
| **Navigation** | Hamburger menu / Bottom bar   | Sidebar or horizontal headers     |
| **Tables**     | Horizontal scroll / Card view | Full grid with all columns        |
| **Forms**      | Single column stack           | Multi-column grid (`grid-cols-2`) |
| **Modals**     | Full screen drawers           | Centered overlays                 |
| **Typography** | `text-sm` or `text-base`      | `text-base` or `text-lg`          |

## Implementation Workflow

1.  **Audit**: Test the component at different viewport sizes (375px, 768px, 1024px, 1440px).
2.  **Identify Bottlenecks**: Look for horizontal overflow, text overlapping, or buttons that are too small.
3.  **Apply Breakpoints**:
    - Replace `w-[500px]` with `w-full max-w-[500px]`.
    - Replace `flex` with `flex-col sm:flex-row`.
    - Use `hidden md:table-cell` for non-essential columns.
4.  **Verify**: Re-test using Chrome DevTools device emulator.

## Example: Responsive Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id} className="w-full">
      {/* Content */}
    </Card>
  ))}
</div>
```
