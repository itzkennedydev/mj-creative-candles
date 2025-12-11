import { ComponentType, SVGProps, useEffect, useRef } from "react";

export function createAnimatedIcon(
  Icon: ComponentType<SVGProps<SVGSVGElement>>,
  animationType: "rotate" | "scale" | "translate" = "rotate"
) {
  return function AnimatedIcon({
    "data-hovered": hovered,
    ...rest
  }: { "data-hovered"?: boolean } & SVGProps<SVGSVGElement>) {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      if (hovered) {
        const animations = {
          rotate: [
            { transform: "rotate(0deg)" },
            { transform: "rotate(15deg)" },
            { transform: "rotate(-15deg)" },
            { transform: "rotate(0deg)" },
          ],
          scale: [
            { transform: "scale(1)" },
            { transform: "scale(1.15)" },
            { transform: "scale(1)" },
          ],
          translate: [
            { transform: "translateY(0)" },
            { transform: "translateY(-3px)" },
            { transform: "translateY(0)" },
          ],
        };

        containerRef.current.animate(animations[animationType], {
          duration: 300,
        });
      }
    }, [hovered, animationType]);

    return (
      <span
        ref={containerRef}
        className="inline-flex [transform-box:fill-box] [transform-origin:center]"
      >
        <Icon
          {...rest}
          className={rest.className}
        />
      </span>
    );
  };
}

