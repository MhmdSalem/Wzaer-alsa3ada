import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { closeTicket, reopenTicket, sendAdminReply } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChatsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; q?: string; status?: string }>;
}) {
  const { t, q = "", status = "all" } = await searchParams;
  const query = q.trim();

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(status === "open" ? { status: "open" } : {}),
      ...(status === "closed" ? { status: "closed" } : {}),
      ...(query
        ? {
            OR: [
              { id: { contains: query } },
              { subject: { contains: query } },
              { customer: { name: { contains: query } } },
              { customer: { phone: { contains: query } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 80,
  });

  const unreadRows = await prisma.supportMessage.groupBy({
    by: ["ticketId"],
    where: { fromAdmin: false, readByAdmin: false },
    _count: { id: true },
  });
  const unreadMap = new Map(unreadRows.map((row) => [row.ticketId, row._count.id]));

  const activeTicket = t && tickets.some((ticket) => ticket.id === t) ? tickets.find((ticket) => ticket.id === t) : tickets[0];

  if (activeTicket) {
    await prisma.supportMessage.updateMany({
      where: { ticketId: activeTicket.id, fromAdmin: false, readByAdmin: false },
      data: { readByAdmin: true },
    });
  }

  const statusCountOpen = tickets.filter((ticket) => ticket.status === "open").length;
  const statusCountClosed = tickets.filter((ticket) => ticket.status === "closed").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">المحادثات</h1>
        <p className="mt-1 text-sm text-muted">
          شات الدعم كتذاكر: فتح، متابعة، ثم قفل التذكرة بعد حل المشكلة.
        </p>
      </div>

      <form className="card-shadow flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-3">
        <input
          name="q"
          defaultValue={query}
          placeholder="بحث برقم التذكرة، اسم العميل، الموبايل، أو الموضوع..."
          className="h-11 min-w-56 flex-1 rounded-xl border border-line bg-bg px-3.5 text-sm outline-none transition-colors focus:border-brand"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border border-line bg-bg px-3.5 text-sm outline-none transition-colors focus:border-brand"
        >
          <option value="all">الكل</option>
          <option value="open">مفتوحة</option>
          <option value="closed">مقفولة</option>
        </select>
        <button className="h-11 rounded-full bg-brand px-5 text-xs font-bold text-white">تطبيق الفلاتر</button>
        <Link
          href="/admin/chats"
          className="h-11 rounded-full border border-line px-5 text-xs font-bold text-muted inline-flex items-center"
        >
          مسح
        </Link>
      </form>

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-brand-soft px-3 py-1 text-brand">إجمالي: {tickets.length}</span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">مفتوحة: {statusCountOpen}</span>
        <span className="rounded-full bg-green/10 px-3 py-1 text-green">مقفولة: {statusCountClosed}</span>
      </div>

      <div className="card-shadow grid overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[280px_1fr]">
        <aside className="border-b border-line md:border-b-0 md:border-l">
          {tickets.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">مفيش تذاكر مطابقة.</p>
          ) : (
            <ul className="divide-y divide-line">
              {tickets.map((ticket) => {
                const unread = unreadMap.get(ticket.id) ?? 0;
                return (
                <li key={ticket.id}>
                  <a
                    href={`/admin/chats?t=${ticket.id}${query ? `&q=${encodeURIComponent(query)}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                      activeTicket?.id === ticket.id ? "bg-brand-soft" : "hover:bg-bg"
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                      {ticket.customer.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{ticket.customer.name}</p>
                      <p className="truncate text-[11px] text-muted">{ticket.subject}</p>
                      <p className="text-[10px] text-muted" dir="ltr">{ticket.customer.phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ticket.status === "open" ? "bg-blue-50 text-blue-700" : "bg-green/10 text-green"}`}>
                        {ticket.status === "open" ? "مفتوحة" : "مقفولة"}
                      </span>
                    {unread ? (
                      <span className="grid h-6 min-w-6 place-items-center rounded-full bg-red px-1.5 text-[11px] font-bold text-white">
                        {unread}
                      </span>
                    ) : null}
                    </div>
                  </a>
                </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="flex min-h-[60vh] flex-col">
          {activeTicket ? (
            <>
              <div className="border-b border-line px-5 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{activeTicket.customer.name}</p>
                    <p className="text-[11px] text-muted" dir="ltr">{activeTicket.customer.phone}</p>
                    <p className="mt-0.5 text-[11px] text-muted">#{activeTicket.id} · {activeTicket.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTicket.status === "open" ? (
                      <form action={closeTicket}>
                        <input type="hidden" name="ticketId" value={activeTicket.id} />
                        <button className="rounded-full bg-green px-4 py-2 text-xs font-bold text-white">قفل التذكرة</button>
                      </form>
                    ) : (
                      <form action={reopenTicket}>
                        <input type="hidden" name="ticketId" value={activeTicket.id} />
                        <button className="rounded-full border border-line px-4 py-2 text-xs font-bold text-muted">إعادة فتح</button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {activeTicket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.fromAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-6 ${
                        message.fromAdmin
                          ? "rounded-tl-sm bg-brand text-white"
                          : "rounded-tr-sm bg-bg text-text"
                      }`}
                    >
                      {message.isAuto ? (
                        <p className="mb-1 text-[10px] font-bold text-yellow-100">رد آلي</p>
                      ) : null}
                      {message.body}
                      {message.imageUrl ? (
                        <a href={message.imageUrl} target="_blank" rel="noreferrer">
                          <img src={message.imageUrl} alt="صورة من العميل" className="mt-2 h-36 w-36 rounded-xl border border-line object-cover" />
                        </a>
                      ) : null}
                      <span className={`mt-1 block text-[10px] ${message.fromAdmin ? "text-white/70" : "text-muted"}`}>
                        {message.createdAt.toLocaleString("ar-EG", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {activeTicket.status === "open" ? (
                <form action={sendAdminReply} className="flex items-center gap-2 border-t border-line p-3">
                  <input type="hidden" name="ticketId" value={activeTicket.id} />
                  <input
                    name="body"
                    required
                    placeholder="اكتب ردك للعميل..."
                    className="h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand"
                  />
                  <button className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-deep" aria-label="إرسال">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                    </svg>
                  </button>
                </form>
              ) : (
                <div className="border-t border-line px-4 py-3 text-xs">
                  {activeTicket.rating ? (
                    <p className="font-semibold text-green">
                      تقييم العميل بعد القفل: {activeTicket.rating}/5
                      {activeTicket.ratingComment ? ` — ${activeTicket.ratingComment}` : ""}
                    </p>
                  ) : (
                    <p className="text-muted">التذكرة مقفولة ومفيش تقييم من العميل لسه.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="grid flex-1 place-items-center p-10 text-sm text-muted">
              اختار تذكرة من القائمة.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
