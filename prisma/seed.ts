import { prisma } from "../src/lib/prisma";

const hours = (n: number) => new Date(Date.now() + n * 60 * 60 * 1000);

async function main() {
  await prisma.offer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.media.deleteMany();
  await prisma.setting.deleteMany();

  await prisma.setting.create({
    data: {
      id: "main",
      storeName: "وزير السعادة",
      slogan: "حلاوته زيادة",
      phone: "+201025701015",
      whatsapp: "201025701015",
      city: "فاقوس",
      governorate: "الشرقية",
      country: "مصر",
      deliveryMinutes: 30,
      logoUrl: "/brand/logo-cart.png",
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "admin@wazir.local" },
    update: {},
    create: {
      name: "أيمن",
      email: "admin@wazir.local",
      password: "saada2026",
      role: "owner",
    },
  });

  await prisma.driver.upsert({
    where: { phone: "01000000001" },
    update: {},
    create: {
      name: "كابتن محمد",
      phone: "01000000001",
      password: "123456",
    },
  });

  const cats = [
    { id: "dairy", name: "ألبان وبيض", slug: "dairy", image: "/products/almarai-milk.png", sortOrder: 1 },
    { id: "bakery", name: "مخبوزات", slug: "bakery", image: "/products/bread.png", sortOrder: 2 },
    { id: "produce", name: "خضار وفواكه", slug: "produce", image: "/products/apples.png", sortOrder: 3 },
    { id: "drinks", name: "مشروبات", slug: "drinks", image: "/products/orange-juice.png", sortOrder: 4 },
    { id: "snacks", name: "سناكات وحلويات", slug: "snacks", image: "/products/chips-bag.png", sortOrder: 5 },
    { id: "pantry", name: "معلبات وزيوت", slug: "pantry", image: "/products/olive-oil.png", sortOrder: 6 },
    { id: "cleaning", name: "منظفات", slug: "cleaning", image: "/products/detergent.png", sortOrder: 7 },
    { id: "beauty", name: "جمال", slug: "beauty", image: "/products/shampoo.png", sortOrder: 8 },
    { id: "baby", name: "أطفال", slug: "baby", image: "/products/diapers.png", sortOrder: 9 },
  ];

  for (const cat of cats) {
    await prisma.category.create({ data: cat });
  }

  const subs = [
    { id: "milk", name: "حليب", slug: "milk", image: "/products/almarai-milk.png", parentId: "dairy", sortOrder: 1 },
    { id: "cheese", name: "جبن", slug: "cheese", image: "/products/salim-cheddar.png", parentId: "dairy", sortOrder: 2 },
    { id: "eggs", name: "بيض", slug: "eggs", image: "/products/eggs.png", parentId: "dairy", sortOrder: 3 },
    { id: "chocolate", name: "شوكولاتة", slug: "chocolate", image: "/products/milka-caramel.png", parentId: "snacks", sortOrder: 1 },
    { id: "chips", name: "شيبس", slug: "chips", image: "/products/chips-bag.png", parentId: "snacks", sortOrder: 2 },
    { id: "spreads", name: "حلاوة وسبريد", slug: "spreads", image: "/products/sweetella.png", parentId: "snacks", sortOrder: 3 },
  ];

  for (const cat of subs) {
    await prisma.category.create({ data: cat });
  }

  const products = [
    { id: "p-cupcakes", name: "كب كيك لوزين كراميل", brand: "L'usine", unit: "علبة 18 قطعة", image: "/products/lusine-cupcakes.png", price: 160, categoryId: "bakery", featured: true },
    { id: "p-cheddar-l", name: "شيدر سالم السعودي", brand: "سالم", unit: "340 جم", image: "/products/salim-cheddar.png", price: 110, categoryId: "cheese", featured: true },
    { id: "p-cheddar-s", name: "شيدر سالم السعودي", brand: "سالم", unit: "113 جم", image: "/products/salim-cheddar.png", price: 45, categoryId: "cheese", featured: false },
    { id: "p-sweetella", name: "سويتلا كريمة بندق", brand: "Sweetella", unit: "200 جم", image: "/products/sweetella.png", price: 35, categoryId: "spreads", featured: true },
    { id: "p-milka", name: "ميلكا كراميل كريم", brand: "Milka", unit: "50 جم", image: "/products/milka-caramel.png", price: 45, categoryId: "chocolate", featured: true },
    { id: "p-milk", name: "حليب المراعي كامل الدسم", brand: "المراعي", unit: "1 لتر", image: "/products/almarai-milk.png", price: 52, categoryId: "milk", featured: true },
    { id: "p-chips", name: "شيبس ميدان", brand: "ميدان", unit: "كيس", image: "/products/chips-bag.png", price: 30, categoryId: "chips", featured: true },
    { id: "p-arya", name: "حليب أريا كامل الدسم", brand: "Arya", unit: "200 مل", image: "/products/arya-milk.png", price: 17, categoryId: "milk", featured: true },
    { id: "p-condensed", name: "حليب مكثف محلى المراعي", brand: "المراعي", unit: "400 جم", image: "/products/condensed-milk.png", price: 130, categoryId: "pantry", featured: true },
    { id: "p-eggs", name: "بيض بلدي", brand: "مزرعة السعادة", unit: "30 حبة", image: "/products/eggs.png", price: 95, categoryId: "eggs", featured: false },
    { id: "p-bread", name: "عيش بلدي طازج", brand: "فرن فاقوس", unit: "5 أرغفة", image: "/products/bread.png", price: 7.5, categoryId: "bakery", featured: false },
    { id: "p-apples", name: "تفاح أحمر", brand: "سوق فاقوس", unit: "1 كجم", image: "/products/apples.png", price: 48, categoryId: "produce", featured: false },
    { id: "p-detergent", name: "سائل جلي بالليمون", brand: "نظافة البيت", unit: "1 لتر", image: "/products/detergent.png", price: 32, categoryId: "cleaning", featured: false },
    { id: "p-oil", name: "زيت زيتون بكر", brand: "خير الأرض", unit: "500 مل", image: "/products/olive-oil.png", price: 95, categoryId: "pantry", featured: false },
    { id: "p-shampoo", name: "شامبو عناية يومية", brand: "لمسة", unit: "400 مل", image: "/products/shampoo.png", price: 55, categoryId: "beauty", featured: false },
    { id: "p-diapers", name: "حفاضات أطفال", brand: "سعادة صغيرة", unit: "مقاس 4 · 40 قطعة", image: "/products/diapers.png", price: 145, categoryId: "baby", featured: false },
    { id: "p-juice", name: "عصير برتقال", brand: "طازج فاقوس", unit: "1.5 لتر", image: "/products/orange-juice.png", price: 28, categoryId: "drinks", featured: false },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const start = new Date();
  const offers = [
    { productId: "p-cupcakes", priceBefore: 160, priceAfter: 88, startsAt: start, endsAt: hours(72), sortOrder: 1 },
    { productId: "p-cheddar-l", priceBefore: 110, priceAfter: 79.9, startsAt: start, endsAt: hours(72), sortOrder: 2 },
    { productId: "p-cheddar-s", priceBefore: 45, priceAfter: 24.9, startsAt: start, endsAt: hours(48), sortOrder: 3 },
    { productId: "p-sweetella", priceBefore: 35, priceAfter: 19, bundleQty: 5, bundleBefore: 240, bundlePrice: 99, startsAt: start, endsAt: hours(72), sortOrder: 4 },
    { productId: "p-milka", priceBefore: 45, priceAfter: 24, bundleQty: 4, bundleBefore: 180, bundlePrice: 99, startsAt: start, endsAt: hours(72), sortOrder: 5 },
    { productId: "p-milk", priceBefore: 52, priceAfter: 44.9, startsAt: start, endsAt: hours(48), sortOrder: 6 },
    { productId: "p-chips", priceBefore: 120, priceAfter: 49, bundleQty: 4, bundleBefore: 120, bundlePrice: 49, startsAt: start, endsAt: hours(72), sortOrder: 7 },
    { productId: "p-arya", priceBefore: 17, priceAfter: 10, startsAt: start, endsAt: hours(36), sortOrder: 8 },
    { productId: "p-condensed", priceBefore: 130, priceAfter: 55, startsAt: start, endsAt: hours(72), sortOrder: 9 },
  ];

  for (const offer of offers) {
    await prisma.offer.create({ data: { ...offer, published: true } });
  }

  const mediaFiles = [
    "/brand/logo-balloons.png",
    "/brand/logo-cart.png",
    "/brand/logo-ayman.png",
    ...products.map((p) => p.image),
  ];
  for (const url of Array.from(new Set(mediaFiles))) {
    await prisma.media.create({
      data: { url, name: url.split("/").pop() ?? url },
    });
  }
}

main()
  .then(async () => {
    console.log("seeded");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
