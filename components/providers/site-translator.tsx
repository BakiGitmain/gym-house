"use client";

import { useEffect } from "react";

import { useLanguage } from "@/components/providers/language-provider";
import { AMHARIC_COPY } from "@/lib/site-copy";
import type { Language } from "@/lib/translations";

const TRANSLATABLE_ATTRIBUTES = [
  "aria-label",
  "title",
  "placeholder",
  "alt",
] as const;

const SKIP_SELECTOR =
  "script, style, noscript, code, pre, [data-no-translate='true']";

type TextGroupRecord = {
  nodes: Text[];
  originalValues: string[];
  sourceText: string;
};

const textNodeSources = new WeakMap<Text, string>();

const textGroupSources = new WeakMap<
  Element,
  TextGroupRecord
>();

const attributeSources = new WeakMap<
  Element,
  Map<string, string>
>();

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasTranslation(value: string) {
  return Object.prototype.hasOwnProperty.call(
    AMHARIC_COPY,
    value,
  );
}

function translateKnownValue(value: string) {
  const normalizedValue = normalizeText(value);

  if (hasTranslation(normalizedValue)) {
    return AMHARIC_COPY[normalizedValue];
  }

  return normalizedValue;
}

function translateValue(
  originalValue: string,
): string | null {
  const value = normalizeText(originalValue);

  if (!value) {
    return null;
  }

  if (hasTranslation(value)) {
    return AMHARIC_COPY[value];
  }

  /*
   * Dynamic course numbers.
   */
  const courseMatch = value.match(
    /^Course\s+(\d+)$/,
  );

  if (courseMatch) {
    return `ኮርስ ${courseMatch[1]}`;
  }

  /*
   * Dynamic trainer screen-reader labels.
   */
  const trainerNumberMatch = value.match(
    /^Trainer number\s+(.+)$/,
  );

  if (trainerNumberMatch) {
    return `አሰልጣኝ ${trainerNumberMatch[1]}`;
  }

  /*
   * Rating accessibility label.
   */
  const ratingMatch = value.match(
    /^(.+)\s+out of 5 stars$/,
  );

  if (ratingMatch) {
    return `${ratingMatch[1]} ከ5 ኮከብ`;
  }

  /*
   * Program membership link.
   */
  const membershipPlanMatch = value.match(
    /^See membership plan for\s+(.+)$/,
  );

  if (membershipPlanMatch) {
    const programName = translateKnownValue(
      membershipPlanMatch[1],
    );

    return `የ${programName} ፕላን ይዩ`;
  }

  /*
   * Testimonial preview.
   * The person's name remains unchanged.
   */
  const testimonialMatch = value.match(
    /^Show the story of\s+(.+)$/,
  );

  if (testimonialMatch) {
    return `የ${testimonialMatch[1]} ታሪክ አሳይ`;
  }

  /*
   * Trainer selector.
   * The trainer name remains unchanged.
   */
  const showMatch = value.match(
    /^Show\s+(.+)$/,
  );

  if (showMatch) {
    return `${showMatch[1]}ን አሳይ`;
  }

  /*
   * Carousel dot accessibility labels.
   */
  const goToMatch = value.match(
    /^Go to\s+(.+)$/,
  );

  if (goToMatch) {
    const destination = translateKnownValue(
      goToMatch[1],
    );

    return `ወደ ${destination} ይሂዱ`;
  }

  /*
   * Social links.
   * Instagram, Facebook and other brand names
   * remain unchanged.
   */
  const socialMatch = value.match(
    /^Visit Gym House on\s+(.+)$/,
  );

  if (socialMatch) {
    return `Gym Houseን በ${socialMatch[1]} ይጎብኙ`;
  }

  /*
   * Dynamic copyright year.
   */
  const copyrightMatch = value.match(
    /^©\s*(\d{4})\s+Gym House\.\s+All rights reserved\.$/,
  );

  if (copyrightMatch) {
    return `© ${copyrightMatch[1]} Gym House። መብቱ የተጠበቀ ነው።`;
  }

  return null;
}

