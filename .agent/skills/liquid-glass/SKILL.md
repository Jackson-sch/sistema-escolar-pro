---
name: Liquid Glass Effect
description: Guía técnica para integrar el efecto visual "Liquid Glass" optimizado para Tailwind CSS v4 y el sistema de diseño Premium del proyecto.
---

# Liquid Glass Effect Skill

Este skill permite implementar tarjetas y superficies con un efecto de "vidrio líquido" altamente estético, utilizando las capacidades nativas de Tailwind CSS v4.

## Core Principles

1.  **V4 Native**: Utiliza `@utility` y `@theme` inline para una integración limpia.
2.  **Glassmorphism**: Combina `backdrop-filter`, gradientes lineales suaves y bordes de alta definición.
3.  **Dynamic Motion**: Incluye animaciones de "blobs" ambientales para profundidad.

## Setup Requirements

Asegúrate de que `src/app/globals.css` contenga las siguientes definiciones dentro del bloque `@theme`:

```css
@theme inline {
  /* ... existing variables ... */
  --color-liquid-gradient-start: oklch(0.97 0.014 254.604 / 40%);
  --color-liquid-gradient-end: oklch(0.97 0.014 254.604 / 10%);

  --animate-blob: blob 7s infinite;
  --animate-liquid-spin: spin 4s linear infinite;

  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
}
```

Y la utilidad en `@layer utilities`:

```css
@layer utilities {
  @utility liquid-glass {
    position: relative;
    background: linear-gradient(
      135deg,
      var(--color-liquid-gradient-start) 0%,
      var(--color-liquid-gradient-end) 100%
    );
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid oklch(1 0 0 / 40%);
    box-shadow: 0 8px 32px 0 oklch(0 0 0 / 15%);
    overflow: hidden;
    transition: all 0.5s ease;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: linear-gradient(
        180deg,
        oklch(1 0 0 / 30%) 0%,
        oklch(1 0 0 / 0%) 100%
      );
      pointer-events: none;
    }

    &::after {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        to bottom right,
        transparent 40%,
        oklch(1 0 0 / 40%) 50%,
        transparent 60%
      );
      transform: rotate(30deg) translateY(-100%);
      transition: transform 0.6s ease;
      pointer-events: none;
    }

    &:hover::after {
      transform: rotate(30deg) translateY(100%);
    }
  }

  .dark .liquid-glass {
    background: linear-gradient(
      135deg,
      oklch(0.141 0.005 285.823 / 60%) 0%,
      oklch(0.141 0.005 285.823 / 20%) 100%
    );
    border: 1px solid oklch(1 0 0 / 10%);
    box-shadow: 0 8px 32px 0 oklch(0 0 0 / 50%);

    &::before {
      background: linear-gradient(
        180deg,
        oklch(1 0 0 / 8%) 0%,
        oklch(1 0 0 / 0%) 100%
      );
    }
  }
}
```

## Implementation Example

```tsx
<div className="liquid-glass rounded-3xl p-8">
  <h2 className="text-2xl font-bold">Premium Content</h2>
  <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-blob"></div>
</div>
```
