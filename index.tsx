import React, { useCallback } from "react";

import { bodyFront } from "./assets/bodyFront";
import { bodyBack } from "./assets/bodyBack";
import { bodyFemaleFront } from "./assets/bodyFemaleFront";
import { bodyFemaleBack } from "./assets/bodyFemaleBack";
import { SvgMaleWrapper } from "./components/SvgMaleWrapper";
import { SvgFemaleWrapper } from "./components/SvgFemaleWrapper";

export type Slug =
  | "abs"
  | "adductors"
  | "ankles"
  | "biceps"
  | "calves"
  | "chest"
  | "deltoids"
  | "feet"
  | "forearm"
  | "gluteal"
  | "hamstring"
  | "hands"
  | "hair"
  | "head"
  | "knees"
  | "lower-back"
  | "neck"
  | "obliques"
  | "quadriceps"
  | "tibialis"
  | "trapezius"
  | "triceps"
  | "upper-back";

export interface BodyPartStyles {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface BodyPart {
  color?: string;
  slug?: Slug;
  path?: {
    common?: string[];
    left?: string[];
    right?: string[];
  };
}

export interface ExtendedBodyPart extends BodyPart {
  color?: string;
  intensity?: number;
  side?: "left" | "right";
  styles?: BodyPartStyles;
}

export type BodyProps = {
  colors?: ReadonlyArray<string>;
  data: ReadonlyArray<ExtendedBodyPart>;
  scale?: number;
  side?: "front" | "back";
  gender?: "male" | "female";
  onBodyPartPress?: (b: ExtendedBodyPart, side?: "left" | "right") => void;
  border?: string | "none";
  disabledParts?: Slug[];
  hiddenParts?: Slug[];
  defaultFill?: string;
  defaultStroke?: string;
  defaultStrokeWidth?: number;
};

const Body = ({
  colors = ["#0984e3", "#74b9ff"],
  data,
  scale = 1,
  side = "front",
  gender = "male",
  onBodyPartPress,
  border = "#dfdfdf",
  disabledParts = [],
  hiddenParts = [],
  defaultFill = "#3f3f3f",
  defaultStroke = "none",
  defaultStrokeWidth = 0,
}: BodyProps) => {
  const getPartStyles = useCallback(
    (bodyPart: ExtendedBodyPart): BodyPartStyles => {
      // Per-part styles override global defaults
      return {
        fill: bodyPart.styles?.fill ?? defaultFill,
        stroke: bodyPart.styles?.stroke ?? defaultStroke,
        strokeWidth: bodyPart.styles?.strokeWidth ?? defaultStrokeWidth,
      };
    },
    [defaultFill, defaultStroke, defaultStrokeWidth]
  );

  const mergedBodyParts = useCallback(
    (dataSource: ReadonlyArray<BodyPart>) => {
      const filteredDataSource = dataSource.filter(
        (part) => !hiddenParts.includes(part.slug!)
      );

      // Create a map of user data by slug+side for per-side customization
      // Key format: "slug" or "slug:left"/"slug:right"
      const userDataMap = new Map<string, ExtendedBodyPart[]>();
      data.forEach((userPart) => {
        if (userPart.slug) {
          const key = userPart.side ? `${userPart.slug}:${userPart.side}` : userPart.slug;
          const existing = userDataMap.get(key) || [];
          userDataMap.set(key, [...existing, userPart]);
        }
      });

      // Get the user part(s) for a given slug and side
      const getUserParts = (slug: string, side?: "left" | "right") => {
        // Try exact match with side first
        if (side) {
          const sideKey = `${slug}:${side}`;
          const sideSpecific = userDataMap.get(sideKey);
          if (sideSpecific && sideSpecific.length > 0) return sideSpecific;
        }
        // Fall back to slug-only (applies to both sides)
        const general = userDataMap.get(slug);
        return general || [];
      };

      // Merge asset body parts with user data
      return filteredDataSource.map((assetPart): ExtendedBodyPart => {
        const userParts = getUserParts(assetPart.slug!);

        if (userParts.length === 0) {
          // No user data for this part, return as-is
          return assetPart;
        }

        // Use the first matching user part (maintains backward compatibility)
        const userPart = userParts[0];

        // Merge asset part (has path) with user part (has styles, color, etc.)
        const merged: ExtendedBodyPart = {
          ...assetPart,
          // Explicitly copy first user property as fallback
          styles: userPart.styles,
          intensity: userPart.intensity,
          color: userPart.color,
        };

        // Set color fallback based on intensity if provided
        if (!merged.styles?.fill && !merged.color && merged.intensity) {
          merged.color = colors[merged.intensity - 1];
        }

        return merged;
      });
    },
    [data, colors, hiddenParts]
  );

  const getColorToFill = (bodyPart: ExtendedBodyPart, side?: "left" | "right") => {
    if (bodyPart.slug && disabledParts.includes(bodyPart.slug)) {
      return "#EBEBE4";
    }

    // When rendering a specific side path, look up side-specific user data
    if (side && bodyPart.slug) {
      const sideSpecificPart = data.find(
        (d) => d.slug === bodyPart.slug && d.side === side
      );
      
      if (sideSpecificPart) {
        // Found side-specific data - use it
        if (sideSpecificPart.styles?.fill) {
          return sideSpecificPart.styles.fill;
        }
        if (sideSpecificPart.color) {
          return sideSpecificPart.color;
        }
        if (sideSpecificPart.intensity && sideSpecificPart.intensity > 0) {
          return colors[sideSpecificPart.intensity - 1];
        }
      }
    }

    // Priority: per-part styles.fill > color prop > intensity-based color > default
    if (bodyPart.styles?.fill) {
      return bodyPart.styles.fill;
    }

    if (bodyPart.color) {
      return bodyPart.color;
    }

    if (bodyPart.intensity && bodyPart.intensity > 0) {
      return colors[bodyPart.intensity - 1];
    }

    return undefined; // Let getPartStyles provide the default
  };

  const isPartDisabled = (slug?: Slug) => slug && disabledParts.includes(slug);

  const renderBodySvg = (bodyToRender: ReadonlyArray<BodyPart>) => {
    const SvgWrapper = gender === "male" ? SvgMaleWrapper : SvgFemaleWrapper;
    return (
      <SvgWrapper side={side} scale={scale} border={border}>
        {mergedBodyParts(bodyToRender).map((bodyPart: ExtendedBodyPart) => {
          const commonPaths = (bodyPart.path?.common || []).map(
            (path, index) => {
              const partStyles = getPartStyles(bodyPart);
              const fillColor = getColorToFill(bodyPart);

              return (
                <path
                  key={`${bodyPart.slug}-common-${index}`}
                  onClick={
                    isPartDisabled(bodyPart.slug)
                      ? undefined
                      : () => onBodyPartPress?.(bodyPart)
                  }
                  style={{
                    cursor: isPartDisabled(bodyPart.slug)
                      ? "not-allowed"
                      : "pointer",
                    opacity: isPartDisabled(bodyPart.slug) ? 0.6 : 1,
                  }}
                  aria-disabled={isPartDisabled(bodyPart.slug)}
                  id={bodyPart.slug}
                  fill={fillColor ?? partStyles.fill}
                  stroke={partStyles.stroke}
                  strokeWidth={partStyles.strokeWidth}
                  d={path}
                />
              );
            }
          );

          const leftPaths = (bodyPart.path?.left || []).map((path, index) => {
            const isOnlyRight = !data.find(
              (d) => d.slug === bodyPart.slug && (d.side === undefined || d.side === "left")
            );
            const partStyles = getPartStyles(bodyPart);
            const fillColor = isOnlyRight ? defaultFill : getColorToFill(bodyPart, "left");

            return (
              <path
                key={`${bodyPart.slug}-left-${index}`}
                onClick={
                  isPartDisabled(bodyPart.slug)
                    ? undefined
                    : () => onBodyPartPress?.(bodyPart, "left")
                }
                style={{
                  cursor: isPartDisabled(bodyPart.slug)
                    ? "not-allowed"
                    : "pointer",
                  opacity: isPartDisabled(bodyPart.slug) ? 0.6 : 1,
                }}
                id={bodyPart.slug}
                fill={fillColor ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                d={path}
              />
            );
          });

          const rightPaths = (bodyPart.path?.right || []).map((path, index) => {
            const isOnlyLeft = !data.find(
              (d) => d.slug === bodyPart.slug && (d.side === undefined || d.side === "right")
            );
            const partStyles = getPartStyles(bodyPart);
            const fillColor = isOnlyLeft ? defaultFill : getColorToFill(bodyPart, "right");

            return (
              <path
                key={`${bodyPart.slug}-right-${index}`}
                onClick={
                  isPartDisabled(bodyPart.slug)
                    ? undefined
                    : () => onBodyPartPress?.(bodyPart, "right")
                }
                style={{
                  cursor: isPartDisabled(bodyPart.slug)
                    ? "not-allowed"
                    : "pointer",
                  opacity: isPartDisabled(bodyPart.slug) ? 0.6 : 1,
                }}
                id={bodyPart.slug}
                fill={fillColor ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                d={path}
              />
            );
          });

          return [...commonPaths, ...leftPaths, ...rightPaths];
        })}
      </SvgWrapper>
    );
  };

  const bodyToRender =
    gender === "female"
      ? side === "front"
        ? bodyFemaleFront
        : bodyFemaleBack
      : side === "front"
      ? bodyFront
      : bodyBack;

  return renderBodySvg(bodyToRender);
};

export default Body;
