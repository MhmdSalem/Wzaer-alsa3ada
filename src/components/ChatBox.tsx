"use client";

import { useEffect, useRef, useState } from "react";

type SupportMessage = {
  id: string;
  body: string;
  imageUrl?: string | null;
  fromAdmin: boolean;
  isAuto: boolean;
  createdAt: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  rating: number | null;
  ratingComment: string | null;
  messages: SupportMessage[];
};

export function ChatBox() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState("");
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("استفسار عام");
  const [openingText, setOpeningText] = useState("");
  const [openingImageUrl, setOpeningImageUrl] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const activeTicket = tickets.find((ticket) => ticket.id === activeTicketId) ?? null;
  const openTicket = tickets.find((ticket) => ticket.status === "open") ?? null;
  const shownTicket = activeTicket ?? openTicket;

  async function fetchTickets() {
    try {
      const res = await fetch("/api/v1/support/tickets", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { tickets: SupportTicket[] };
      setTickets(data.tickets);
      setActiveTicketId((prev) => {
        if (prev && data.tickets.some((ticket) => ticket.id === prev)) return prev;
        return data.tickets[0]?.id ?? "";
      });
      setLoaded(true);
    } catch {
      // retry in next poll
    }
  }

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (stop) return;
      await fetchTickets();
    };
    void tick();
    const timer = setInterval(tick, 4000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [shownTicket?.messages.length]);

  async function uploadImage(file: File) {
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/v1/upload", { method: "POST", body });
      if (!res.ok) return null;
      const data = (await res.json()) as { url?: string };
      return data.url ?? null;
    } catch {
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  async function openTicketNow() {
    const firstMessage = openingText.trim();
    if (!firstMessage && !openingImageUrl) return;
    setSending(true);
    try {
      const res = await fetch("/api/v1/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message: firstMessage || "صورة مرفقة" }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { ticket: SupportTicket };
      setTickets((prev) => [data.ticket, ...prev.filter((ticket) => ticket.id !== data.ticket.id)]);
      setActiveTicketId(data.ticket.id);
      setOpeningText("");
      if (openingImageUrl) {
        await fetch(`/api/v1/support/tickets/${data.ticket.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: openingImageUrl }),
        });
        setOpeningImageUrl(null);
        await fetchTickets();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  async function send() {
    if (!shownTicket || shownTicket.status !== "open") return;
    const message = text.trim();
    if (!message || sending || uploadingImage) return;
    setSending(true);
    setText("");
    try {
      const res = await fetch(`/api/v1/support/tickets/${shownTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) await fetchTickets();
    } finally {
      setSending(false);
    }
  }

  async function submitRating() {
    if (!shownTicket || !rating) return;
    setSending(true);
    try {
      const res = await fetch(`/api/v1/support/tickets/${shownTicket.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: ratingComment }),
      });
      if (res.ok) {
        setRating(0);
        setRatingComment("");
        await fetchTickets();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card-shadow overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="border-b border-line bg-brand px-5 py-3.5 text-white">
        <h2 className="text-sm font-bold">مساعد الدعم الذكي</h2>
        <p className="text-[11px] text-white/80">شات كتذاكر — متابعة لحد حل المشكلة</p>
      </div>

      {!loaded ? (
        <div className="p-6 text-center text-xs text-muted">بنحمّل التذاكر...</div>
      ) : (
        <div className="grid gap-3 p-3 md:grid-cols-[180px_1fr]">
          <aside className="space-y-2 rounded-2xl border border-line bg-bg p-2">
            <button
              type="button"
              onClick={() => setActiveTicketId(openTicket?.id ?? tickets[0]?.id ?? "")}
              className="w-full rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white"
            >
              التذكرة الحالية
            </button>
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setActiveTicketId(ticket.id)}
                  className={`w-full rounded-xl px-2 py-2 text-right text-[11px] transition-colors ${
                    activeTicketId === ticket.id ? "bg-brand-soft text-brand" : "hover:bg-surface"
                  }`}
                >
                  <p className="font-bold">{ticket.subject}</p>
                  <p className="text-muted">{ticket.status === "open" ? "مفتوحة" : "مقفولة"}</p>
                </button>
              ))}
            </div>
          </aside>

          {!shownTicket ? (
            <div className="space-y-3 rounded-2xl border border-dashed border-line bg-bg p-4">
              <p className="text-xs font-semibold text-muted">
                اختر نوع المشكلة واكتب رسالتك. هيتفتح تذكرة ويترد عليك فورًا.
              </p>
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand"
              >
                <option>استفسار عام</option>
                <option>مشكلة في الطلب</option>
                <option>تأخير في التوصيل</option>
                <option>مشكلة في الدفع</option>
                <option>اقتراح تطوير</option>
              </select>
              <textarea
                value={openingText}
                onChange={(event) => setOpeningText(event.target.value)}
                rows={3}
                placeholder="اكتب مشكلتك..."
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              {openingImageUrl ? (
                <img src={openingImageUrl} alt="صورة مرفقة" className="h-28 w-28 rounded-xl border border-line object-cover" />
              ) : null}
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-bold text-brand">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h4l2-2h4l2 2h4v11H4z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                {uploadingImage ? "بيرفع الصورة..." : "تصوير/رفع صورة الطلب"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setOpeningImageUrl(url);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => void openTicketNow()}
                disabled={sending || uploadingImage || (!openingText.trim() && !openingImageUrl)}
                className="h-11 rounded-full bg-brand px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                فتح تذكرة جديدة
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center justify-between border-b border-line bg-bg px-4 py-2.5">
                <p className="text-xs font-bold">
                  {shownTicket.subject} · #{shownTicket.id.slice(-6)}
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    shownTicket.status === "open" ? "bg-blue-50 text-blue-700" : "bg-green/10 text-green"
                  }`}
                >
                  {shownTicket.status === "open" ? "مفتوحة" : "مقفولة"}
                </span>
              </div>

              <div ref={listRef} className="h-64 space-y-2 overflow-y-auto p-4">
                {shownTicket.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.fromAdmin ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-6 ${
                        message.fromAdmin
                          ? "rounded-tr-sm bg-bg text-text"
                          : "rounded-tl-sm bg-brand text-white"
                      }`}
                    >
                      {message.fromAdmin ? (
                        <p className="mb-0.5 text-[10px] font-bold text-brand">
                          {message.isAuto ? "بوت الدعم" : "موظف الدعم"}
                        </p>
                      ) : null}
                      {message.body}
                      {message.imageUrl ? (
                        <a href={message.imageUrl} target="_blank" rel="noreferrer">
                          <img src={message.imageUrl} alt="صورة الطلب" className="mt-2 h-36 w-36 rounded-xl border border-line object-cover" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {shownTicket.status === "open" ? (
                <div className="flex items-center gap-2 border-t border-line p-3">
                  <label className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-line bg-bg text-brand">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h4l2-2h4l2 2h4v11H4z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file || !shownTicket) return;
                        const url = await uploadImage(file);
                        if (!url) return;
                        setSending(true);
                        try {
                          await fetch(`/api/v1/support/tickets/${shownTicket.id}/messages`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ imageUrl: url }),
                          });
                          await fetchTickets();
                        } finally {
                          setSending(false);
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void send();
                    }}
                    placeholder="اكتب رسالتك..."
                    className="h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={sending || uploadingImage || !text.trim()}
                    className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-deep disabled:opacity-40"
                    aria-label="إرسال"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                    </svg>
                  </button>
                </div>
              ) : shownTicket.rating ? (
                <p className="border-t border-line p-3 text-xs font-semibold text-green">
                  شكراً لتقييمك: {shownTicket.rating}/5
                </p>
              ) : (
                <div className="space-y-3 border-t border-line p-3">
                  <p className="text-xs font-bold text-muted">قيّم تجربتك مع الدعم بعد قفل التذكرة</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={`h-9 w-9 rounded-full text-sm font-bold ${
                          n <= rating ? "bg-yellow text-bg" : "bg-bg text-muted"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <input
                    value={ratingComment}
                    onChange={(event) => setRatingComment(event.target.value)}
                    placeholder="تعليقك (اختياري)"
                    className="h-10 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => void submitRating()}
                    disabled={!rating || sending}
                    className="h-10 rounded-full bg-green px-5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    إرسال التقييم
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
