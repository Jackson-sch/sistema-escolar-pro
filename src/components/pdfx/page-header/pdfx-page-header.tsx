import { Text as PDFText, StyleSheet, View } from "@/lib/pdf";
import type { Style } from '@react-pdf/types';
import type { ReactNode } from 'react';
import { usePdfxTheme, useSafeMemo } from "@/lib/pdfx-theme-context";
type PdfxTheme = ReturnType<typeof usePdfxTheme>;

export type PageHeaderVariant =
  | 'simple'
  | 'centered'
  | 'minimal'
  | 'branded'
  | 'logo-left'
  | 'logo-right'
  | 'two-column';

/**
 * Header row with layout variants, logo support, and optional fixed positioning.
 * Props - `title` | `subtitle` | `rightText` | `rightSubText` | `variant` | `background` | `titleColor` | `marginBottom` | `address` | `phone` | `email` | `logo` | `fixed` | `noWrap` | `style`
 * @see {@link PageHeaderProps}
 */
export interface PageHeaderProps {
  /** Custom styles to merge with component defaults */
  style?: Style;
  title: string;
  subtitle?: string;
  rightText?: string;
  rightSubText?: string;
  /**
   * @default 'simple'
   */
  variant?: PageHeaderVariant;
  background?: string;
  titleColor?: string;
  marginBottom?: number;
  address?: string;
  phone?: string;
  email?: string;
  logo?: ReactNode;
  /**
   * @default false
   */
  fixed?: boolean;
  /**
   * @default true
   */
  noWrap?: boolean;
}

const THEME_COLOR_KEYS = ['foreground','muted','mutedForeground','primary','primaryForeground','accent','destructive','success','warning','info'] as const;
function resolveColor(value: string, colors: Record<string, string>): string {
  return THEME_COLOR_KEYS.includes(value as (typeof THEME_COLOR_KEYS)[number]) ? colors[value] : value;
}
function createPageHeaderStyles(t: PdfxTheme) {
  const { spacing, borderRadius, fontWeights } = t.primitives;
  const c = t.colors;
  const { heading, body } = t.typography;

  return StyleSheet.create({
    simpleContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingBottom: spacing[4],
      borderBottomWidth: spacing[0.5],
      borderBottomColor: c.border,
      borderBottomStyle: 'solid',
    },
    simpleLeft: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    simpleRight: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },

    centeredContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: spacing[4],
      borderBottomWidth: spacing[0.5],
      borderBottomColor: c.border,
      borderBottomStyle: 'solid',
    },

    minimalContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: spacing[1],
      borderBottomColor: c.primary,
      borderBottomStyle: 'solid',
      paddingBottom: spacing[3],
    },
    minimalLeft: {
      flex: 1,
    },
    minimalRight: {
      alignItems: 'flex-end',
    },

    brandedContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: c.primary,
      padding: spacing[6],
      borderRadius: borderRadius.sm,
    },

    title: {
      fontFamily: heading.fontFamily,
      fontSize: heading.fontSize.h3,
      fontWeight: fontWeights.bold,
      color: c.foreground,
      lineHeight: heading.lineHeight,
      marginBottom: 0,
    },
    titleCentered: {
      textAlign: 'center',
    },
    titleBranded: {
      color: c.primaryForeground,
    },
    titleMinimal: {
      fontSize: heading.fontSize.h3,
      fontWeight: fontWeights.bold,
    },

    subtitle: {
      fontFamily: body.fontFamily,
      fontSize: body.fontSize,
      color: c.mutedForeground,
      marginTop: spacing[1],
      lineHeight: body.lineHeight,
    },
    subtitleCentered: {
      textAlign: 'center',
    },
    subtitleBranded: {
      color: c.primaryForeground,
      marginTop: spacing[1],
    },

    rightText: {
      fontFamily: body.fontFamily,
      fontSize: body.fontSize,
      color: c.foreground,
      fontWeight: fontWeights.medium,
      textAlign: 'right',
    },
    rightSubText: {
      fontFamily: body.fontFamily,
      fontSize: t.primitives.typography.xs,
      color: c.mutedForeground,
      textAlign: 'right',
      marginTop: spacing[1],
    },

    logoLeftContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing[4],
      borderBottomWidth: spacing[0.5],
      borderBottomColor: c.border,
      borderBottomStyle: 'solid',
    },
    logoContainer: {
      marginRight: spacing[4],
      width: 48,
      height: 48,
      flexShrink: 0,
    },
    logoContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },

    logoRightContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing[4],
      borderBottomWidth: spacing[0.5],
      borderBottomColor: c.border,
      borderBottomStyle: 'solid',
    },
    logoRightContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    logoRightLogoContainer: {
      marginLeft: spacing[4],
      width: 48,
      height: 48,
    },

    twoColumnContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingBottom: spacing[4],
      borderBottomWidth: spacing[0.5],
      borderBottomColor: c.border,
      borderBottomStyle: 'solid',
    },
    twoColumnLeft: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    twoColumnRight: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    contactInfo: {
      fontFamily: body.fontFamily,
      fontSize: t.primitives.typography.xs,
      color: c.mutedForeground,
      textAlign: 'right',
      marginTop: spacing[0.5],
    },
  });
}

