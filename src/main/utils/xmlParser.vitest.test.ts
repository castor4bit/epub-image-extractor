import { describe, test, expect } from 'vitest';
import { parseStringPromise } from './xmlParser';

describe('XML Parser', () => {

  describe('parseStringPromise', () => {
    test('should parse simple XML', async () => {
      const xml = '<root><item>test</item></root>';
      const result = await parseStringPromise(xml);
      
      expect(result).toBeDefined();
      expect(result.root).toBeDefined();
      expect(result.root.item).toBeDefined();
    });

    test('should parse XML with attributes', async () => {
      const xml = '<root id="123"><item type="test">content</item></root>';
      const result = await parseStringPromise(xml);
      
      expect(result.root.$).toBeDefined();
      expect(result.root.$.id).toBe('123');
      expect(result.root.item.$).toBeDefined();
      expect(result.root.item.$.type).toBe('test');
    });

    test('should handle text nodes as arrays (xml2js compatibility)', async () => {
      const xml = '<root><text>Hello World</text></root>';
      const result = await parseStringPromise(xml);
      
      expect(Array.isArray(result.root.text)).toBe(true);
      expect(result.root.text[0]).toBe('Hello World');
    });

    test('should handle empty elements as array with empty string', async () => {
      const xml = '<root><empty/></root>';
      const result = await parseStringPromise(xml);
      
      expect(Array.isArray(result.root.empty)).toBe(true);
      expect(result.root.empty[0]).toBe('');
    });

    test('should throw error for invalid XML', async () => {
      const invalidXml = 'not xml content';
      
      await expect(parseStringPromise(invalidXml)).rejects.toThrow();
    });

    test('should throw error for malformed XML', async () => {
      const malformedXml = '<root><item>test</root>';
      
      await expect(parseStringPromise(malformedXml)).rejects.toThrow();
    });

    test('should parse container.xml structure correctly', async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
            <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
        </container>`;
      
      const result = await parseStringPromise(xml);
      
      expect(result.container).toBeDefined();
      expect(Array.isArray(result.container.rootfiles)).toBe(true);
      expect(Array.isArray(result.container.rootfiles[0].rootfile)).toBe(true);
      expect(result.container.rootfiles[0].rootfile[0].$['full-path']).toBe('OEBPS/content.opf');
    });

    test('should parse OPF manifest items as arrays', async () => {
      const xml = `
        <package>
          <manifest>
            <item id="item1" href="text1.xhtml" media-type="application/xhtml+xml"/>
            <item id="item2" href="text2.xhtml" media-type="application/xhtml+xml"/>
          </manifest>
        </package>`;
      
      const result = await parseStringPromise(xml);
      
      expect(Array.isArray(result.package.manifest)).toBe(true);
      expect(Array.isArray(result.package.manifest[0].item)).toBe(true);
      expect(result.package.manifest[0].item.length).toBe(2);
      expect(result.package.manifest[0].item[0].$.id).toBe('item1');
    });

    test('should parse spine itemrefs as arrays', async () => {
      const xml = `
        <package>
          <spine>
            <itemref idref="item1" linear="yes"/>
            <itemref idref="item2" linear="no"/>
          </spine>
        </package>`;
      
      const result = await parseStringPromise(xml);
      
      expect(Array.isArray(result.package.spine)).toBe(true);
      expect(Array.isArray(result.package.spine[0].itemref)).toBe(true);
      expect(result.package.spine[0].itemref.length).toBe(2);
      expect(result.package.spine[0].itemref[0].$.idref).toBe('item1');
    });

    test('should parse NCX navigation structure', async () => {
      const xml = `
        <ncx>
          <navMap>
            <navPoint id="nav1">
              <navLabel>
                <text>Chapter 1</text>
              </navLabel>
              <content src="chapter1.xhtml"/>
            </navPoint>
          </navMap>
        </ncx>`;
      
      const result = await parseStringPromise(xml);
      
      expect(Array.isArray(result.ncx.navMap)).toBe(true);
      expect(Array.isArray(result.ncx.navMap[0].navPoint)).toBe(true);
      expect(Array.isArray(result.ncx.navMap[0].navPoint[0].navLabel)).toBe(true);
      expect(Array.isArray(result.ncx.navMap[0].navPoint[0].navLabel[0].text)).toBe(true);
      expect(result.ncx.navMap[0].navPoint[0].navLabel[0].text[0]).toBe('Chapter 1');
    });

    test('should handle nested navPoints', async () => {
      const xml = `
        <ncx>
          <navMap>
            <navPoint id="nav1">
              <navLabel><text>Part 1</text></navLabel>
              <content src="part1.xhtml"/>
              <navPoint id="nav2">
                <navLabel><text>Chapter 1</text></navLabel>
                <content src="chapter1.xhtml"/>
              </navPoint>
            </navPoint>
          </navMap>
        </ncx>`;
      
      const result = await parseStringPromise(xml);
      
      const navPoint = result.ncx.navMap[0].navPoint[0];
      expect(Array.isArray(navPoint.navPoint)).toBe(true);
      expect(navPoint.navPoint[0].navLabel[0].text[0]).toBe('Chapter 1');
    });

    test('should handle mixed content', async () => {
      const xml = '<root>Text before<child>inner</child>Text after</root>';
      const result = await parseStringPromise(xml);
      
      expect(result.root).toBeDefined();
      expect(result.root['#text']).toBeDefined();
      expect(result.root.child).toBeDefined();
    });

    test('should preserve attribute values as strings', async () => {
      const xml = '<root><item count="10" active="true"/></root>';
      const result = await parseStringPromise(xml);
      
      expect(result.root.item.$.count).toBe('10');
      expect(result.root.item.$.active).toBe('true');
      expect(typeof result.root.item.$.count).toBe('string');
      expect(typeof result.root.item.$.active).toBe('string');
    });

    test('should handle HTML entities', async () => {
      const xml = '<root><text>&lt;div&gt;Test&lt;/div&gt;</text></root>';
      const result = await parseStringPromise(xml);
      
      expect(result.root.text[0]).toBe('<div>Test</div>');
    });

    test('should handle p, span, and a elements as arrays', async () => {
      const xml = `
        <root>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <span>Span text</span>
          <a href="link.html">Link text</a>
        </root>`;
      
      const result = await parseStringPromise(xml);
      
      expect(Array.isArray(result.root.p)).toBe(true);
      expect(result.root.p.length).toBe(2);
      expect(Array.isArray(result.root.span)).toBe(true);
      expect(Array.isArray(result.root.a)).toBe(true);
    });
  });

  describe('default export', () => {
    test('should provide xml2js compatible interface', async () => {
      const xmlParser = await import('./xmlParser');
      const xml = '<root><item>test</item></root>';
      
      const result = await xmlParser.default.parseStringPromise(xml);
      
      expect(result.root.item).toBeDefined();
    });
  });
});