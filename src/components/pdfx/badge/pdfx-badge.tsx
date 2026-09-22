import { Text as PDFText, StyleSheet, View } from "@/lib/pdf";
import type { Style } from '@react-pdf/types';
import { usePdfxTheme, useSafeMemo } from "@/lib/pdfx-theme-context";
type PdfxTheme = ReturnType<typeof usePdfxTheme>;

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Inline label for status, tags, or categories.
 *
 * Accepts text via either `label` prop or `children` (string). `label` takes
 * precedence when both are provided. The children pattern (`<Badge>text</Badge>`)
 * is supported for compatibility with common React idioms, but note that
 * `@react-pdf/renderer` doesn't support JSX children the way HTML does — only
 * string children are accepted.
 *
 * Props - `label` | `children` | `variant` | `size` | `background` | `color` | `style`
 * @see {@link BadgeProps}
 */
export interface BadgeProps {
  /** Custom styles to merge with component defaults */
  style?: Style;
  /** Text to display. Takes precedence over children when both are provided. */
  label?: string;
  /** String children as an alternative to the label prop. */
  children?: string;
  /**
   * @default 'default'
   */
  variant?: BadgeVariant;
  /**
   * @default 'md'
   */
  size?: BadgeSize;
  background?: string;
  color?: string;
}

const THEME_COLOR_KEYS = ['foreground','muted','mutedForeground','primary','primaryForeground','accent','destructive','success','warning','info'] as const;
function resolveColor(value: string, colors: Record<string, string>): string {
  return THEME_COLOR_KEYS.includes(value as (typeof THEME_COLOR_KEYS)[number]) ? colors[value] : value;
}
function createBadgeStyles(t: PdfxTheme) {
  const { spacing, borderRadius, fontWeights } = t.primitives;
  const c = t.colors;
  const textBase = {
    fontFamily: t.typography.body.fontFamily,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.3,
  };
  const variantBox = (borderColor: string, bgColor: string = c.muted) => ({
    backgroundColor: bgColor,
    borderWidth: spacing[0.5],
    borderColor,
    borderStyle: 'solid' as const,
  });
  const sheet = StyleSheet.create({
    containerBase: {
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start' as const,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    variantDefault: variantBox(c.border),
    variantPrimary: variantBox(c.primary, c.primary),
    variantSuccess: variantBox(c.success),
    variantWarning: variantBox(c.warning),
    variantDestructive: variantBox(c.destructive),
    variantInfo: variantBox(c.info),
    variantOutline: variantBox(c.border, c.background),
    sizeSm: { paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] },
    sizeMd: { paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
    sizeLg: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
    textDefault: { ...textBase, color: c.mutedForeground },
    textPrimary: { ...textBase, color: c.primaryForeground },
    textSuccess: { ...textBase, color: c.success },
    textWarning: { ...textBase, color: c.warning },
    textDestructive: { ...textBase, color: c.destructive },
    textInfo: { ...textBase, color: c.info },
    textOutline: { ...textBase, color: c.foreground },
    textSm: { fontSize: t.primitives.typography.xs - 1 },
    textMd: { fontSize: t.primitives.typography.xs },
    textLg: { fontSize: t.primitives.typography.sm },
  });
  return {
    ...sheet,
    containerVariantMap: {
      default: sheet.variantDefault,
      primary: sheet.variantPrimary,
      success: sheet.variantSuccess,
      warning: sheet.variantWarning,
      destructive: sheet.variantDestructive,
      info: sheet.variantInfo,
      outline: sheet.variantOutline,
    } as Record<BadgeVariant, Style>,
    textVariantMap: {
      default: sheet.textDefault,
      primary: sheet.textPrimary,
      success: sheet.textSuccess,
      warning: sheet.textWarning,
      destructive: sheet.textDestructive,
      info: sheet.textInfo,
      outline: sheet.textOutline,
    } as Record<BadgeVariant, Style>,
    containerSizeMap: { sm: sheet.sizeSm, md: sheet.sizeMd, lg: sheet.sizeLg } as Record<
      BadgeSize,
      Style
    >,
    textSizeMap: { sm: sheet.textSm, md: sheet.textMd, lg: sheet.textLg } as Record<
      BadgeSize,
      Style
    >,
  };
}

const TEXT_STYLE_KEYS = new Set([
  'color',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'letterSpacing',
  'textTransform',
  'lineHeight',
  'textAlign',
]);

function splitCustomBadgeStyle(style: Style | Style[] | undefined): {
  textStyle: Style;
  containerStyle: Style;
} {
  const textStyle: Record<string, any> = {};
  const containerStyle: Record<string, any> = {};
  if (!style) return { textStyle, containerStyle };

  const flatStyles = [style].flat().filter(Boolean);
  for (const s of flatStyles) {
    if (typeof s === 'object' && s !== null) {
      for (const [k, v] of Object.entries(s)) {
        if (TEXT_STYLE_KEYS.has(k)) {
          textStyle[k] = v;
        } else {
          containerStyle[k] = v;
        }
      }
    }
  }
  return { textStyle, containerStyle };
}

export function Badge({
  label,
  children,
  variant = 'default',
  size = 'md',
  background,
  color,
  style,
}: BadgeProps) {
  const theme = usePdfxTheme();
  const styles = useSafeMemo(() => createBadgeStyles(theme), [theme]);
  const text = label ?? children ?? '';
  const { textStyle: textStyleFromCustom, containerStyle: containerStyleFromCustom } =
    splitCustomBadgeStyle(style);

  const containerStyles: Style[] = [
    styles.containerBase,
    styles.containerVariantMap[variant],
    styles.containerSizeMap[size],
    ...(background ? [{ backgroundColor: resolveColor(background, theme.colors) }] : []),
    containerStyleFromCustom,
  ];
  const textStyles: Style[] = [
    styles.textVariantMap[variant],
    styles.textSizeMap[size],
    ...(color ? [{ color: resolveColor(color, theme.colors) }] : []),
    textStyleFromCustom,
  ];
  return (
    <View style={containerStyles}>
      <PDFText style={textStyles}>{text}</PDFText>
    </View>
  );
}
