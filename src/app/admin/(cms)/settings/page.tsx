import { getSettings } from "@/lib/queries";
import { saveSettings } from "../../actions";
import { ImageField } from "../../_components/ImageField";

const input =
  "mt-1.5 h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand";

export default async function SettingsAdmin() {
  const settings = await getSettings();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">إعدادات المحل</h1>
        <p className="mt-1 text-sm text-muted">بيانات المتجر الظاهرة للعملاء.</p>
      </div>
      <form action={saveSettings} className="card-shadow max-w-2xl space-y-4 rounded-2xl border border-line bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            اسم المحل
            <input name="storeName" defaultValue={settings.storeName} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            الشعار النصي
            <input name="slogan" defaultValue={settings.slogan} className={input} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            الموبايل
            <input name="phone" defaultValue={settings.phone} className={input} dir="ltr" />
          </label>
          <label className="block text-sm font-semibold">
            واتساب
            <input name="whatsapp" defaultValue={settings.whatsapp} className={input} dir="ltr" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold">
            المدينة
            <input name="city" defaultValue={settings.city} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            المحافظة
            <input name="governorate" defaultValue={settings.governorate} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            الدولة
            <input name="country" defaultValue={settings.country} className={input} />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          دقائق التوصيل المتوقعة
          <input name="deliveryMinutes" type="number" defaultValue={settings.deliveryMinutes} className={input} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            خط العرض للمتجر
            <input name="storeLat" type="number" step="0.000001" defaultValue={settings.storeLat} className={input} dir="ltr" />
          </label>
          <label className="block text-sm font-semibold">
            خط الطول للمتجر
            <input name="storeLng" type="number" step="0.000001" defaultValue={settings.storeLng} className={input} dir="ltr" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold">
            رسم توصيل أساسي
            <input name="deliveryBaseFee" type="number" step="0.01" defaultValue={settings.deliveryBaseFee} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            سعر الكيلومتر
            <input name="deliveryPerKm" type="number" step="0.01" defaultValue={settings.deliveryPerKm} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            شحن مجاني من
            <input name="freeDeliveryAbove" type="number" step="0.01" defaultValue={settings.freeDeliveryAbove} className={input} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            رقم فودافون كاش (للتحويل)
            <input name="vodafoneCash" defaultValue={settings.vodafoneCash} className={input} dir="ltr" placeholder="010xxxxxxxx" />
          </label>
          <label className="block text-sm font-semibold">
            حساب إنستاباي
            <input name="instapay" defaultValue={settings.instapay} className={input} dir="ltr" placeholder="username@instapay" />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          الرد الآلي لشات الدعم
          <textarea
            name="chatAutoReply"
            defaultValue={settings.chatAutoReply}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
            placeholder="رسالة تلقائية تصل للعميل بعد فتح التذكرة"
          />
        </label>
        <div>
          <p className="mb-1.5 text-sm font-semibold">لوجو المحل</p>
          <ImageField name="logoUrl" defaultValue={settings.logoUrl} />
        </div>
        <button className="h-12 rounded-full bg-brand px-8 font-bold text-white transition-colors hover:bg-brand-deep">
          حفظ الإعدادات
        </button>
      </form>
    </div>
  );
}
