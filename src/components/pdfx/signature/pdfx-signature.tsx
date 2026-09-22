import { Text as PDFText, StyleSheet, View } from "@/lib/pdf";
import type { Style } from '@react-pdf/types';
import { usePdfxTheme, useSafeMemo } from '@/lib/pdfx-theme-context';
type PdfxTheme = ReturnType<typeof usePdfxTheme>;

export type SignatureVariant = 'single' | 'double' | 'inline';

/**
 * Signature signer properties.
 * Props - `label` | `name` | `title` | `date`
 * @see {@link SignatureSigner}
 */
export interface SignatureSigner {
  label?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  date?: string;
}

/**
 * Signature block properties.
 * Props - `variant` | `label` | `name` | `title` | `date` | `signers` | `style`
 * @see {@link PdfSignatureBlockProps}
 */
export interface PdfSignatureBlockProps {
  /**
   * Layout variant: [single, double, inline]
   * @default 'single'
   */
  variant?: SignatureVariant;
  layout?: SignatureVariant;
  label?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  date?: string;
  signers?: SignatureSigner[];
  style?: Style;
}

function createSignatureStyles(t: PdfxTheme) {
  const { spacing, fontWeights, typography } = t.primitives;
  return StyleSheet.create({
    container: { marginTop: t.spacing.sectionGap, marginBottom: t.spacing.componentGap },
    block: { width: 190, alignItems: 'center' },
    label: {
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.xs,
      color: t.colors.mutedForeground,
      marginBottom: spacing[1],
      textAlign: 'center',
    },
    line: {
      borderBottomWidth: 1,
      borderBottomColor: '#0f172a',
      borderBottomStyle: 'solid',
      minHeight: spacing[6],
      width: '100%',
      marginBottom: spacing[1],
    },
    titleText: {
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.xs,
      color: '#0f172a',
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginTop: 2,
    },
    name: {
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.xs,
      color: '#334155',
      fontWeight: fontWeights.medium,
      textAlign: 'center',
      marginTop: 1,
    },
    subtitleText: {
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.xs - 1.5,
      color: '#64748b',
      textAlign: 'center',
      marginTop: 1,
    },
    dateText: {
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.xs - 1.5,
      color: '#94a3b8',
      marginTop: 1,
      textAlign: 'center',
    },
    doubleRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    inlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flexWrap: 'wrap' },
    inlineLabel: {
      fontFamily: t.typography.body.fontFamily,
      fontSize: typography.sm,
      color: t.colors.mutedForeground,
    },
    inlineLine: {
      borderBottomWidth: 1,
      borderBottomColor: '#0f172a',
      borderBottomStyle: 'solid',
      minWidth: 120,
      height: spacing[5],
      paddingHorizontal: spacing[2],
    },
    inlineName: {
      fontFamily: t.typography.body.fontFamily,
      fontSize: t.typography.body.fontSize,
      color: t.colors.foreground,
    },
  });
}

function renderSignerBlock(
  signer: SignatureSigner,
  styles: ReturnType<typeof createSignatureStyles>
) {
  return (
    <View style={styles.block}>
      {signer.label ? <PDFText style={styles.label}>{signer.label}</PDFText> : null}
      <View style={styles.line} />
      {signer.title ? <PDFText style={styles.titleText}>{signer.title}</PDFText> : null}
      {signer.name ? <PDFText style={styles.name}>{signer.name}</PDFText> : null}
      {signer.subtitle ? <PDFText style={styles.subtitleText}>{signer.subtitle}</PDFText> : null}
      {signer.date ? <PDFText style={styles.dateText}>{signer.date}</PDFText> : null}
    </View>
  );
}

export function PdfSignatureBlock({
  variant,
  layout,
  label,
  name,
  title,
  subtitle,
  date,
  signers,
  style,
}: PdfSignatureBlockProps) {
  const theme = usePdfxTheme();
  const styles = useSafeMemo(() => createSignatureStyles(theme), [theme]);
  const containerStyles: Style[] = [styles.container];
  if (style) containerStyles.push(style);

  const effectiveVariant = variant ?? layout ?? (signers && signers.length > 1 ? 'double' : 'single');

  if (effectiveVariant === 'inline') {
    return (
      <View wrap={false} style={containerStyles}>
        <View style={styles.inlineRow}>
          <PDFText style={styles.inlineLabel}>{`${label || title || ''}:`}</PDFText>
          <View style={styles.inlineLine} />
          {name ? <PDFText style={styles.inlineName}>{name}</PDFText> : null}
        </View>
      </View>
    );
  }

  if (effectiveVariant === 'double' && signers && signers.length >= 2) {
    return (
      <View wrap={false} style={containerStyles}>
        <View style={styles.doubleRow}>
          {renderSignerBlock(signers[0], styles)}
          {renderSignerBlock(signers[1], styles)}
        </View>
      </View>
    );
  }

  const singleSigner = (signers && signers[0]) ? signers[0] : { label, name, title, subtitle, date };

  return (
    <View wrap={false} style={[...containerStyles, { alignItems: 'center', width: '100%' }]}>
      {renderSignerBlock(singleSigner, styles)}
    </View>
  );
}

export { PdfSignatureBlock as Signature };