function getLeadingWhitespace(value: string) {
  return value.match(/^\s*/)?.[0] ?? "";
}

function getTrailingWhitespace(value: string) {
  return value.match(/\s*$/)?.[0] ?? "";
}

function preserveWhitespace(
  originalValue: string,
  translatedValue: string,
) {
  return `${getLeadingWhitespace(
    originalValue,
  )}${translatedValue}${getTrailingWhitespace(
    originalValue,
  )}`;
}

function isSkippedElement(element: Element) {
  return Boolean(element.closest(SKIP_SELECTOR));
}

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;

  if (!parent) {
    return false;
  }

  return isSkippedElement(parent);
}

function getTextNodes(element: Element) {
  return Array.from(element.childNodes).filter(
    (node): node is Text =>
      node.nodeType === Node.TEXT_NODE,
  );
}

function sameTextNodes(
  first: Text[],
  second: Text[],
) {
  if (first.length !== second.length) {
    return false;
  }

  return first.every(
    (node, index) => node === second[index],
  );
}

/*
 * Translates leaf elements such as:
 *
 * <p>
 *   Unlock your full potential with
 *   expertly designed courses...
 * </p>
 *
 * React may create several text nodes for that
 * paragraph. This function combines them before
 * looking for a translation.
 */
function translateTextGroup(
  element: Element,
  language: Language,
) {
  if (
    isSkippedElement(element) ||
    element.childElementCount > 0
  ) {
    return false;
  }

  const nodes = getTextNodes(element);

  if (nodes.length === 0) {
    return false;
  }

  let record = textGroupSources.get(element);

  if (
    !record ||
    !sameTextNodes(record.nodes, nodes)
  ) {
    const originalValues = nodes.map(
      (node) => node.nodeValue ?? "",
    );

    record = {
      nodes,
      originalValues,
      sourceText: normalizeText(
        originalValues.join(""),
      ),
    };

    textGroupSources.set(element, record);
  }

  const existingTranslation = translateValue(
    record.sourceText,
  );

  const currentText = normalizeText(
    nodes
      .map((node) => node.nodeValue ?? "")
      .join(""),
  );

  /*
   * React may reuse an element while changing its
   * content, for example when a carousel changes
   * to another testimonial.
   */
  if (
    currentText &&
    currentText !== record.sourceText &&
    currentText !== existingTranslation
  ) {
    const currentValues = nodes.map(
      (node) => node.nodeValue ?? "",
    );

    record = {
      nodes,
      originalValues: currentValues,
      sourceText: normalizeText(
        currentValues.join(""),
      ),
    };

    textGroupSources.set(element, record);
  }

  const translation = translateValue(
    record.sourceText,
  );

  if (translation === null) {
    return false;
  }

  if (language === "en") {
    record.nodes.forEach((node, index) => {
      const originalValue =
        record.originalValues[index] ?? "";

      if (node.nodeValue !== originalValue) {
        node.nodeValue = originalValue;
      }
    });

    return true;
  }

  const firstOriginalValue =
    record.originalValues[0] ?? "";

  const lastOriginalValue =
    record.originalValues[
      record.originalValues.length - 1
    ] ?? "";

  const translatedValue = `${getLeadingWhitespace(
    firstOriginalValue,
  )}${translation}${getTrailingWhitespace(
    lastOriginalValue,
  )}`;

  record.nodes.forEach((node, index) => {
    const nextValue =
      index === 0 ? translatedValue : "";

    if (node.nodeValue !== nextValue) {
      node.nodeValue = nextValue;
    }
  });

  return true;
}

function getOriginalTextNodeValue(node: Text) {
  const currentValue = node.nodeValue ?? "";
  const savedValue = textNodeSources.get(node);

  if (savedValue === undefined) {
    textNodeSources.set(node, currentValue);
    return currentValue;
  }

  const savedTranslation =
    translateValue(savedValue);

  const expectedTranslation =
    savedTranslation === null
      ? savedValue
      : preserveWhitespace(
          savedValue,
          savedTranslation,
        );

  /*
   * React reused this text node and rendered new
   * English content into it.
   */
  if (
    currentValue !== savedValue &&
    currentValue !== expectedTranslation
  ) {
    textNodeSources.set(node, currentValue);
    return currentValue;
  }

  return savedValue;
}

