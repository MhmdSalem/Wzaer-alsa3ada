"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export function InvoicePdfButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function downloadPdf() {
    const node = document.getElementById("invoice-print");
    if (!node) {
      setError("تعذر العثور على الفاتورة. أعد فتح الصفحة وحاول تاني.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const canvas = await html2canvas(node, {
        scale: Math.max(2, window.devicePixelRatio || 1),
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      const x = (pageW - imgW) / 2;
      const y = 24;
      pdf.addImage(img, "PNG", x, y, imgW, imgH);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("حصلت مشكلة أثناء توليد الـ PDF. جرّب مرة تانية.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-20 pointer-events-auto">
      <button
        type="button"
        onClick={() => void downloadPdf()}
        onPointerDown={(event) => event.stopPropagation()}
        disabled={loading}
        className="touch-manipulation rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
      >
        {loading ? "جاري تجهيز PDF..." : "تحميل PDF"}
      </button>
      {error ? <p className="mt-1 text-[11px] font-semibold text-red">{error}</p> : null}
    </div>
  );
}
