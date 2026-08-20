import { CategoryCircles } from "@/components/CategoryCircles";
import { OfferCard } from "@/components/OfferCard";
import { OfferRail } from "@/components/OfferRail";
import { getActiveOffers, getParentCategories, getSettings } from "@/lib/queries";

export default async function HomePage() {
  const [offers, categories, settings] = await Promise.all([
    getActiveOffers(),
    getParentCategories(),
    getSettings(),
  ]);

  return (
    <div className="space-y-10 pt-5">
      <CategoryCircles categories={categories} />
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              أفضل العروض
            </h1>
            <p className="mt-1 text-sm text-muted">
              {settings.slogan} · عروض بتنتهي بالتايمر
            </p>
          </div>
        </div>
        {offers.length === 0 ? (
          <p className="card-shadow rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">
            مفيش عروض شغالة دلوقتي. العروض بتنزل من لوحة التحكم.
          </p>
        ) : (
          <OfferRail offers={offers} />
        )}
      </section>
      <section>
        <h2 className="mb-4 font-display text-xl font-bold">كل العروض</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>
    </div>
  );
}
