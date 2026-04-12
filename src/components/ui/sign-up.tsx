"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import React, {
  Children,
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Gem,
  Loader,
  Lock,
  Mail,
  PartyPopper,
  ShieldCheck,
  X,
} from "lucide-react";
import { GrainGradient } from "@paper-design/shaders-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import type {
  CreateTypes as ConfettiInstance,
  GlobalOptions as ConfettiGlobalOptions,
  Options as ConfettiOptions,
} from "canvas-confetti";

type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;

const ConfettiContext = createContext<Api>({} as Api);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
const TEXT_LOOP_INTERVAL = 1.5;
const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const OTP_LENGTH = 6;

const modalSteps = [
  {
    message: "Sending your code...",
    icon: <Loader className="h-12 w-12 animate-spin text-primary" />,
  },
  {
    message: "Checking your sign-in...",
    icon: <Loader className="h-12 w-12 animate-spin text-primary" />,
  },
  {
    message: "Opening your dashboard...",
    icon: <Loader className="h-12 w-12 animate-spin text-primary" />,
  },
  {
    message: "You're in!",
    icon: <PartyPopper className="h-12 w-12 text-green-500" />,
  },
] as const;

const Confetti = forwardRef<
  ConfettiRef,
  React.ComponentPropsWithRef<"canvas"> & {
    options?: ConfettiOptions;
    globalOptions?: ConfettiGlobalOptions;
    manualstart?: boolean;
  }
>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);

  const canvasRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
        return;
      }

      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    },
    [globalOptions],
  );

  const fire = useCallback(
    (opts: ConfettiOptions = {}) =>
      instanceRef.current?.({ ...options, ...opts }),
    [options],
  );

  const api = useMemo(() => ({ fire }), [fire]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) {
      fire();
    }
  }, [fire, manualstart]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasRef} {...rest} />
    </ConfettiContext.Provider>
  );
});
Confetti.displayName = "Confetti";

type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  stopOnEnd?: boolean;
};

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
  stopOnEnd = false,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = window.setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          window.clearInterval(timer);
          return current;
        }

        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [interval, items.length, onIndexChange, stopOnEnd]);

  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          animate="animate"
          exit="exit"
          initial="initial"
          key={currentIndex}
          transition={transition}
          variants={variants || motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type BlurFadeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: { hidden: { y: number }; visible: { y: number } };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  blur?: string;
};

function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = true,
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inViewResult = useInView(ref, { once: true, margin: "-50px" });
  const isVisible = !inView || inViewResult;

  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: "blur(0px)" },
  };

  return (
    <motion.div
      animate={isVisible ? "visible" : "hidden"}
      className={className}
      exit="hidden"
      initial="hidden"
      ref={ref}
      transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
      variants={variant || defaultVariants}
    >
      {children}
    </motion.div>
  );
}