function buildHeaderContainerStyles(
  baseStyle: Style,
  mb: number,
  background?: string,
  style?: Style,
  colors?: any
): Style[] {
  const containerStyles: Style[] = [baseStyle, { marginBottom: mb }];
  if (background && colors) {
    containerStyles.push({ backgroundColor: resolveColor(background, colors) });
  }
  if (style) containerStyles.push(style);
  return containerStyles;
}

function buildHeaderTitleStyles(
  baseStyles: Style[],
  titleColor?: string,
  colors?: any
): Style[] {
  const titleStyles: Style[] = [...baseStyles];
  if (titleColor && colors) {
    titleStyles.push({ color: resolveColor(titleColor, colors) });
  }
  return titleStyles;
}

function HeaderBrandedVariant({
  styles,
  containerStyles,
  titleStyles,
  title,
  subtitle,
  noWrap,
  fixed,
}: {
  styles: Record<string, Style>;
  containerStyles: Style[];
  titleStyles: Style[];
  title: string;
  subtitle?: string;
  noWrap: boolean;
  fixed: boolean;
}) {
  return (
    <View wrap={!noWrap} fixed={fixed} style={containerStyles}>
      <PDFText style={titleStyles}>{title}</PDFText>
      {subtitle && (
        <PDFText style={[styles.subtitle, styles.subtitleBranded]}>{subtitle}</PDFText>
      )}
    </View>
  );
}

function HeaderCenteredVariant({
  styles,
  containerStyles,
  titleStyles,
  title,
  subtitle,
  noWrap,
  fixed,
}: {
  styles: Record<string, Style>;
  containerStyles: Style[];
  titleStyles: Style[];
  title: string;
  subtitle?: string;
  noWrap: boolean;
  fixed: boolean;
}) {
  return (
    <View wrap={!noWrap} fixed={fixed} style={containerStyles}>
      <PDFText style={titleStyles}>{title}</PDFText>
      {subtitle && (
        <PDFText style={[styles.subtitle, styles.subtitleCentered]}>{subtitle}</PDFText>
      )}
    </View>
  );
}

function HeaderLogoRightVariant({
  styles,
  containerStyles,
  titleStyles,
  title,
  subtitle,
  logo,
  noWrap,
  fixed,
}: {
  styles: Record<string, Style>;
  containerStyles: Style[];
  titleStyles: Style[];
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
  noWrap: boolean;
  fixed: boolean;
}) {
  return (
    <View wrap={!noWrap} fixed={fixed} style={containerStyles}>
      <View style={styles.logoRightContent}>
        <PDFText style={titleStyles}>{title}</PDFText>
        {subtitle && <PDFText style={styles.subtitle}>{subtitle}</PDFText>}
      </View>
      {logo && <View style={styles.logoRightLogoContainer}>{logo}</View>}
    </View>
  );
}

