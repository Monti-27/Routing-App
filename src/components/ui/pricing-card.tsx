import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Zap, Cpu, Globe, Shield } from "lucide-react";

interface PricingCardProps {
  title: string;
  price?: string;
  priceDescription?: string;
  description: string;
  features?: string[];
  buttonText: string;
  icon?: React.ReactNode;
  isPopular?: boolean;
  className?: string;
}

const cardVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      title,
      price,
      priceDescription,
      description,
      features,
      buttonText,
      icon,
      isPopular = false,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        className={cn(
          "relative flex flex-col justify-between rounded-xl border bg-card p-8 text-card-foreground shadow-sm",
          isPopular && "border-primary shadow-lg shadow-primary/20",
          className
        )}
        {...props}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
            Most Popular
          </div>
        )}
        
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {icon}
              <h3 className="text-2xl font-bold">{title}</h3>
            </div>
            {price && (
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">{price}</span>
                {priceDescription && (
                  <span className="text-muted-foreground ml-1">{priceDescription}</span>
                )}
              </div>
            )}
            {!price && (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">Custom</span>
              </div>
            )}
            <p className="text-muted-foreground mt-3">{description}</p>
          </div>

          {features && (
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <Button className={cn("w-full", isPopular && "bg-primary")}>
            {buttonText}
          </Button>
        </div>
      </motion.div>
    );
  }
);
PricingCard.displayName = "PricingCard";

export { PricingCard };
