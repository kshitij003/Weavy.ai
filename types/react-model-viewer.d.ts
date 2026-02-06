import React from "react";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                src?: string;
                alt?: string;
                "camera-controls"?: boolean;
                "auto-rotate"?: boolean;
                "disable-zoom"?: boolean;
                "disable-pan"?: boolean;
                "disable-tap"?: boolean;
                "field-of-view"?: string;
                exposure?: string;
                "auto-rotate-delay"?: string;
                "rotation-per-second"?: string;
                "interaction-prompt"?: string;
                "shadow-intensity"?: string | number;
                style?: React.CSSProperties;
            };
        }
    }
}

export { };