function HeaderLogoLeftVariant({
  styles,
  containerStyles,
  titleStyles,
  title,
  subtitle,
  logo,
  rightText,
  rightSubText,
  noWrap,
  fixed,
}: {
  styles: Record<string, Style>;
  containerStyles: Style[];
  titleStyles: Style[];
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
  rightText?: string;
  rightSubText?: string;
  noWrap: boolean;
  fixed: boolean;
}) {
  return (
    <View wrap={!noWrap} fixed={fixed} style={containerStyles}>
      {logo && <View style={styles.logoContainer}>{logo}</View>}
      <View style={styles.logoContent}>
        <PDFText style={titleStyles}>{title}</PDFText>
        {subtitle && <PDFText style={styles.subtitle}>{subtitle}</PDFText>}
      </View>
      {(rightText || rightSubText) && (
        <View style={styles.simpleRight}>
          {rightText && <PDFText style={styles.rightText}>{rightText}</PDFText>}
          {rightSubText && <PDFText style={styles.rightSubText}>{rightSubText}</PDFText>}
        </View>
      )}
    </View>
  );
}

function HeaderTwoColumnVariant({
  styles,
  containerStyles,
  titleStyles,
  title,
  subtitle,
  address,
  phone,
  email,
  noWrap,
  fixed,
}: {
  styles: Record<string, Style>;
  containerStyles: Style[];
  titleStyles: Style[];
  title: string;
  subtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  noWrap: boolean;
  fixed: boolean;
}) {
  return (
    <View wrap={!noWrap} fixed={fixed} style={containerStyles}>
      <View style={styles.twoColumnLeft}>
        <PDFText style={titleStyles}>{title}</PDFText>
        {subtitle && <PDFText style={styles.subtitle}>{subtitle}</PDFText>}
      </View>
      {(address || phone || email) && (
        <View style={styles.twoColumnRight}>
          {address && <PDFText style={styles.contactInfo}>{address}</PDFText>}
          {phone && <PDFText style={styles.contactInfo}>{phone}</PDFText>}
          {email && <PDFText style={styles.contactInfo}>{email}</PDFText>}
        </View>
      )}
    </View>
  );
}

function HeaderMinimalVariant({
  styles,
  containerStyles,
  titleStyles,
  title,
  subtitle,
  rightText,
  rightSubText,
  noWrap,
  fixed,
}: {
  styles: Record<string, Style>;
  containerStyles: Style[];
  titleStyles: Style[];
  title: string;
  subtitle?: string;
  rightText?: string;
  rightSubText?: string;
  noWrap: boolean;
  fixed: boolean;
}) {
  return (
    <View wrap={!noWrap} fixed={fixed} style={containerStyles}>
      <View style={styles.minimalLeft}>
        <PDFText style={titleStyles}>{title}</PDFText>
        {subtitle && <PDFText style={styles.subtitle}>{subtitle}</PDFText>}
      </View>
      {(rightText || rightSubText) && (
        <View style={styles.minimalRight}>
          {rightText && <PDFText style={styles.rightText}>{rightText}</PDFText>}
          {rightSubText && <PDFText style={styles.rightSubText}>{rightSubText}</PDFText>}
        </View>
      )}
    </View>
  );
}

function HeaderSimpleVariant({
  styles,
  containerStyles,
  titleStyles,
  title,
  subtitle,
  rightText,
  rightSubText,
  noWrap,
  fixed,
}: {
  styles: Record<string, Style>;
  containerStyles: Style[];
  titleStyles: Style[];
  title: string;
  subtitle?: string;
  rightText?: string;
  rightSubText?: string;
  noWrap: boolean;
  fixed: boolean;
}) {
  return (
    <View wrap={!noWrap} fixed={fixed} style={containerStyles}>
      <View style={styles.simpleLeft}>
        <PDFText style={titleStyles}>{title}</PDFText>
        {subtitle && <PDFText style={styles.subtitle}>{subtitle}</PDFText>}
      </View>
      {(rightText || rightSubText) && (
        <View style={styles.simpleRight}>
          {rightText && <PDFText style={styles.rightText}>{rightText}</PDFText>}
          {rightSubText && <PDFText style={styles.rightSubText}>{rightSubText}</PDFText>}
        </View>
      )}
    </View>
  );
}

