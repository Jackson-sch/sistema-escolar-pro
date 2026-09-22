import type { ComponentType, PropsWithChildren } from "react";
import type {
  DocumentProps as BaseDocumentProps,
  PageProps as BasePageProps,
  ViewProps as BaseViewProps,
  TextProps as BaseTextProps,
  LinkProps as BaseLinkProps,
  NoteProps,
  ImageProps as BaseImageProps,
  CanvasProps,
  SVGProps,
  LineProps,
  PolylineProps,
  PolygonProps,
  RectProps,
  CircleProps,
  EllipseProps,
  PathProps,
  GProps,
  ClipPathProps,
  DefsProps,
  TspanProps,
  Styles,
} from "@react-pdf/renderer";

export type DocumentProps = PropsWithChildren<BaseDocumentProps & Record<string, any>>;
export type PageProps = PropsWithChildren<BasePageProps & Record<string, any>>;
export type ViewProps = PropsWithChildren<BaseViewProps & Record<string, any>>;
export type TextProps = PropsWithChildren<BaseTextProps & Record<string, any>>;
export type LinkProps = PropsWithChildren<BaseLinkProps & Record<string, any>>;
export type ImageProps = BaseImageProps & Record<string, any>;

/* eslint-disable @typescript-eslint/no-require-imports */
const ReactPDF = require("@react-pdf/renderer");

export const Document = ReactPDF.Document as ComponentType<DocumentProps>;
export const Page = ReactPDF.Page as ComponentType<PageProps>;
export const View = ReactPDF.View as ComponentType<ViewProps>;
export const Text = ReactPDF.Text as ComponentType<TextProps>;
export const Link = ReactPDF.Link as ComponentType<LinkProps>;
export const Note = ReactPDF.Note as ComponentType<NoteProps>;
export const Image = ReactPDF.Image as ComponentType<ImageProps>;
export const Canvas = ReactPDF.Canvas as ComponentType<CanvasProps>;
export const Svg = ReactPDF.Svg as ComponentType<PropsWithChildren<SVGProps & Record<string, any>>>;
export const Line = ReactPDF.Line as ComponentType<LineProps & Record<string, any>>;
export const Polyline = ReactPDF.Polyline as ComponentType<PolylineProps & Record<string, any>>;
export const Polygon = ReactPDF.Polygon as ComponentType<PolygonProps & Record<string, any>>;
export const Rect = ReactPDF.Rect as ComponentType<RectProps & Record<string, any>>;
export const Circle = ReactPDF.Circle as ComponentType<CircleProps & Record<string, any>>;
export const Ellipse = ReactPDF.Ellipse as ComponentType<EllipseProps & Record<string, any>>;
export const Path = ReactPDF.Path as ComponentType<PathProps & Record<string, any>>;
export const G = ReactPDF.G as ComponentType<PropsWithChildren<GProps & Record<string, any>>>;
export const ClipPath = ReactPDF.ClipPath as ComponentType<ClipPathProps & Record<string, any>>;
export const Defs = ReactPDF.Defs as ComponentType<DefsProps & Record<string, any>>;
export const Tspan = ReactPDF.Tspan as ComponentType<TspanProps & Record<string, any>>;
export const StyleSheet = ReactPDF.StyleSheet as typeof import("@react-pdf/renderer").StyleSheet;
export const Font = ReactPDF.Font as typeof import("@react-pdf/renderer").Font;
export const pdf = ReactPDF.pdf as typeof import("@react-pdf/renderer").pdf;
export const PDFViewer = ReactPDF.PDFViewer as typeof import("@react-pdf/renderer").PDFViewer;
export const PDFDownloadLink = ReactPDF.PDFDownloadLink as typeof import("@react-pdf/renderer").PDFDownloadLink;
export const BlobProvider = ReactPDF.BlobProvider as typeof import("@react-pdf/renderer").BlobProvider;
export const renderToStream = ReactPDF.renderToStream as typeof import("@react-pdf/renderer").renderToStream;
export const renderToBuffer = ReactPDF.renderToBuffer as typeof import("@react-pdf/renderer").renderToBuffer;
export const renderToFile = ReactPDF.renderToFile as typeof import("@react-pdf/renderer").renderToFile;

export type {
  NoteProps,
  CanvasProps,
  SVGProps,
  LineProps,
  PolylineProps,
  PolygonProps,
  RectProps,
  CircleProps,
  EllipseProps,
  PathProps,
  GProps,
  ClipPathProps,
  DefsProps,
  TspanProps,
  Styles,
};

export default ReactPDF;
