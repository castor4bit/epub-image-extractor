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
    rootfiles: Array<{
      rootfile: Array<{
        $: {
          'full-path': string;
          'media-type': string;
        };
      }>;
    }>;
  };
}

export interface OpfXml {
  package: {
    manifest: Array<{
      item?: Array<{
        $: {
          id: string;
          href: string;
          'media-type': string;
          properties?: string;
        };
      }>;
    }>;
    spine: Array<{
      itemref?: Array<{
        $: {
          idref: string;
          linear?: string;
          properties?: string;
        };
      }>;
    }>;
  };
}

export interface NcxXml {
  ncx?: {
    navMap?: Array<{
      navPoint?: Array<NavPoint>;
    }>;
  };
}

export interface NavPoint {
  navLabel?: Array<{
    text?: string[];
  }>;
  content?: Array<{
    $?: {
      src?: string;
    };
  }>;
  navPoint?: NavPoint[];
}