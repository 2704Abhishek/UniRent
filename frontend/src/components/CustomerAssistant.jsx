import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const starterMessage = {
  role: "assistant",
  content: "Tell me where you are stuck and I will guide you through the next UniRent step.",
  suggestions: [
    "How do I rent an item?",
    "Suggest available items",
    "My payment is pending",
    "How do I return an item?"
  ],
  actions: [
    { label: "Browse items", path: "/home" },
    { label: "My Rentals", path: "/dashboard" }
  ],
  recommendedItems: []
};

export default function CustomerAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const sendMessage = async (text = input) => {
    const nextMessage = text.trim();
    if (!nextMessage || isLoading) return;

    setMessages((current) => [...current, { role: "user", content: nextMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await api.post("/assistant/message", {
        message: nextMessage,
        page: location.pathname
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
          suggestions: data.suggestions || [],
          actions: data.actions || [],
          recommendedItems: data.recommendedItems || []
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || "I could not reach the assistant right now. Please try again.",
          suggestions: starterMessage.suggestions,
          actions: [{ label: "Open Help", path: "/help" }],
          recommendedItems: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openAction = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section className="flex h-[min(620px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          <header className="flex items-center justify-between border-b border-slate-200 bg-ink px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">UniRent Assistant</p>
              <p className="text-xs text-blue-100">Customer support</p>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-bold text-white transition hover:bg-white/10"
              aria-label="Close assistant"
              onClick={() => setIsOpen(false)}
            >
              x
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant";

              return (
                <div key={`${message.role}-${index}`} className={isAssistant ? "pr-8" : "pl-8"}>
                  <div
                    className={`rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                      isAssistant
                        ? "border border-slate-200 bg-white text-slate-700"
                        : "bg-campus text-white"
                    }`}
                  >
                    {message.content}
                  </div>

                  {isAssistant && message.recommendedItems?.length ? (
                    <div className="mt-2 grid gap-2">
                      {message.recommendedItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="rounded-md border border-blue-100 bg-white p-3 text-left text-sm shadow-sm transition hover:border-campus hover:bg-blue-50"
                          onClick={() => openAction(item.path)}
                        >
                          <span className="block font-semibold text-ink">{item.title}</span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {item.category} - Rs. {item.pricePerDay}/day - Deposit Rs. {item.depositAmount}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {isLoading ? (
              <div className="pr-8">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Thinking...
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {latestAssistantMessage?.actions?.length ? (
            <div className="border-t border-slate-200 bg-white px-4 pt-3">
              <div className="flex flex-wrap gap-2">
                {latestAssistantMessage.actions.map((action) => (
                  <button
                    key={`${action.label}-${action.path}`}
                    type="button"
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-campus"
                    onClick={() => openAction(action.path)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {latestAssistantMessage?.suggestions?.length ? (
            <div className="bg-white px-4 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {latestAssistantMessage.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-campus transition hover:border-campus"
                    onClick={() => sendMessage(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form
            className="flex gap-2 border-t border-slate-200 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              className="field min-w-0 flex-1"
              placeholder="Ask about rentals, payments, returns..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-campus text-lg font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
              aria-label="Send message"
              disabled={isLoading || !input.trim()}
            >
              &gt;
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-campus text-2xl font-bold text-white shadow-soft transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          aria-label="Open UniRent assistant"
          onClick={() => setIsOpen(true)}
        >
          ?
        </button>
      )}
    </div>
  );
}