const glassButtonVariants = cva(
  "relative isolate cursor-pointer rounded-full transition-all",
  {
    variants: {
      size: {
        default: "text-base font-medium",
        sm: "text-sm font-medium",
        lg: "text-lg font-medium",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const glassButtonTextVariants = cva(
  "glass-button-text relative block select-none tracking-tighter",
  {
    variants: {
      size: {
        default: "px-6 py-3.5",
        sm: "px-4 py-2",
        lg: "px-8 py-4",
        icon: "flex h-10 w-10 items-center justify-center",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof glassButtonVariants> & {
    contentClassName?: string;
  };

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
      const button = event.currentTarget.querySelector("button");
      if (button && event.target !== button) {
        button.click();
      }
    };

    return (
      <div
        className={cn(
          "glass-button-wrap relative cursor-pointer rounded-full",
          className,
        )}
        onClick={handleWrapperClick}
      >
        <button
          className={cn(
            "glass-button relative z-10",
            glassButtonVariants({ size }),
          )}
          onClick={onClick}
          ref={ref}
          {...props}
        >
          <span
            className={cn(glassButtonTextVariants({ size }), contentClassName)}
          >
            {children}
          </span>
        </button>
        <div className="glass-button-shadow pointer-events-none rounded-full" />
      </div>
    );
  },
);
GlassButton.displayName = "GlassButton";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className="h-6 w-6"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="none" fillRule="evenodd">
      <g fillRule="nonzero" transform="translate(3, 2)">
        <path
          d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"
          fill="#4285F4"
        />
        <path
          d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"
          fill="#34A853"
        />
        <path
          d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"
          fill="#FBBC05"
        />
        <path
          d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"
          fill="#EB4335"
        />
      </g>
    </g>
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className="h-6 w-6"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      fill="currentColor"
    />
  </svg>
);

const DefaultLogo = () => (
  <div className="rounded-md bg-primary p-1.5 text-primary-foreground">
    <Gem className="h-4 w-4" />
  </div>
);

type AuthStep = "email" | "password" | "otp";
type ModalStatus = "closed" | "loading" | "error" | "success";

type AuthComponentProps = {
  logo?: React.ReactNode;
  brandName?: string;
};

export const AuthComponent = ({
  logo = <DefaultLogo />,
  brandName = "Routing.run",
}: AuthComponentProps) => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [modalStatus, setModalStatus] = useState<ModalStatus>("closed");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const isEmailValid = EMAIL_PATTERN.test(email);
  const isPasswordValid = password.length >= 1;
  const isOtpValid = otp.trim().length >= OTP_LENGTH;

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authStep === "password") {
      window.setTimeout(() => passwordInputRef.current?.focus(), 250);
    }

    if (authStep === "otp") {
      window.setTimeout(() => otpInputRef.current?.focus(), 250);
    }
  }, [authStep]);

  useEffect(() => {
    if (modalStatus === "success") {
      const fire = confettiRef.current?.fire;
      if (!fire) return;

      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      };
      fire({
        ...defaults,
        angle: 60,
        origin: { x: 0, y: 1 },
        particleCount: 45,
      });
      fire({
        ...defaults,
        angle: 120,
        origin: { x: 1, y: 1 },
        particleCount: 45,
      });
    }
  }, [modalStatus]);

  const closeModal = () => {
    setModalStatus("closed");
    setModalErrorMessage("");
  };

  const getErrorMessage = async (response: Response, fallback: string) => {
    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return `${fallback} (${response.status})`;
    }

    try {
      const error = (await response.json()) as {
        detail?: string;
        error?: string;
        message?: string;
      };

      return error.message || error.detail || error.error || fallback;
    } catch {
      return `${fallback} (${response.status})`;
    }
  };

  const sendLoginCode = async () => {
    const response = await fetch(`${API_URL}/auth/login/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Unable to send sign-in code"),
      );
    }
  };

  const handleProgressStep = async () => {
    if (isSubmitting) return;

    if (authStep === "email") {
      if (!isEmailValid) return;
      setAuthStep("password");
      return;
    }

    if (authStep === "password") {
      if (!isPasswordValid) return;

      setIsSubmitting(true);

      try {
        await sendLoginCode();
        toast.success("A verification code was sent to your email");
        setOtp("");
        setAuthStep("otp");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to send sign-in code";
        setModalErrorMessage(message);
        setModalStatus("error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (authStep === "otp") {
      await handleFinalSubmit(event);
      return;
    }

    await handleProgressStep();
  };

  const handleGoBack = () => {
    if (authStep === "otp") {
      setAuthStep("password");
      setOtp("");
      closeModal();
      return;
    }

    if (authStep === "password") {
      setAuthStep("email");
    }
  };

  const handleGithubOAuth = () => {
    setIsGithubLoading(true);
    window.location.href = `${API_URL}/auth/oauth/github`;
  };

  const handleGoogleClick = () => {
    toast.info("Google sign-in is not enabled yet.");
  };

  const handleFinalSubmit = async (
    event: React.FormEvent | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (modalStatus !== "closed" || authStep !== "otp" || !isOtpValid) {
      return;
    }

    setIsSubmitting(true);
    setModalStatus("loading");
    setModalErrorMessage("");

    try {
      await login(email, otp.trim());
      setModalStatus("success");
      toast.success("Signed in successfully");
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (error) {
      setModalErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify your sign-in code",
      );
      setModalStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== "closed" && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="relative mx-2 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border-4 border-border bg-card/80 p-8"
            exit={{ scale: 0.9, opacity: 0 }}
            initial={{ scale: 0.9, opacity: 0 }}
          >
            {(modalStatus === "error" || modalStatus === "success") && (
              <button
                className="absolute right-2 top-2 p-1 text-muted-foreground transition-colors hover:text-foreground"
                onClick={closeModal}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {modalStatus === "error" && (
              <>
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-center text-lg font-medium text-foreground">
                  {modalErrorMessage}
                </p>
                <GlassButton
                  className="mt-4"
                  onClick={closeModal}
                  size="sm"
                  type="button"
                >
                  Try Again
                </GlassButton>
              </>
            )}

            {modalStatus === "loading" && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd>
                {modalSteps.slice(0, -1).map((step) => (
                  <div
                    className="flex flex-col items-center gap-4"
                    key={step.message}
                  >
                    {step.icon}
                    <p className="text-lg font-medium text-foreground">
                      {step.message}
                    </p>
                  </div>
                ))}
              </TextLoop>
            )}

            {modalStatus === "success" && (
              <div className="flex flex-col items-center gap-4">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-lg font-medium text-foreground">
                  {modalSteps[modalSteps.length - 1].message}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <style>{`
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; }
        input[type="password"]::-webkit-credentials-auto-fill-button, input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px transparent inset !important; -webkit-text-fill-color: var(--foreground) !important; background-color: transparent !important; background-clip: content-box !important; transition: background-color 5000s ease-in-out 0s !important; color: var(--foreground) !important; caret-color: var(--foreground) !important; }
        input:autofill { background-color: transparent !important; background-clip: content-box !important; -webkit-text-fill-color: var(--foreground) !important; color: var(--foreground) !important; }
        input:-internal-autofill-selected { background-color: transparent !important; background-image: none !important; color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; }
        input:-webkit-autofill::first-line { color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; }
        @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
        @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
        .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); }
        .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); }
        .glass-button-shadow { --shadow-cutoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cutoff-fix)); height: calc(100% + var(--shadow-cutoff-fix)); top: calc(0% - var(--shadow-cutoff-fix) / 2); left: calc(0% - var(--shadow-cutoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); transition: filter var(--anim-time) var(--anim-ease); z-index: 0; }
        .glass-button-shadow::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(180deg, oklch(from var(--foreground) l c h / 20%), oklch(from var(--foreground) l c h / 10%)); width: calc(100% - var(--shadow-cutoff-fix) - 0.25em); height: calc(100% - var(--shadow-cutoff-fix) - 0.25em); top: calc(var(--shadow-cutoff-fix) - 0.5em); left: calc(var(--shadow-cutoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease); opacity: 1; }
        .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, oklch(from var(--background) l c h / 5%), oklch(from var(--background) l c h / 20%), oklch(from var(--background) l c h / 5%)); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.25em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0 0 0 oklch(from var(--background) l c h); }
        .glass-button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.15em 0.05em -0.1em oklch(from var(--foreground) l c h / 25%), 0 0 0.05em 0.1em inset oklch(from var(--background) l c h / 50%), 0 0 0 0 oklch(from var(--background) l c h); }
        .glass-button-text { color: oklch(from var(--foreground) l c h / 90%); text-shadow: 0 0.25em 0.05em oklch(from var(--foreground) l c h / 10%); transition: all var(--anim-time) var(--anim-ease); }
        .glass-button:hover .glass-button-text { text-shadow: 0.025em 0.025em 0.025em oklch(from var(--foreground) l c h / 12%); }
        .glass-button-text::after { content: ""; display: block; position: absolute; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, oklch(from var(--background) l c h / 50%) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(var(--anim-time) * 1.25) var(--anim-ease), --angle-2 calc(var(--anim-time) * 1.25) var(--anim-ease); }
        .glass-button:hover .glass-button-text::after { background-position: 25% 50%; }
        .glass-button:active .glass-button-text::after { background-position: 50% 15%; --angle-2: -15deg; }
        .glass-button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, oklch(from var(--foreground) l c h / 50%) 0%, transparent 5% 40%, oklch(from var(--foreground) l c h / 50%) 50%, transparent 60% 95%, oklch(from var(--foreground) l c h / 50%) 100%), linear-gradient(180deg, oklch(from var(--background) l c h / 50%), oklch(from var(--background) l c h / 50%)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) oklch(from var(--background) l c h / 50%); pointer-events: none; }
        .glass-button:hover::after { --angle-1: -125deg; }
        .glass-button:active::after { --angle-1: -75deg; }
        .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow { filter: blur(clamp(2px, 0.0625em, 6px)); }
        .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.875em); opacity: 1; }
        .glass-button-wrap:has(.glass-button:active) .glass-button-shadow { filter: blur(clamp(2px, 0.125em, 12px)); }
        .glass-button-wrap:has(.glass-button:active) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.5em); opacity: 0.75; }
        .glass-button-wrap:has(.glass-button:active) .glass-button-text { text-shadow: 0.025em 0.25em 0.05em oklch(from var(--foreground) l c h / 12%); }
        .glass-button-wrap:has(.glass-button:active) .glass-button { box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.125em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0.225em 0.05em 0 oklch(from var(--foreground) l c h / 5%), 0 0.25em 0 0 oklch(from var(--background) l c h / 75%), inset 0 0.25em 0.05em 0 oklch(from var(--foreground) l c h / 15%); }
        .glass-input-wrap { position: relative; z-index: 2; transform-style: preserve-3d; border-radius: 9999px; }
        .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1); background: linear-gradient(-75deg, oklch(from var(--background) l c h / 5%), oklch(from var(--background) l c h / 20%), oklch(from var(--background) l c h / 5%)); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.25em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0 0 0 oklch(from var(--background) l c h); }
        .glass-input-wrap:focus-within .glass-input { backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.15em 0.05em -0.1em oklch(from var(--foreground) l c h / 25%), 0 0 0.05em 0.1em inset oklch(from var(--background) l c h / 50%), 0 0 0 0 oklch(from var(--background) l c h); }
        .glass-input::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + clamp(1px, 0.0625em, 4px)); height: calc(100% + clamp(1px, 0.0625em, 4px)); top: calc(0% - clamp(1px, 0.0625em, 4px) / 2); left: calc(0% - clamp(1px, 0.0625em, 4px) / 2); padding: clamp(1px, 0.0625em, 4px); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, oklch(from var(--foreground) l c h / 50%) 0%, transparent 5% 40%, oklch(from var(--foreground) l c h / 50%) 50%, transparent 60% 95%, oklch(from var(--foreground) l c h / 50%) 100%), linear-gradient(180deg, oklch(from var(--background) l c h / 50%), oklch(from var(--background) l c h / 50%)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(clamp(1px, 0.0625em, 4px) / 2) oklch(from var(--background) l c h / 50%); pointer-events: none; }
        .glass-input-wrap:focus-within .glass-input::after { --angle-1: -125deg; }
        .glass-input-text-area { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; }
        .glass-input-text-area::after { content: ""; display: block; position: absolute; width: calc(100% - clamp(1px, 0.0625em, 4px)); height: calc(100% - clamp(1px, 0.0625em, 4px)); top: calc(0% + clamp(1px, 0.0625em, 4px) / 2); left: calc(0% + clamp(1px, 0.0625em, 4px) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, oklch(from var(--background) l c h / 50%) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1), --angle-2 calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1); }
        .glass-input-wrap:focus-within .glass-input-text-area::after { background-position: 25% 50%; }
      `}</style>

      <Confetti
        className="pointer-events-none fixed left-0 top-0 z-[999] h-full w-full"
        manualstart
        ref={confettiRef}
      />
      <Modal />

      <div
        className={cn(
          "fixed left-4 top-4 z-20 flex items-center gap-2",
          "md:left-1/2 md:-translate-x-1/2",
        )}
      >
        {logo}
        <h1 className="text-base font-bold text-foreground">{brandName}</h1>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <GrainGradient
            className="h-full w-full"
            colorBack="#000000"
            colors={["#f5f5f5", "#060308", "#2b93b6", "#241b55"]}
            height="100%"
            intensity={0.5}
            noise={0.25}
            shape="corners"
            softness={0.5}
            speed={1}
            width="100%"
          />
        </div>

        <fieldset
          className="relative z-10 mx-auto flex w-[280px] flex-col items-center gap-8 p-4"
          disabled={modalStatus !== "closed" || isSubmitting || isGithubLoading}
        >
          <AnimatePresence mode="wait">
            {authStep === "email" && (
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="flex w-full flex-col items-center gap-4"
                exit={{ opacity: 0 }}
                initial={{ y: 6, opacity: 0 }}
                key="email-content"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <BlurFade className="w-full" delay={0.25}>
                  <div className="text-center">
                    <p className="whitespace-nowrap text-4xl font-light tracking-tight text-foreground font-serif sm:text-5xl md:text-6xl">
                      Welcome back
                    </p>
                  </div>
                </BlurFade>
                <BlurFade delay={0.5}>
                  <p className="text-sm font-medium text-muted-foreground">
                    Continue with
                  </p>
                </BlurFade>
                <BlurFade delay={0.75}>
                  <div className="flex w-full items-center justify-center gap-4">
                    <GlassButton
                      contentClassName="flex items-center justify-center gap-2"
                      onClick={handleGoogleClick}
                      size="sm"
                      type="button"
                    >
                      <GoogleIcon />
                      <span className="font-semibold text-foreground">
                        Google
                      </span>
                    </GlassButton>
                    <GlassButton
                      contentClassName="flex items-center justify-center gap-2"
                      onClick={handleGithubOAuth}
                      size="sm"
                      type="button"
                    >
                      {isGithubLoading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <GitHubIcon className="h-5 w-5" />
                      )}
                      <span className="font-semibold text-foreground">
                        GitHub
                      </span>
                    </GlassButton>
                  </div>
                </BlurFade>
                <BlurFade className="w-[300px]" delay={1}>
                  <div className="flex w-full items-center gap-2 py-2">
                    <hr className="w-full border-border" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      OR
                    </span>
                    <hr className="w-full border-border" />
                  </div>
                </BlurFade>
              </motion.div>
            )}

            {authStep === "password" && (
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="flex w-full flex-col items-center gap-4 text-center"
                exit={{ opacity: 0 }}
                initial={{ y: 6, opacity: 0 }}
                key="password-title"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <BlurFade className="w-full">
                  <div className="text-center">
                    <p className="whitespace-nowrap text-4xl font-light tracking-tight text-foreground font-serif sm:text-5xl">
                      Enter your password
                    </p>
                  </div>
                </BlurFade>
                <BlurFade delay={0.25}>
                  <p className="text-sm font-medium text-muted-foreground">
                    We&apos;ll email you a verification code next.
                  </p>
                </BlurFade>
              </motion.div>
            )}

            {authStep === "otp" && (
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="flex w-full flex-col items-center gap-4 text-center"
                exit={{ opacity: 0 }}
                initial={{ y: 6, opacity: 0 }}
                key="otp-title"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <BlurFade className="w-full">
                  <div className="text-center">
                    <p className="whitespace-nowrap text-4xl font-light tracking-tight text-foreground font-serif sm:text-5xl">
                      Check your inbox
                    </p>
                  </div>
                </BlurFade>
                <BlurFade delay={0.25}>
                  <p className="text-sm font-medium text-muted-foreground">
                    Enter the 6-digit code we sent to {email}.
                  </p>
                </BlurFade>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="w-[300px] space-y-6" onSubmit={handleFinalSubmit}>
            <AnimatePresence>
              {authStep !== "otp" && (
                <motion.div
                  className="w-full space-y-6"
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  key="email-password-fields"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <BlurFade
                    className="w-full"
                    delay={authStep === "email" ? 1.25 : 0}
                    inView
                  >
                    <div className="relative w-full">
                      <AnimatePresence>
                        {authStep === "password" && (
                          <motion.div
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute left-4 top-[-1.5rem] z-10"
                            initial={{ y: -10, opacity: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                          >
                            <label className="text-xs font-semibold text-muted-foreground">
                              Email
                            </label>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="glass-input-wrap w-full">
                        <div className="glass-input">
                          <span className="glass-input-text-area" />
                          <div
                            className={cn(
                              "relative z-10 flex flex-shrink-0 items-center justify-center overflow-hidden transition-all duration-300 ease-in-out",
                              email.length > 20 && authStep === "email"
                                ? "w-0 px-0"
                                : "w-10 pl-2",
                            )}
                          >
                            <Mail className="h-5 w-5 flex-shrink-0 text-foreground/80" />
                          </div>
                          <input
                            autoComplete="email"
                            className={cn(
                              "relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none transition-[padding-right] duration-300 ease-in-out delay-300",
                              isEmailValid && authStep === "email"
                                ? "pr-2"
                                : "pr-0",
                            )}
                            onChange={(event) => setEmail(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Email"
                            type="email"
                            value={email}
                          />
                          <div
                            className={cn(
                              "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
                              isEmailValid && authStep === "email"
                                ? "w-10 pr-1"
                                : "w-0",
                            )}
                          >
                            <GlassButton
                              aria-label="Continue with email"
                              contentClassName="text-foreground/80 hover:text-foreground"
                              onClick={() => void handleProgressStep()}
                              size="icon"
                              type="button"
                            >
                              <ArrowRight className="h-5 w-5" />
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BlurFade>

                  <AnimatePresence>
                    {authStep === "password" && (
                      <BlurFade className="w-full" key="password-field">
                        <div className="relative w-full">
                          <AnimatePresence>
                            {password.length > 0 && (
                              <motion.div
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute left-4 top-[-1.5rem] z-10"
                                initial={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <label className="text-xs font-semibold text-muted-foreground">
                                  Password
                                </label>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="glass-input-wrap w-full">
                            <div className="glass-input">
                              <span className="glass-input-text-area" />
                              <div className="relative z-10 flex w-10 flex-shrink-0 items-center justify-center pl-2">
                                {isPasswordValid ? (
                                  <button
                                    aria-label="Toggle password visibility"
                                    className="rounded-full p-2 text-foreground/80 transition-colors hover:text-foreground"
                                    onClick={() =>
                                      setShowPassword((current) => !current)
                                    }
                                    type="button"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-5 w-5" />
                                    ) : (
                                      <Eye className="h-5 w-5" />
                                    )}
                                  </button>
                                ) : (
                                  <Lock className="h-5 w-5 flex-shrink-0 text-foreground/80" />
                                )}
                              </div>
                              <input
                                autoComplete="current-password"
                                className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none"
                                onChange={(event) =>
                                  setPassword(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Password"
                                ref={passwordInputRef}
                                type={showPassword ? "text" : "password"}
                                value={password}
                              />
                              <div
                                className={cn(
                                  "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
                                  isPasswordValid ? "w-10 pr-1" : "w-0",
                                )}
                              >
                                <GlassButton
                                  aria-label="Submit password"
                                  contentClassName="text-foreground/80 hover:text-foreground"
                                  onClick={() => void handleProgressStep()}
                                  size="icon"
                                  type="button"
                                >
                                  {isSubmitting ? (
                                    <Loader className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <ArrowRight className="h-5 w-5" />
                                  )}
                                </GlassButton>
                              </div>
                            </div>
                          </div>
                        </div>

                        <BlurFade delay={0.2} inView>
                          <button
                            className="mt-4 flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
                            onClick={handleGoBack}
                            type="button"
                          >
                            <ArrowLeft className="h-4 w-4" /> Go back
                          </button>
                        </BlurFade>
                      </BlurFade>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {authStep === "otp" && (
                <BlurFade className="w-full" key="otp-field">
                  <div className="relative w-full">
                    <AnimatePresence>
                      {otp.length > 0 && (
                        <motion.div
                          animate={{ y: 0, opacity: 1 }}
                          className="absolute left-4 top-[-1.5rem] z-10"
                          initial={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="text-xs font-semibold text-muted-foreground">
                            Verification Code
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="glass-input-wrap w-[300px]">
                      <div className="glass-input">
                        <span className="glass-input-text-area" />
                        <div className="relative z-10 flex w-10 flex-shrink-0 items-center justify-center pl-2">
                          {isOtpValid ? (
                            <button
                              aria-label="Toggle code visibility"
                              className="rounded-full p-2 text-foreground/80 transition-colors hover:text-foreground"
                              onClick={() => setShowOtp((current) => !current)}
                              type="button"
                            >
                              {showOtp ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          ) : (
                            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-foreground/80" />
                          )}
                        </div>
                        <input
                          className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none"
                          inputMode="numeric"
                          maxLength={OTP_LENGTH}
                          onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, ""))
                          }
                          onKeyDown={handleKeyDown}
                          placeholder="6-digit code"
                          ref={otpInputRef}
                          type={showOtp ? "text" : "password"}
                          value={otp}
                        />
                        <div
                          className={cn(
                            "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
                            isOtpValid ? "w-10 pr-1" : "w-0",
                          )}
                        >
                          <GlassButton
                            aria-label="Finish sign-in"
                            contentClassName="text-foreground/80 hover:text-foreground"
                            size="icon"
                            type="submit"
                          >
                            {isSubmitting ? (
                              <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                              <ArrowRight className="h-5 w-5" />
                            )}
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <button
                      className="flex items-center gap-2 text-foreground/70 transition-colors hover:text-foreground"
                      onClick={handleGoBack}
                      type="button"
                    >
                      <ArrowLeft className="h-4 w-4" /> Go back
                    </button>

                    <button
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => void handleProgressStep()}
                      type="button"
                    >
                      Resend code
                    </button>
                  </div>
                </BlurFade>
              )}
            </AnimatePresence>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              className="font-medium text-accent-foreground hover:text-accent-foreground/80"
              href="/auth/register"
            >
              Sign up
            </Link>
          </p>
        </fieldset>
      </div>
    </div>
  );
};
