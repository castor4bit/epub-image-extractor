// EPUB関連の型定義

export interface ManifestItem {
  id: string;
  href: string;
  'media-type': string;
  properties?: string;
}

export interface SpineItem {
  idref: string;
  linear?: string;
  pageSpread?: 'left' | 'right';
  properties?: string;
}

export interface ContainerXml {
  container: {
    rootfiles: {
      rootfile: {
        'full-path': string;
        'media-type': string;
      } | Array<{
        'full-path': string;
        'media-type': string;
      }>;
    };
  };
}

export interface OpfXml {
  package: {
    manifest: {
      item?: {
        id: string;
        href: string;
        'media-type': string;
        properties?: string;
      } | Array<{
        id: string;
        href: string;
        'media-type': string;
        properties?: string;
      }>;
    };
    spine: {
      itemref?: {
        idref: string;
        linear?: string;
        properties?: string;
      } | Array<{
        idref: string;
        linear?: string;
        properties?: string;
      }>;
    };
  };
}

export interface NcxXml {
  ncx?: {
    navMap?: {
      navPoint?: NavPoint | NavPoint[];
    };
  };
}

export interface NavPoint {
  navLabel?: {
    text?: string;
    '#text'?: string;
  } | string;
  content?: {
    src?: string;
  };
  navPoint?: NavPoint | NavPoint[];
}
