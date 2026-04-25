"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Code, 
  Key, 
  Zap, 
  ChevronRight, 
  Copy, 
  Check,
  Globe,
  Terminal,
  MessageSquare,
  Bot,
  Layers,
  Shield,
  AlertCircle
} from "lucide-react";

const sidebarItems = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction", icon: BookOpen },
      { id: "authentication", label: "Authentication", icon: Key },
      { id: "quickstart", label: "Quick Start", icon: Zap },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "openai", label: "OpenAI Compatible", icon: Code },
      { id: "anthropic", label: "Anthropic Compatible", icon: MessageSquare },
      { id: "endpoints", label: "All Endpoints", icon: Layers },
    ],
  },
  {
    title: "Integrations",
    items: [
      { id: "silly-tavern", label: "Silly Tavern", icon: Bot },
      { id: "claude-code", label: "Claude Code", icon: Terminal },
      { id: "opencode", label: "OpenCode", icon: Code },
      { id: "kilotcode", label: "Kilotcode", icon: Code },
    ],
  },
  {
    title: "Guides",
    items: [
      { id: "best-practices", label: "Best Practices", icon: Shield },
      { id: "troubleshooting", label: "Troubleshooting", icon: AlertCircle },
    ],
  },
];

const docContent: Record<string, { title: string; content: React.ReactNode }> = {
  introduction: {
    title: "Introduction",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          routing.run provides a unified API gateway for accessing 30+ LLM models from multiple providers through a single, OpenAI-compatible interface. Our service automatically routes requests to the best available provider with automatic fallback.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
            <Zap className="h-8 w-8 text-indigo-500 mb-3" />
            <h4 className="text-white font-semibold mb-2">30+ Models</h4>
            <p className="text-sm text-gray-400">Access to the latest models from OpenAI, Anthropic, Google, Meta, DeepSeek, and more.</p>
          </div>
          <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
            <Shield className="h-8 w-8 text-emerald-500 mb-3" />
            <h4 className="text-white font-semibold mb-2">99.9% Uptime</h4>
            <p className="text-sm text-gray-400">Automatic failover ensures your applications never go down.</p>
          </div>
          <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
            <Globe className="h-8 w-8 text-violet-500 mb-3" />
            <h4 className="text-white font-semibold mb-2">Global Edge</h4>
            <p className="text-sm text-gray-400">Low latency routing with servers worldwide.</p>
          </div>
        </div>
      </div>
    ),
  },
  authentication: {
    title: "Authentication",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          All API requests require an API key. You can get your API key from the dashboard after signing up.
        </p>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-500" />
            Your API Key
          </h4>
          <div className="bg-neutral-900 rounded-lg p-4 font-mono text-sm text-emerald-400 break-all">
            rk_your_api_key_here
          </div>
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Include in Requests</h4>
          <p className="text-sm text-gray-400 mb-3">Pass your API key in the Authorization header:</p>
          <CodeBlock code="Authorization: Bearer rk_live_your_api_key" />
        </div>
      </div>
    ),
  },
  quickstart: {
    title: "Quick Start",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          Get started with routing.run in under a minute. Here&apos;s a simple example using curl:
        </p>
        <CodeBlock 
          code={`curl https://api.routing.run/v1/chat/completions \\
  -H "Authorization: Bearer rk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "route/minimax-m2.7",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
        />
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Available Models</h4>
          <p className="text-sm text-gray-400 mb-3">Use any of these model IDs in your requests:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-300">route/minimax-m2.7</div>
            <div className="text-gray-300">route/deepseek-v4-pro</div>
            <div className="text-gray-300">route/glm-5</div>
            <div className="text-gray-300">route/qwen3-coder-next</div>
            <div className="text-gray-300">route/grok-4-fast</div>
            <div className="text-gray-300">route/gemma-3-27b-it</div>
          </div>
        </div>
      </div>
    ),
  },
  openai: {
    title: "OpenAI Compatible API",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          Our API is fully compatible with the OpenAI API format. Simply change the base URL to start using it.
        </p>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Base URL</h4>
          <CodeBlock code="https://api.routing.run/v1" />
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Chat Completions</h4>
          <CodeBlock 
            code={`POST /chat/completions

{
  "model": "route/minimax-m2.7",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is LLM routing?"}
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}`}
          />
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Embeddings</h4>
          <CodeBlock 
            code={`POST /embeddings

{
  "model": "route/minimax-m2.5",
  "input": "The quick brown fox jumps over the lazy dog"
}`}
          />
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Model List</h4>
          <CodeBlock code="GET /models" />
        </div>
      </div>
    ),
  },
  anthropic: {
    title: "Anthropic Compatible API",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          We also support the Anthropic API format for Claude models. Use the alternate base URL:
        </p>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Base URL</h4>
          <CodeBlock code="https://api.routing.run/anthropic/v1" />
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Messages (Claude 3.5 Sonnet)</h4>
          <CodeBlock 
            code={`POST /messages

Headers:
  x-api-key: rk_live_your_api_key
  anthropic-version: 2023-06-01
  content-type: application/json

{
  "model": "route/claude-sonnet-4-20250514",
  "messages": [
    {"role": "user", "content": "Hello, Claude!"}
  ],
  "max_tokens": 1024
}`}
          />
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-200">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Note: Claude models route through our Anthropic-compatible endpoint. Model IDs starting with <code className="bg-neutral-800 px-1 rounded">route/claude-</code> use this endpoint.
          </p>
        </div>
      </div>
    ),
  },
  endpoints: {
    title: "All Endpoints",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          Complete list of available endpoints:
        </p>
        <div className="space-y-4">
          {[
            { method: "POST", path: "/v1/chat/completions", desc: "Chat completions (OpenAI format)" },
            { method: "POST", path: "/v1/completions", desc: "Text completions" },
            { method: "POST", path: "/v1/embeddings", desc: "Embeddings generation" },
            { method: "GET", path: "/v1/models", desc: "List available models" },
            { method: "GET", path: "/v1/models/{model}", desc: "Get model info" },
            { method: "POST", path: "/anthropic/v1/messages", desc: "Claude-style messages API" },
          ].map((endpoint) => (
            <div key={endpoint.path} className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700 flex items-center gap-4">
              <span className={cn(
                "px-2 py-1 rounded text-xs font-mono font-bold",
                endpoint.method === "GET" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
              )}>
                {endpoint.method}
              </span>
              <code className="text-gray-300 font-mono text-sm flex-1">{endpoint.path}</code>
              <span className="text-gray-500 text-sm">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  "silly-tavern": {
    title: "Silly Tavern Setup",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          Connect routing.run to Silly Tavern for enhanced roleplay and character chat experiences.
        </p>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Configuration</h4>
          <ol className="space-y-3 text-sm text-gray-300">
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold">1.</span>
              Open Silly Tavern Settings → API
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold">2.</span>
              Set API Type to &quot;OpenAI&quot;
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold">3.</span>
              Set API Base URL to <code className="bg-neutral-800 px-1 rounded">https://api.routing.run/v1</code>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold">4.</span>
              Enter your API key
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold">5.</span>
              Set Model to <code className="bg-neutral-800 px-1 rounded">route/minimax-m2.7</code> or any other model
            </li>
          </ol>
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Recommended Models for Silly Tavern</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-gray-300">route/minimax-m2.7 - Best overall</div>
            <div className="text-gray-300">route/kimi-k2.5 - Great for long context</div>
            <div className="text-gray-300">route/glm-5 - Excellent quality</div>
            <div className="text-gray-300">route/deepseek-v4-pro - 1M context</div>
          </div>
        </div>
      </div>
    ),
  },
  "claude-code": {
    title: "Claude Code Setup",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          Use routing.run with Claude Code by configuring the ANTHROPIC_BASE_URL environment variable.
        </p>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Environment Configuration</h4>
          <CodeBlock 
            code={`# ~/.claude/settings.env
ANTHROPIC_BASE_URL=https://api.routing.run/anthropic/v1
ANTHROPIC_API_KEY=rk_live_your_api_key`}
          />
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Or via command line</h4>
          <CodeBlock 
            code={`ANTHROPIC_BASE_URL=https://api.routing.run/anthropic/v1 \\
ANTHROPIC_API_KEY=rk_live_your_api_key \\
npx @anthropic-ai/claude-code`}
          />
        </div>
      </div>
    ),
  },
  opencode: {
    title: "OpenCode Setup",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          Configure routing.run as the backend for OpenCode.
        </p>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Configuration</h4>
          <CodeBlock 
            code={`# In your opencode config.yaml
provider:
  backend: openai
  openai:
    api_key: rk_live_your_api_key
    base_url: https://api.routing.run/v1
    model: route/minimax-m2.7`}
          />
        </div>
        <p className="text-sm text-gray-400">
          OpenCode will automatically route all LLM requests through routing.run, giving you access to 30+ models.
        </p>
      </div>
    ),
  },
  kilotcode: {
    title: "Kilotcode Setup",
    content: (
      <div className="space-y-6">
        <p className="text-gray-300">
          Connect routing.run to Kilotcode for AI-assisted coding.
        </p>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Configuration</h4>
          <CodeBlock 
            code={`# kilotcode config
{
  "llm": {
    "provider": "openai",
    "apiKey": "rk_live_your_api_key",
    "baseUrl": "https://api.routing.run/v1",
    "model": "route/qwen3-coder-next"
  }
}`}
          />
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Recommended Models for Coding</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-gray-300">route/qwen3-coder-next - Best for code</div>
            <div className="text-gray-300">route/qwen3-coder - Great alternative</div>
            <div className="text-gray-300">route/gpt-oss-120b - Large context</div>
            <div className="text-gray-300">route/glm-5 - Good all-around</div>
          </div>
        </div>
      </div>
    ),
  },
  "best-practices": {
    title: "Best Practices",
    content: (
      <div className="space-y-6">
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Rate Limits</h4>
          <p className="text-sm text-gray-400 mb-3">Each plan has different rate limits. Design your application to handle 429 errors gracefully:</p>
          <CodeBlock 
            code={`// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e.status === 429 && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000);
      }
    }
  }
}`}
          />
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Cost Optimization</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Use the appropriate model for your task</li>
            <li>• Set max_tokens to avoid over-generating</li>
            <li>• Use caching for repeated queries</li>
            <li>• Consider using smaller models for simple tasks</li>
          </ul>
        </div>
      </div>
    ),
  },
  troubleshooting: {
    title: "Troubleshooting",
    content: (
      <div className="space-y-6">
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Common Issues</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-red-400 mb-1">401 Unauthorized</p>
              <p className="text-sm text-gray-400">Check that your API key is correct and active in the dashboard.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-400 mb-1">429 Rate Limited</p>
              <p className="text-sm text-gray-400">Wait and retry with exponential backoff, or upgrade your plan.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-400 mb-1">Model Not Found</p>
              <p className="text-sm text-gray-400">Verify the model ID is correct. Check /v1/models for available models.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-400 mb-1">Context Length Exceeded</p>
              <p className="text-sm text-gray-400">Use a model with larger context or reduce your input size.</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
          <h4 className="text-white font-semibold mb-3">Need Help?</h4>
          <p className="text-sm text-gray-400">
            Contact support at <a href="mailto:support@routing.run" className="text-indigo-400">support@routing.run</a> or join our Discord for community support.
          </p>
        </div>
      </div>
    ),
  },
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-neutral-900 rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-600"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-50 p-2 rounded-lg bg-neutral-800 border border-neutral-700 md:hidden"
      >
        <ChevronRight className={cn("h-5 w-5 text-white transition-transform", sidebarOpen && "rotate-180")} />
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-72 bg-neutral-900/50 border-r border-neutral-800 overflow-y-auto z-40 transition-transform",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Image src="/transparent_white_logo.PNG" alt="routing.run" width={128} height={32} className="h-8 w-auto" />
          </Link>
          
          <nav className="space-y-6">
            {sidebarItems.map((section) => (
              <div key={section.title}>
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h5>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(item.id);
                            setSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                            activeSection === item.id
                              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                              : "text-gray-400 hover:text-white hover:bg-neutral-800"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              {docContent[activeSection]?.title}
            </h1>
            <div className="h-px bg-gradient-to-r from-indigo-500 to-violet-500 mb-8" />
            {docContent[activeSection]?.content}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
