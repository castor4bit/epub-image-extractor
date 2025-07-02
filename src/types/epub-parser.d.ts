declare module '@gxl/epub-parser' {
  export default class EpubParser {
    constructor(epubPath: string);
    parse(): Promise<{
      manifest: Record<string, {
        id: string;
        href: string;
        mediaType: string;
        properties?: string[];
      }>;
      spine: Array<{
        idref: string;
        properties?: string[];
      }>;
      navigation?: any;
      contentPath?: string;
    }>;
    getFile(path: string): Promise<Buffer>;
  }
}