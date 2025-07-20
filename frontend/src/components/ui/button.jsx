import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

import "./button.css";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const baseClasses = "button";
    const variantClasses = {
      default: "button-default",
      destructive: "button-destructive",
      outline: "button-outline",
      secondary: "button-secondary",
      ghost: "button-ghost",
      link: "button-link",
    };
    const sizeClasses = {
      default: "button-size-default",
      sm: "button-size-sm",
      lg: "button-size-lg",
      icon: "button-size-icon",
    };

    return (
      <Comp
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          disabled && "button-disabled",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
