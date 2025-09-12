import { describe, it, expect } from 'vitest';
import { parseNavigationDocument } from '../parser';

describe('parseNavigationDocument - HTML Sanitization', () => {
  describe('Security vulnerability fix verification', () => {
    it('should safely handle incomplete script tags', async () => {
      const maliciousNav = `
        <?xml version="1.0" encoding="UTF-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="chapter1.xhtml">Normal Chapter</a></li>
              <li><a href="chapter2.xhtml">Chapter with <script alert("XSS")</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(maliciousNav);

      expect(chapters).toHaveLength(2);
      expect(chapters[0].title).toBe('Normal Chapter');

      // Verify that incomplete script tags are safely processed
      expect(chapters[1].title).toBe('Chapter with');
      expect(chapters[1].title).not.toContain('<script');
      expect(chapters[1].title).not.toContain('alert');
    });

    it('should remove complete script tags and their contents', async () => {
      const navWithScript = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="ch1.xhtml">Title with <script>alert("XSS")</script> script</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(navWithScript);

      expect(chapters).toHaveLength(1);
      // Script tags and their contents are completely removed
      expect(chapters[0].title).toBe('Title with script');
      expect(chapters[0].title).not.toContain('alert');
      expect(chapters[0].title).not.toContain('<script');
    });

    it('should remove style tags and their contents', async () => {
      const navWithStyle = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="ch1.xhtml">Title with <style>body{display:none}</style> style</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(navWithStyle);

      expect(chapters).toHaveLength(1);
      // Style tags and their contents are removed
      expect(chapters[0].title).toBe('Title with style');
      expect(chapters[0].title).not.toContain('display');
      expect(chapters[0].title).not.toContain('body');
    });

    it('should remove HTML comments', async () => {
      const navWithComment = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="ch1.xhtml">Title <!-- hidden comment --> visible</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(navWithComment);

      expect(chapters).toHaveLength(1);
      // Comments are removed
      expect(chapters[0].title).toBe('Title visible');
      expect(chapters[0].title).not.toContain('comment');
      expect(chapters[0].title).not.toContain('<!--');
    });

    it('should safely handle img tags with dangerous attributes', async () => {
      const navWithImg = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="ch1.xhtml">Click <img src="x" onerror="alert(1)"/> here</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(navWithImg);

      expect(chapters).toHaveLength(1);
      // img tags are completely removed
      expect(chapters[0].title).toBe('Click here');
      expect(chapters[0].title).not.toContain('onerror');
      expect(chapters[0].title).not.toContain('<img');
    });

    it('should properly handle nested HTML tags', async () => {
      const navWithNested = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="ch1.xhtml"><span>Chapter <em>One <strong>Bold</strong></em></span></a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(navWithNested);

      expect(chapters).toHaveLength(1);
      // All tags are removed, leaving only text
      expect(chapters[0].title).toBe('Chapter One Bold');
    });

    it('should safely handle multiple malicious patterns', async () => {
      const complexMaliciousNav = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="ch1.xhtml">Normal</a></li>
              <li><a href="ch2.xhtml"><script>alert(1)</script>Script</a></li>
              <li><a href="ch3.xhtml">Incomplete <script tag</a></li>
              <li><a href="ch4.xhtml">With <!-- comment --> text</a></li>
              <li><a href="ch5.xhtml"><img onerror="hack()"/>Image</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(complexMaliciousNav);

      expect(chapters).toHaveLength(5);

      expect(chapters[0].title).toBe('Normal');
      expect(chapters[1].title).toBe('Script');
      expect(chapters[2].title).toBe('Incomplete');
      expect(chapters[3].title).toBe('With text');
      expect(chapters[4].title).toBe('Image');

      // Verify that no chapter titles contain dangerous elements
      chapters.forEach((chapter) => {
        expect(chapter.title).not.toContain('<script');
        expect(chapter.title).not.toContain('alert');
        expect(chapter.title).not.toContain('onerror');
        expect(chapter.title).not.toContain('<!--');
      });
    });
  });

  describe('Normal content processing', () => {
    it('should correctly process normal navigation documents', async () => {
      const normalNav = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="cover.xhtml">Cover</a></li>
              <li><a href="chapter1.xhtml">Chapter 1: Introduction</a></li>
              <li><a href="chapter2.xhtml">Chapter 2: Basic Concepts</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(normalNav);

      expect(chapters).toHaveLength(3);
      expect(chapters[0].title).toBe('Cover');
      expect(chapters[0].href).toBe('cover.xhtml');
      expect(chapters[0].order).toBe(1);

      expect(chapters[1].title).toBe('Chapter 1: Introduction');
      expect(chapters[1].href).toBe('chapter1.xhtml');
      expect(chapters[1].order).toBe(2);

      expect(chapters[2].title).toBe('Chapter 2: Basic Concepts');
      expect(chapters[2].href).toBe('chapter2.xhtml');
      expect(chapters[2].order).toBe(3);
    });

    it('should return an empty array when toc is not found', async () => {
      const navWithoutToc = `
        <html xmlns="http://www.w3.org/1999/xhtml">
        <body>
          <nav>
            <ol>
              <li><a href="chapter1.xhtml">Chapter 1</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(navWithoutToc);

      expect(chapters).toEqual([]);
    });

    it('should ignore li elements without links', async () => {
      const navWithMixedContent = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li><a href="ch1.xhtml">Chapter 1</a></li>
              <li>Text without link</li>
              <li><a href="ch2.xhtml">Chapter 2</a></li>
            </ol>
          </nav>
        </body>
        </html>
      `;

      const chapters = await parseNavigationDocument(navWithMixedContent);

      expect(chapters).toHaveLength(2);
      expect(chapters[0].title).toBe('Chapter 1');
      expect(chapters[1].title).toBe('Chapter 2');
    });
  });
});
