import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };