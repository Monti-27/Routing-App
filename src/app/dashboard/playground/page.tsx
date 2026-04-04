"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, ImagePlus, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  context_length: string;
  input_price: number;
  output_price: number;
  tiers: string[];
  gradient: "purple" | "amber" | "coral";
  logo?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  images?: string[];
}

const providerLogos: Record<string, string> = {
  "minimax": "/model-logos/route-minimax.png",
  "opencode": "/model-logos/route-minimax.png",
  "zai": "/model-logos/route-zai.svg",
  "openrouter": "/model-logos/route-nvidia.svg",
  "nvidia": "/model-logos/route-nvidia.svg",
  "arcee": "/model-logos/route-arcee.png",
  "qwen": "/model-logos/route-qwen.png",
  "openai": "/model-logos/route-openai.svg",
  "nous": "/model-logos/route-nous.png",
  "meta": "/model-logos/route-meta.png",
  "google": "/model-logos/route-google.svg",
  "kimi": "/model-logos/route-kimi.png",
  "deepseek": "/model-logos/route-deepseek.png",
  "xiaomi": "/model-logos/route-xiaomi.png",
  "xai": "/model-logos/route-xai.png",
  "chutes": "/model-logos/route-deepseek.png",
};

const allModels: Model[] = [
  { id: "route/minimax-m2.7", name: "MiniMax M2.7", provider: "minimax", description: "High-performance reasoning model", context_length: "200K", input_price: 0.33, output_price: 1.32, tiers: ["lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-minimax.png" },
  { id: "route/minimax-m2.7-highspeed", name: "MiniMax M2.7 Highspeed", provider: "xai", description: "Faster output for high-throughput", context_length: "200K", input_price: 0.33, output_price: 1.32, tiers: ["pro", "max"], gradient: "coral", logo: "/model-logos/route-minimax.png" },
  { id: "route/minimax-m2.5", name: "MiniMax M2.5", provider: "minimax", description: "Balanced performance and speed", context_length: "200K", input_price: 0.193, output_price: 1.238, tiers: ["free", "lite", "pro", "max"], gradient: "amber", logo: "/model-logos/route-minimax.png" },
  { id: "route/minimax-m2.5-highspeed", name: "MiniMax M2.5 Highspeed", provider: "minimax", description: "Fast inference model", context_length: "200K", input_price: 0.193, output_price: 1.238, tiers: ["pro"], gradient: "purple", logo: "/model-logos/route-minimax.png" },
  { id: "route/kimi-k2.5", name: "Kimi K2.5", provider: "opencode", description: "Long context with excellent reasoning", context_length: "256K", input_price: 0.462, output_price: 2.42, tiers: ["free", "lite", "pro", "max"], gradient: "coral", logo: "/model-logos/route-kimi.png" },
  { id: "route/grok-4-fast", name: "Grok-4 Fast", provider: "xai", description: "Fast xAI model with strong reasoning", context_length: "2000K", input_price: 0.22, output_price: 0.55, tiers: ["pro", "max"], gradient: "purple", logo: "/model-logos/route-xai.png" },
  { id: "route/grok-4.20-beta", name: "Grok-4.20 Beta", provider: "xai", description: "Latest Grok-4 beta with improved reasoning", context_length: "2000K", input_price: 2.20, output_price: 6.60, tiers: ["max"], gradient: "amber", logo: "/model-logos/route-xai.png" },
  { id: "route/nemotron-3-super-120b", name: "Nemotron-3 Super 120B", provider: "openrouter", description: "Powerful 120B parameter model", context_length: "262K", input_price: 0.11, output_price: 0.55, tiers: ["free", "lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-nvidia.svg" },
  { id: "route/glm-4.5-air", name: "GLM-4.5 Air", provider: "zai", description: "Efficient GLM model", context_length: "128K", input_price: 0.143, output_price: 0.935, tiers: ["pro", "max"], gradient: "coral", logo: "/model-logos/route-zai.svg" },
  { id: "route/glm-5", name: "GLM-5", provider: "zai", description: "Latest generation GLM", context_length: "80K", input_price: 0.792, output_price: 2.53, tiers: ["lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-zai.svg" },
  { id: "route/glm-5-turbo", name: "GLM-5 Turbo", provider: "zai", description: "Faster GLM inference", context_length: "200K", input_price: 1.32, output_price: 4.40, tiers: ["pro", "max"], gradient: "amber", logo: "/model-logos/route-zai.svg" },
  { id: "route/deepseek-v3.2", name: "DeepSeek V3.2", provider: "deepseek", description: "Advanced reasoning model", context_length: "163K", input_price: 0.286, output_price: 0.418, tiers: ["pro", "max"], gradient: "coral", logo: "/model-logos/route-deepseek.png" },
  { id: "route/deepseek-r1", name: "DeepSeek R1", provider: "deepseek", description: "Advanced reasoning with chain-of-thought", context_length: "163K", input_price: 0.495, output_price: 2.365, tiers: ["max"], gradient: "amber", logo: "/model-logos/route-deepseek.png" },
  { id: "route/qwen3-coder", name: "Qwen3 Coder", provider: "openrouter", description: "Specialized code generation", context_length: "262K", input_price: 0.242, output_price: 1.10, tiers: ["pro", "max"], gradient: "purple", logo: "/model-logos/route-qwen.png" },
  { id: "route/qwen3-32b", name: "Qwen3 32B", provider: "chutes", description: "Versatile 32B model", context_length: "40K", input_price: 0.088, output_price: 0.264, tiers: ["pro", "max"], gradient: "amber", logo: "/model-logos/route-qwen.png" },
  { id: "route/llama-3.2-3b-instruct", name: "Llama 3.2 3B", provider: "meta", description: "Efficient instruction-tuned model", context_length: "200K", input_price: 0.056, output_price: 0.374, tiers: ["free", "lite", "pro", "max"], gradient: "purple", logo: "/model-logos/route-meta.png" },
  { id: "route/gemma-3-27b-it", name: "Gemma-3 27B", provider: "google", description: "Google's instruct-tuned model", context_length: "131K", input_price: 0.088, output_price: 0.176, tiers: ["free", "lite", "pro", "max"], gradient: "amber", logo: "/model-logos/route-google.svg" },
  { id: "route/mimo-v2-omni", name: "Xiaomi MiMo V2 Omni", provider: "xiaomi", description: "Flagship multimodal model", context_length: "262K", input_price: 0.44, output_price: 2.20, tiers: ["max"], gradient: "purple", logo: "/model-logos/route-xiaomi.png" },
  { id: "route/mimo-v2-pro", name: "Xiaomi MiMo V2 Pro", provider: "xiaomi", description: "Professional multimodal model", context_length: "1048K", input_price: 1.10, output_price: 3.30, tiers: ["max"], gradient: "amber", logo: "/model-logos/route-xiaomi.png" },
];

const tierColors: Record<string, string> = {
  free: "bg-brand-amber/20 text-brand-amber",
  lite: "bg-brand-blue/20 text-brand-blue",
  pro: "bg-brand-coral/20 text-brand-coral",
  max: "bg-brand-purple/20 text-brand-purple",
};

export default function PlaygroundPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model>(allModels[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const userPlan = user?.plan_tier?.toLowerCase() || "free";

  const availableModels = allModels.filter(model => {
    const tierOrder = ["free", "lite", "pro", "max"];
    const userTierIndex = tierOrder.indexOf(userPlan);
    const modelTierIndex = Math.max(...model.tiers.map(t => tierOrder.indexOf(t)));
    return userTierIndex >= modelTierIndex;
  });

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
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && images.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      images: images.length > 0 ? images : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setImages([]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      let chatMessages;
      if (images.length > 0) {
        const contentArray: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
          { type: "text", text: input }
        ];
        images.forEach(img => {
          contentArray.push({ type: "image_url", image_url: { url: img } });
        });
        chatMessages = [
          ...messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: "user" as const,
            content: contentArray,
          },
        ];
      } else {
        chatMessages = [
          ...messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: "user" as const,
            content: input,
          },
        ];
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
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
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
    if (providerLogos[providerKey]) {
      return providerLogos[providerKey];
    }
    return model.logo;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowModelSelect(!showModelSelect)}
              className="gap-2"
            >
              <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-muted">
                {getModelLogo(selectedModel) ? (
                  <img src={getModelLogo(selectedModel)!} alt="" className="w-4 h-4 object-contain" />
                ) : (
                  <span className="text-[8px] font-bold">{selectedModel.name.slice(0, 2)}</span>
                )}
              </div>
              <span className="font-medium">{selectedModel.name}</span>
              <Badge variant="secondary" className={`text-[10px] ${tierColors[selectedModel.tiers[0]]}`}>
                {selectedModel.tiers[0].toUpperCase()}
              </Badge>
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Temp:</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-20 h-1"
              />
              <span className="w-8">{temperature}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Max:</span>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-24 h-1"
              />
              <span className="w-12">{maxTokens}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Chats are not stored
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showModelSelect && (
          <div className="absolute z-50 mt-2 w-[400px] rounded-lg border bg-background shadow-lg">
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {availableModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModelSelect(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors ${
                    model.id === selectedModel.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-muted">
                    {getModelLogo(model) ? (
                      <img src={getModelLogo(model)!} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold">{model.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                  <div className="flex gap-1">
                    {model.tiers.map(tier => (
                      <Badge key={tier} variant="secondary" className={`text-[8px] ${tierColors[tier]}`}>
                        {tier.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Card className="flex-1 m-4 mb-0 border-0 shadow-none bg-transparent">
        <ScrollArea className="h-[calc(100vh-280px)]" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">AI</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Chat with different AI models. Your conversations are not stored and will disappear when you close this page.
                </p>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-brand-purple text-white"
                      : "bg-muted"
                  }`}
                >
                  {typeof message.content === "string" ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="space-y-2">
                      {message.content.map((item, idx) => (
                        <div key={idx}>
                          {item.type === "text" && <p className="text-sm whitespace-pre-wrap">{item.text}</p>}
                          {item.type === "image_url" && item.image_url && (
                            <img src={item.image_url.url} alt="" className="rounded-lg max-w-[300px]" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {message.images && message.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {message.images.map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-brand-amber flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">U</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-coral flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
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
            >
              <ImagePlus className="w-4 h-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && images.length === 0)}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