export function PageHeader({
  title,
  subtitle,
  rightText,
  rightSubText,
  variant = 'simple',
  background,
  titleColor,
  marginBottom,
  logo,
  address,
  phone,
  email,
  fixed = false,
  noWrap = true,
  style,
}: PageHeaderProps) {
  const theme = usePdfxTheme();
  const styles = useSafeMemo(() => createPageHeaderStyles(theme), [theme]);
  const mb = marginBottom ?? theme.spacing.sectionGap;

  if (variant === 'branded') {
    const containerStyles = buildHeaderContainerStyles(styles.brandedContainer, mb, background, style, theme.colors);
    const titleStyles = buildHeaderTitleStyles([styles.title, styles.titleBranded, styles.titleCentered], titleColor, theme.colors);
    return (
      <HeaderBrandedVariant
        styles={styles}
        containerStyles={containerStyles}
        titleStyles={titleStyles}
        title={title}
        subtitle={subtitle}
        noWrap={noWrap}
        fixed={fixed}
      />
    );
  }

  if (variant === 'centered') {
    const containerStyles = buildHeaderContainerStyles(styles.centeredContainer, mb, background, style, theme.colors);
    const titleStyles = buildHeaderTitleStyles([styles.title, styles.titleCentered], titleColor, theme.colors);
    return (
      <HeaderCenteredVariant
        styles={styles}
        containerStyles={containerStyles}
        titleStyles={titleStyles}
        title={title}
        subtitle={subtitle}
        noWrap={noWrap}
        fixed={fixed}
      />
    );
  }

  if (variant === 'logo-right') {
    const containerStyles = buildHeaderContainerStyles(styles.logoRightContainer, mb, background, style, theme.colors);
    const titleStyles = buildHeaderTitleStyles([styles.title], titleColor, theme.colors);
    return (
      <HeaderLogoRightVariant
        styles={styles}
        containerStyles={containerStyles}
        titleStyles={titleStyles}
        title={title}
        subtitle={subtitle}
        logo={logo}
        noWrap={noWrap}
        fixed={fixed}
      />
    );
  }

  if (variant === 'logo-left') {
    const containerStyles = buildHeaderContainerStyles(styles.logoLeftContainer, mb, background, style, theme.colors);
    const titleStyles = buildHeaderTitleStyles([styles.title], titleColor, theme.colors);
    return (
      <HeaderLogoLeftVariant
        styles={styles}
        containerStyles={containerStyles}
        titleStyles={titleStyles}
        title={title}
        subtitle={subtitle}
        logo={logo}
        rightText={rightText}
        rightSubText={rightSubText}
        noWrap={noWrap}
        fixed={fixed}
      />
    );
  }

  if (variant === 'two-column') {
    const containerStyles = buildHeaderContainerStyles(styles.twoColumnContainer, mb, background, style, theme.colors);
    const titleStyles = buildHeaderTitleStyles([styles.title], titleColor, theme.colors);
    return (
      <HeaderTwoColumnVariant
        styles={styles}
        containerStyles={containerStyles}
        titleStyles={titleStyles}
        title={title}
        subtitle={subtitle}
        address={address}
        phone={phone}
        email={email}
        noWrap={noWrap}
        fixed={fixed}
      />
    );
  }

  if (variant === 'minimal') {
    const containerStyles = buildHeaderContainerStyles(styles.minimalContainer, mb, background, style, theme.colors);
    const titleStyles = buildHeaderTitleStyles([styles.title, styles.titleMinimal], titleColor, theme.colors);
    return (
      <HeaderMinimalVariant
        styles={styles}
        containerStyles={containerStyles}
        titleStyles={titleStyles}
        title={title}
        subtitle={subtitle}
        rightText={rightText}
        rightSubText={rightSubText}
        noWrap={noWrap}
        fixed={fixed}
      />
    );
  }

  const containerStyles = buildHeaderContainerStyles(styles.simpleContainer, mb, background, style, theme.colors);
  const titleStyles = buildHeaderTitleStyles([styles.title], titleColor, theme.colors);
  return (
    <HeaderSimpleVariant
      styles={styles}
      containerStyles={containerStyles}
      titleStyles={titleStyles}
      title={title}
      subtitle={subtitle}
      rightText={rightText}
      rightSubText={rightSubText}
      noWrap={noWrap}
      fixed={fixed}
    />
  );
}