function translateTextNode(
  node: Text,
  language: Language,
) {
  if (shouldSkipTextNode(node)) {
    return;
  }

  const originalValue =
    getOriginalTextNodeValue(node);

  if (!normalizeText(originalValue)) {
    return;
  }

  if (language === "en") {
    if (node.nodeValue !== originalValue) {
      node.nodeValue = originalValue;
    }

    return;
  }

  const translatedValue =
    translateValue(originalValue);

  if (translatedValue === null) {
    return;
  }

  const finalValue = preserveWhitespace(
    originalValue,
    translatedValue,
  );

  if (node.nodeValue !== finalValue) {
    node.nodeValue = finalValue;
  }
}

function getOriginalAttributeValue(
  element: Element,
  attributeName: string,
) {
  const currentValue =
    element.getAttribute(attributeName);

  if (currentValue === null) {
    return null;
  }

  let attributeMap =
    attributeSources.get(element);

  if (!attributeMap) {
    attributeMap = new Map<string, string>();

    attributeSources.set(
      element,
      attributeMap,
    );
  }

  const savedValue =
    attributeMap.get(attributeName);

  if (savedValue === undefined) {
    attributeMap.set(
      attributeName,
      currentValue,
    );

    return currentValue;
  }

  const savedTranslation =
    translateValue(savedValue);

  const expectedValue =
    savedTranslation ?? savedValue;

  /*
   * React changed the attribute after a carousel
   * or another interactive component updated.
   */
  if (
    currentValue !== savedValue &&
    currentValue !== expectedValue
  ) {
    attributeMap.set(
      attributeName,
      currentValue,
    );

    return currentValue;
  }

  return savedValue;
}

function translateElementAttributes(
  element: Element,
  language: Language,
) {
  if (isSkippedElement(element)) {
    return;
  }

  for (const attributeName of TRANSLATABLE_ATTRIBUTES) {
    const originalValue =
      getOriginalAttributeValue(
        element,
        attributeName,
      );

    if (originalValue === null) {
      continue;
    }

    if (language === "en") {
      if (
        element.getAttribute(attributeName) !==
        originalValue
      ) {
        element.setAttribute(
          attributeName,
          originalValue,
        );
      }

      continue;
    }

    const translatedValue =
      translateValue(originalValue);

    if (
      translatedValue !== null &&
      element.getAttribute(attributeName) !==
        translatedValue
    ) {
      element.setAttribute(
        attributeName,
        translatedValue,
      );
    }
  }
}

function translateNode(
  node: Node,
  language: Language,
) {
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node as Text, language);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = node as Element;

  if (isSkippedElement(element)) {
    return;
  }

  translateElementAttributes(
    element,
    language,
  );

  /*
   * When the complete leaf element matches a
   * translation, do not separately translate each
   * small text node inside it.
   */
  if (translateTextGroup(element, language)) {
    return;
  }

  Array.from(element.childNodes).forEach(
    (childNode) => {
      translateNode(childNode, language);
    },
  );
}

export default function SiteTranslator() {
  const { language } = useLanguage();

  useEffect(() => {
    if (!language) {
      return;
    }

    const root = document.body;

    translateNode(root, language);

    const observer = new MutationObserver(
      (mutationRecords) => {
        mutationRecords.forEach((record) => {
          if (
            record.type === "characterData"
          ) {
            const parent =
              record.target.parentElement;

            if (parent) {
              translateNode(parent, language);
            } else {
              translateTextNode(
                record.target as Text,
                language,
              );
            }

            return;
          }

          if (
            record.type === "attributes" &&
            record.target instanceof Element
          ) {
            translateElementAttributes(
              record.target,
              language,
            );

            return;
          }

          record.addedNodes.forEach(
            (addedNode) => {
              translateNode(
                addedNode,
                language,
              );
            },
          );
        });
      },
    );

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        ...TRANSLATABLE_ATTRIBUTES,
      ],
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  return null;
}