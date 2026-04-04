"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2, ImagePlus, X, ChevronDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  input_price: number;
  output_price: number;
  tiers: string[];
  gradient: "purple" | "amber" | "coral";
  logo?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

const providerLogos: Record<string, string> = {
  minimax: "/model-logos/route-minimax.png",
  opencode: "/model-logos/route-minimax.png",
  zai: "/model-logos/route-zai.svg",
  openrouter: "/model-logos/route-nvidia.svg",
  nvidia: "/model-logos/route-nvidia.svg",
  arcee: "/model-logos/route-arcee.png",
  qwen: "/model-logos/route-qwen.png",
  openai: "/model-logos/route-openai.svg",
  nous: "/model-logos/route-nous.png",
  meta: "/model-logos/route-meta.png",
  google: "/model-logos/route-google.svg",
  kimi: "/model-logos/route-kimi.png",
  deepseek: "/model-logos/route-deepseek.png",
  xiaomi: "/model-logos/route-xiaomi.png",
  xai: "/model-logos/route-xai.png",
  chutes: "/model-logos/route-deepseek.png",
};

const allModels: Model[] = [
  { id: "route/minimax-m2.7", name: "MiniMax M2.7", provider: "minimax", description: "High-performance reasoning model", input_price: 0.33, output_price: 1.32, tiers: ["lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-minimax.png" },
  { id: "route/minimax-m2.7-highspeed", name: "MiniMax M2.7 Highspeed", provider: "xai", description: "Faster output for high-throughput", input_price: 0.33, output_price: 1.32, tiers: ["pro", "max"], gradient: "coral", logo: "/model-logos/route-minimax.png" },
  { id: "route/minimax-m2.5", name: "MiniMax M2.5", provider: "minimax", description: "Balanced performance and speed", input_price: 0.193, output_price: 1.238, tiers: ["free", "lite", "pro", "max"], gradient: "amber", logo: "/model-logos/route-minimax.png" },
  { id: "route/minimax-m2.5-highspeed", name: "MiniMax M2.5 Highspeed", provider: "minimax", description: "Fast inference model", input_price: 0.193, output_price: 1.238, tiers: ["pro"], gradient: "purple", logo: "/model-logos/route-minimax.png" },
  { id: "route/kimi-k2.5", name: "Kimi K2.5", provider: "opencode", description: "Long context with excellent reasoning", input_price: 0.462, output_price: 2.42, tiers: ["free", "lite", "pro", "max"], gradient: "coral", logo: "/model-logos/route-kimi.png" },
  { id: "route/grok-4-fast", name: "Grok-4 Fast", provider: "xai", description: "Fast xAI model with strong reasoning", input_price: 0.22, output_price: 0.55, tiers: ["pro", "max"], gradient: "purple", logo: "/model-logos/route-xai.png" },
  { id: "route/grok-4.20-beta", name: "Grok-4.20 Beta", provider: "xai", description: "Latest Grok-4 beta with improved reasoning", input_price: 2.20, output_price: 6.60, tiers: ["max"], gradient: "amber", logo: "/model-logos/route-xai.png" },
  { id: "route/grok-4.20-multi-agent-beta", name: "Grok-4.20 Multi-Agent", provider: "xai", description: "Multi-agent capable Grok-4 beta", input_price: 2.20, output_price: 6.60, tiers: ["max"], gradient: "coral", logo: "/model-logos/route-xai.png" },
  { id: "route/nemotron-3-super-120b", name: "Nemotron-3 Super 120B", provider: "openrouter", description: "Powerful 120B parameter model", input_price: 0.11, output_price: 0.55, tiers: ["free", "lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-nvidia.svg" },
  { id: "route/glm-4.5-air", name: "GLM-4.5 Air", provider: "zai", description: "Efficient GLM model", input_price: 0.143, output_price: 0.935, tiers: ["pro", "max"], gradient: "coral", logo: "/model-logos/route-zai.svg" },
  { id: "route/glm-5", name: "GLM-5", provider: "zai", description: "Latest generation GLM", input_price: 0.792, output_price: 2.53, tiers: ["lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-zai.svg" },
  { id: "route/glm-5-turbo", name: "GLM-5 Turbo", provider: "zai", description: "Faster GLM inference", input_price: 1.32, output_price: 4.40, tiers: ["pro", "max"], gradient: "amber", logo: "/model-logos/route-zai.svg" },
  { id: "route/deepseek-v3.2", name: "DeepSeek V3.2", provider: "deepseek", description: "Advanced reasoning model", input_price: 0.286, output_price: 0.418, tiers: ["pro", "max"], gradient: "coral", logo: "/model-logos/route-deepseek.png" },
  { id: "route/deepseek-r1", name: "DeepSeek R1", provider: "deepseek", description: "Advanced reasoning with chain-of-thought", input_price: 0.495, output_price: 2.365, tiers: ["max"], gradient: "amber", logo: "/model-logos/route-deepseek.png" },
  { id: "route/qwen3-coder", name: "Qwen3 Coder", provider: "openrouter", description: "Specialized code generation", input_price: 0.242, output_price: 1.10, tiers: ["pro", "max"], gradient: "purple", logo: "/model-logos/route-qwen.png" },
  { id: "route/qwen3-32b", name: "Qwen3 32B", provider: "chutes", description: "Versatile 32B model", input_price: 0.088, output_price: 0.264, tiers: ["pro", "max"], gradient: "amber", logo: "/model-logos/route-qwen.png" },
  { id: "route/llama-3.2-3b-instruct", name: "Llama 3.2 3B", provider: "meta", description: "Efficient instruction-tuned model", input_price: 0.056, output_price: 0.374, tiers: ["free", "lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-meta.png" },
  { id: "route/gemma-3-27b-it", name: "Gemma-3 27B", provider: "google", description: "Google's instruct-tuned model", input_price: 0.088, output_price: 0.176, tiers: ["free", "lite", "pro", "max"], gradient: "amber", logo: "/model-logos/route-google.svg" },
  { id: "route/mimo-v2-omni", name: "Xiaomi MiMo V2 Omni", provider: "xiaomi", description: "Flagship multimodal model", input_price: 0.44, output_price: 2.20, tiers: ["max"], gradient: "purple", logo: "/model-logos/route-xiaomi.png" },
  { id: "route/mimo-v2-pro", name: "Xiaomi MiMo V2 Pro", provider: "xiaomi", description: "Professional multimodal model", input_price: 1.10, output_price: 3.30, tiers: ["max"], gradient: "amber", logo: "/model-logos/route-xiaomi.png" },
];

const tierColors: Record<string, string> = {
  free: "bg-brand-amber/20 text-brand-amber border-brand-amber/30",
  lite: "bg-brand-blue/20 text-brand-blue border-brand-blue/30",
  pro: "bg-brand-coral/20 text-brand-coral border-brand-coral/30",
  max: "bg-brand-purple/20 text-brand-purple border-brand-purple/30",
};

export default function PlaygroundPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model>(allModels[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userPlan = user?.plan_tier?.toLowerCase() || "free";

  const tierOrder = ["free", "lite", "pro", "max"];
  const userTierIndex = tierOrder.indexOf(userPlan);

  const availableModels = allModels.filter(model => {
    const modelTierIndex = Math.max(...model.tiers.map(t => tierOrder.indexOf(t)));
    return userTierIndex >= modelTierIndex;
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setImages(prev => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && images.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      images: images.length > 0 ? [...images] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImages = [...images];
    setInput("");
    setImages([]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      let chatMessages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = 
        messages.map(m => ({ role: m.role, content: m.content }));

      if (currentImages.length > 0) {
        const contentArray: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
        if (currentInput.trim()) {
          contentArray.push({ type: "text", text: currentInput });
        }
        currentImages.forEach(img => {
          contentArray.push({ type: "image_url", image_url: { url: img } });
        });
        chatMessages.push({ role: "user", content: contentArray });
      } else {
        chatMessages.push({ role: "user", content: currentInput });
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
      const response = await fetch(`${apiUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: chatMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed (${response.status})`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "No response received",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      toast.error(err.message || "Failed to get response");
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getModelLogo = (model: Model) => {
    const providerKey = model.provider.toLowerCase();
    return providerLogos[providerKey] || model.logo;
  };

  return (
    <div className="h-full flex flex-col -m-4 lg:-m-6">
      <div className="flex items-center justify-between border-b px-4 py-3 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="gap-2 min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-muted">
                  {getModelLogo(selectedModel) ? (
                    <img src={getModelLogo(selectedModel)!} alt="" className="w-4 h-4 object-contain" />
                  ) : (
                    <span className="text-[8px] font-bold">{selectedModel.name.slice(0, 2)}</span>
                  )}
                </div>
                <span className="font-medium text-sm">{selectedModel.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>

            {showModelDropdown && (
              <div className="absolute top-full left-0 mt-2 w-[320px] max-h-[400px] overflow-hidden rounded-lg border bg-background shadow-xl z-50">
                <div className="p-2 border-b bg-muted/50">
                  <Input
                    placeholder="Search models..."
                    className="h-8 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <ScrollArea className="max-h-[340px]">
                  <div className="p-1">
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors ${
                          model.id === selectedModel.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-muted shrink-0">
                          {getModelLogo(model) ? (
                            <img src={getModelLogo(model)!} alt="" className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold">{model.name.slice(0, 2)}</span>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm truncate">{model.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{model.description}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {model.tiers.slice(0, 2).map(tier => (
                            <Badge key={tier} variant="secondary" className={`text-[8px] px-1.5 py-0 ${tierColors[tier]}`}>
                              {tier.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground ml-4">
            <div className="flex items-center gap-2">
              <span>Temp:</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-16 h-1 accent-primary"
              />
              <span className="w-6">{temperature}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Max:</span>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-20 h-1 accent-primary"
              />
              <span className="w-10">{maxTokens}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Not stored
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={messagesEndRef}>
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-white">AI</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Chat with different AI models. Your conversations are not stored and will disappear when you close this page.
                </p>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700 max-w-md">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Messages are not stored - you cannot see this chat again after closing
                </div>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-sm font-bold text-white">AI</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-brand-purple to-brand-purple/80 text-white shadow-md"
                      : "bg-muted shadow-sm border"
                  }`}
                >
                  {message.images && message.images.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {message.images.map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-amber to-brand-amber/80 flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-sm font-bold text-white">U</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3 shadow-sm border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t bg-background/95 backdrop-blur p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="shrink-0"
            >
              <ImagePlus className="w-4 h-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="min-h-[44px] max-h-[200px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || (!input.trim() && images.length === 0)}
              className="shrink-0 bg-gradient-to-br from-brand-purple to-brand-coral hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
