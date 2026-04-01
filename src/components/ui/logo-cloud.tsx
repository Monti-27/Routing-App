import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div">;

const models: Logo[] = [
  { src: "/model-logos/route-openai.svg", alt: "OpenAI" },
  { src: "/model-logos/route-google.png", alt: "Google" },
  { src: "/model-logos/route-meta.png", alt: "Meta" },
  { src: "/model-logos/route-deepseek.png", alt: "DeepSeek" },
  { src: "/model-logos/route-nvidia.svg", alt: "NVIDIA" },
  { src: "/model-logos/route-xai.png", alt: "xAI" },
  { src: "/model-logos/route-minimax.png", alt: "MiniMax" },
  { src: "/model-logos/route-kimi.png", alt: "Kimi" },
  { src: "/model-logos/route-qwen.png", alt: "Qwen" },
  { src: "/model-logos/route-zai.svg", alt: "ZAI" },
  { src: "/model-logos/route-arcee.png", alt: "Arcè" },
  { src: "/model-logos/route-nous.png", alt: "Nous" },
];

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-border border border-border rounded-2xl overflow-hidden",
        className
      )}
      {...props}
    >
      {models.map((logo, i) => (
        <LogoCard
          key={logo.alt}
          logo={logo}
          className={cn(
            "bg-background",
            (i + 1) % 3 === 0 && "border-r-0",
          )}
        />
      ))}
    </div>
  );
}

type LogoCardProps = React.ComponentProps<"div"> & {
  logo: Logo;
};

function LogoCard({ logo, className, children, ...props }: LogoCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background px-6 py-10 md:py-12 min-h-[100px]",
        className
      )}
      {...props}
    >
      <img
        alt={logo.alt}
        className="max-h-8 md:max-h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
        src={logo.src}
      />
      {children}
    </div>
  );
}
