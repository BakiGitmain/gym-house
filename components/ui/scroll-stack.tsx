import {
  Children,
  type CSSProperties,
  type ReactNode,
} from "react";

type ScrollStackItemProps = {
  children: ReactNode;
  itemClassName?: string;
};

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemStackDistance?: number;
  stackPosition?: string | number;
  endDistance?: string | number;
};

function toCssLength(value: string | number) {
  return typeof value === "number"
    ? `${value}px`
    : value;
}

export function ScrollStackItem({
  children,
  itemClassName = "",
}: ScrollStackItemProps) {
  return (
    <div
      className={[
        "scroll-stack-card relative w-full",
        itemClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 150,
  itemStackDistance = 16,
  stackPosition = "clamp(88px, 12vh, 118px)",
  endDistance = "55vh",
}: ScrollStackProps) {
  const childCount = Children.count(children);
  const stackTop = toCssLength(stackPosition);

  return (
    <div
      className={[
        "scroll-stack relative isolate w-full overflow-visible",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Children.map(children, (child, index) => {
        const isLastItem =
          index === childCount - 1;

        const cardStyle: CSSProperties = {
          position: "sticky",

          top: `calc(${stackTop} + ${
            index * itemStackDistance
          }px)`,

          zIndex: index + 1,

          marginBottom: isLastItem
            ? 0
            : itemDistance,

          transform: "translate3d(0, 0, 0)",

          transformOrigin: "top center",

          backfaceVisibility: "hidden",

          WebkitBackfaceVisibility: "hidden",
        };

        return (
          <div
            className="scroll-stack-shell w-full"
            style={cardStyle}
          >
            {child}
          </div>
        );
      })}

      <div
        aria-hidden="true"
        className="pointer-events-none w-full"
        style={{
          height: toCssLength(endDistance),
        }}
      />
    </div>
  );
}