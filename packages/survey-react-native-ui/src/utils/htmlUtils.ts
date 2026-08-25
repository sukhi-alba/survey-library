import * as React from "react";
import { Text, Linking, TextStyle } from "react-native";

/**
 * htmlUtils.ts
 * Minimal HTML parser and sanitization utility for the React Native survey renderer.
 *
 * Security: This module parses basic formatting tags to nested React Native Text nodes.
 * Script tags are completely ignored, and no webviews are executed.
 */

/**
 * Strips all HTML tags from an HTML string and returns plain text.
 * Preserves text content inside tags.
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  let result = html;

  // Convert block-level breaks to newlines before stripping
  result = result.replace(/<br\s*\/?>/gi, "\n");
  result = result.replace(/<\/p\s*>/gi, "\n");
  result = result.replace(/<p\s*[^>]*>/gi, "");
  result = result.replace(/<\/div\s*>/gi, "\n");
  result = result.replace(/<div\s*[^>]*>/gi, "");
  result = result.replace(/<li\s*[^>]*>/gi, "\n\u2022 ");

  // Strip remaining tags
  result = result.replace(/<[^>]*>/g, "");

  // Decode common HTML entities
  result = result
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Collapse multiple consecutive blank lines to at most two
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}

/**
 * Parses basic HTML tags into nested React Native Text components.
 * Supports: <b>, <strong>, <i>, <em>, <u>, <a> (links), <br>, <p>, <h1>, <h2>, <h3>.
 * All other tags are stripped, but their text content is rendered.
 */
export function parseHtmlToReact(html: string, themeColors: any): React.ReactNode {
  if (!html) return null;

  // Tokenize by tags
  const tokens = html.split(/(<\/?[a-zA-Z0-9]+(?:\s+[^>]*)?>)/g);
  const elements: React.ReactNode[] = [];
  const styleStack: TextStyle[] = [];
  let currentLinkUrl: string | null = null;

  // Helper to get active combined styles
  const getActiveStyles = (): TextStyle => {
    return Object.assign({}, ...styleStack);
  };

  tokens.forEach((token, index) => {
    if (!token) return;

    if (token.startsWith("<") && token.endsWith(">")) {
      const isClosing = token.startsWith("</");
      const tagContent = token.slice(isClosing ? 2 : 1, -1).trim();
      const tagName = tagContent.split(/\s+/)[0].toLowerCase();

      if (isClosing) {
        // Pop styles when closing tags are met
        if (tagName === "b" || tagName === "strong") {
          styleStack.pop();
        } else if (tagName === "i" || tagName === "em") {
          styleStack.pop();
        } else if (tagName === "u") {
          styleStack.pop();
        } else if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
          styleStack.pop();
        } else if (tagName === "a") {
          styleStack.pop();
          currentLinkUrl = null;
        }
      } else {
        // Push styles for opening tags
        if (tagName === "b" || tagName === "strong") {
          styleStack.push({ fontWeight: "bold" });
        } else if (tagName === "i" || tagName === "em") {
          styleStack.push({ fontStyle: "italic" });
        } else if (tagName === "u") {
          styleStack.push({ textDecorationLine: "underline" });
        } else if (tagName === "h1") {
          styleStack.push({ fontSize: 20, fontWeight: "bold", marginVertical: 6 });
        } else if (tagName === "h2") {
          styleStack.push({ fontSize: 18, fontWeight: "bold", marginVertical: 4 });
        } else if (tagName === "h3") {
          styleStack.push({ fontSize: 16, fontWeight: "bold", marginVertical: 2 });
        } else if (tagName === "br") {
          elements.push("\n");
        } else if (tagName === "p") {
          elements.push("\n");
        } else if (tagName === "a") {
          // Extract href link using simple regex
          const match = tagContent.match(/href=["']([^"']+)["']/i);
          const url = match ? match[1] : null;
          if (url) {
            currentLinkUrl = url;
            styleStack.push({
              color: themeColors.primary || "#007AFF",
              textDecorationLine: "underline",
            });
          }
        }
      }
    } else {
      // Plain text token: decode entities
      let text = token
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");

      if (text) {
        const activeStyle = getActiveStyles();
        const urlToOpen = currentLinkUrl;

        if (urlToOpen) {
          elements.push(
            React.createElement(
              Text,
              {
                key: index,
                style: activeStyle,
                onPress: () => {
                  Linking.openURL(urlToOpen).catch(() => {});
                },
              },
              text
            )
          );
        } else {
          elements.push(
            React.createElement(
              Text,
              {
                key: index,
                style: activeStyle,
              },
              text
            )
          );
        }
      }
    }
  });

  return React.createElement(Text, null, elements);
}
