import { describe, it, expect } from 'vitest';
import { sanitizeText, stripHtml, sanitizeUrl } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('escapes ampersands', () => {
    expect(sanitizeText('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than signs', () => {
    expect(sanitizeText('a < b')).toBe('a &lt; b');
  });

  it('escapes greater-than signs', () => {
    expect(sanitizeText('a > b')).toBe('a &gt; b');
  });

  it('escapes double quotes', () => {
    expect(sanitizeText('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeText("it's")).toBe("it&#x27;s");
  });

  it('escapes a complete HTML tag', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('returns empty string unchanged', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('leaves plain text without special characters unchanged', () => {
    expect(sanitizeText('Hello World 123')).toBe('Hello World 123');
  });

  it('escapes multiple special characters in one string', () => {
    const input = '<div class="test">&</div>';
    const expected = '&lt;div class=&quot;test&quot;&gt;&amp;&lt;/div&gt;';
    expect(sanitizeText(input)).toBe(expected);
  });
});

describe('stripHtml', () => {
  it('removes HTML tags from a string', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('removes self-closing tags', () => {
    expect(stripHtml('line1<br/>line2')).toBe('line1line2');
  });

  it('removes tags with attributes', () => {
    expect(stripHtml('<a href="https://example.com">Click</a>')).toBe('Click');
  });

  it('returns text content when no tags present', () => {
    expect(stripHtml('Just plain text')).toBe('Just plain text');
  });

  it('removes nested tags', () => {
    expect(stripHtml('<div><span>Inner</span></div>')).toBe('Inner');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('removes script tags and their content attribute text', () => {
    // stripHtml only removes tags, not the content between them
    const result = stripHtml('<script>alert("xss")</script>');
    expect(result).toBe('alert("xss")');
  });

  it('removes multiple tags leaving text between them', () => {
    expect(stripHtml('<b>Bold</b> and <i>italic</i>')).toBe('Bold and italic');
  });
});

describe('sanitizeUrl', () => {
  it('blocks javascript: protocol URLs', () => {
    expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
  });

  it('blocks javascript: with mixed case', () => {
    expect(sanitizeUrl('JaVaScRiPt:alert("xss")')).toBe('');
  });

  it('blocks javascript: with leading whitespace', () => {
    expect(sanitizeUrl('  javascript:alert("xss")')).toBe('');
  });

  it('blocks data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toBe('');
  });

  it('blocks data: with mixed case', () => {
    expect(sanitizeUrl('DATA:text/html,payload')).toBe('');
  });

  it('allows https: URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows http: URLs', () => {
    expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('allows relative URLs', () => {
    expect(sanitizeUrl('/about')).toBe('/about');
  });

  it('trims whitespace from allowed URLs', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
  });

  it('allows mailto: URLs', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
  });
});
