import { db } from "@/lib/db";
import { updateEventMinPrice } from "@/lib/update-event-prices";

async function main() {
  console.log("🌱 Seeding database...");

  // Seed categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "music" },
      update: {},
      create: {
        nameAr: "موسيقى",
        nameEn: "Music",
        slug: "music",
        description: "حفلات موسيقية ومهرجانات",
      },
    }),
    db.category.upsert({
      where: { slug: "sports" },
      update: {},
      create: {
        nameAr: "رياضة",
        nameEn: "Sports",
        slug: "sports",
        description: "فعاليات رياضية ومباريات",
      },
    }),
    db.category.upsert({
      where: { slug: "culture" },
      update: {},
      create: {
        nameAr: "ثقافة",
        nameEn: "Culture",
        slug: "culture",
        description: "فعاليات ثقافية ومعارض فنية",
      },
    }),
    db.category.upsert({
      where: { slug: "tech" },
      update: {},
      create: {
        nameAr: "تقنية",
        nameEn: "Technology",
        slug: "tech",
        description: "مؤتمرات تقنية وورش عمل",
      },
    }),
    db.category.upsert({
      where: { slug: "food" },
      update: {},
      create: {
        nameAr: "طعام",
        nameEn: "Food",
        slug: "food",
        description: "مهرجانات طعام وتجارب طهي",
      },
    }),
    db.category.upsert({
      where: { slug: "business" },
      update: {},
      create: {
        nameAr: "أعمال",
        nameEn: "Business",
        slug: "business",
        description: "مؤتمرات أعمال وندوات",
      },
    }),
    db.category.upsert({
      where: { slug: "entertainment" },
      update: {},
      create: {
        nameAr: "ترفيه",
        nameEn: "Entertainment",
        slug: "entertainment",
        description: "فعاليات ترفيهية وعروض",
      },
    }),
    db.category.upsert({
      where: { slug: "education" },
      update: {},
      create: {
        nameAr: "تعليم",
        nameEn: "Education",
        slug: "education",
        description: "ورش عمل ودورات تعليمية",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Seed venues
  const venues = await Promise.all([
    db.venue.upsert({
      where: { slug: "sheikh-jaber-center" },
      update: {},
      create: {
        nameAr: "مركز الشيخ جابر الأحمد الثقافي",
        nameEn: "Sheikh Jaber Al-Ahmad Cultural Centre",
        slug: "sheikh-jaber-center",
        address: "المنطقة الحضرية، الكويت العاصمة",
        city: "الكويت",
        capacity: 2000,
        description: "أحد أبرز المراكز الثقافية في الكويت",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      },
    }),
    db.venue.upsert({
      where: { slug: "kuwait-towers" },
      update: {},
      create: {
        nameAr: "أبراج الكويت",
        nameEn: "Kuwait Towers",
        slug: "kuwait-towers",
        address: "شارع الخليج العربي",
        city: "الكويت",
        capacity: 500,
        description: "معلم الكويت الأشهر — أبراج الكويت على ساحل الخليج العربي",
        imageUrl: "https://images.unsplash.com/photo-1549927681-0b673b8243ab?w=800",
      },
    }),
    db.venue.upsert({
      where: { slug: "al-shaheed-park" },
      update: {},
      create: {
        nameAr: "حديقة الشهيد",
        nameEn: "Al Shaheed Park",
        slug: "al-shaheed-park",
        address: "الشامية",
        city: "الكويت",
        capacity: 5000,
        description: "أكبر حديقة حضرية في الكويت تضم مساحات خضراء ومعارض فنية",
        imageUrl: "https://images.unsplash.com/photo-1565402170291-8491f14678db?w=800",
      },
    }),
  ]);

  console.log(`✅ Created ${venues.length} venues`);

  // Create organizer user for seed events
  const organizer = await db.user.upsert({
    where: { email: "organizer@kuwaitevents.com" },
    update: {},
    create: {
      clerkId: "user_seed_organizer_001",
      email: "organizer@kuwaitevents.com",
      name: "شركة الفعاليات الكويتية",
      role: "ORGANIZER",
      phone: "96599990001",
    },
  });

  console.log(`✅ Created organizer user: ${organizer.name}`);

  // Seed events
  const events = [
    {
      titleAr: "حفلة موسيقى عربية",
      titleEn: "Arabic Music Night",
      slug: "arabic-music-night-2026",
      descriptionAr: "سهرة موسيقية رائعة تضم أبرز الفنانين العرب مع ألحان شرقية أصيلة في أجواء ساحرة.",
      descriptionEn: "An enchanting evening featuring top Arab musicians with authentic oriental melodies.",
      coverImageUrl: "/images/events/arabic-music-night.png",
      galleryUrls: "[]",
      startDate: new Date("2026-07-15"),
      startTime: "20:00",
      endTime: "23:00",
      status: "PUBLISHED",
      isFeatured: true,
      organizerId: organizer.id,
      categoryId: categories[0].id, // music
      venueId: venues[0].id,
      ticketTiers: {
        create: [
          { nameAr: "تذكرة عادية", nameEn: "Standard", type: "STANDARD", price: "15.000", quantityTotal: 200, maxPerBooking: 10 },
          { nameAr: "تذكرة VIP", nameEn: "VIP", type: "VIP", price: "45.000", quantityTotal: 50, maxPerBooking: 4 },
        ],
      },
    },
    {
      titleAr: "مهرجان الطعام الكويتي",
      titleEn: "Kuwait Food Festival",
      slug: "kuwait-food-festival-2026",
      descriptionAr: "مهرجان سنوي يجمع أفضل المطاعم والشيفات الكويتية في مكان واحد مع عروض طبخ حية.",
      descriptionEn: "An annual festival bringing together the best Kuwaiti restaurants and chefs with live cooking shows.",
      coverImageUrl: "/images/events/kuwait-food-festival.png",
      galleryUrls: "[]",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-03"),
      startTime: "17:00",
      endTime: "23:00",
      status: "PUBLISHED",
      isFeatured: true,
      organizerId: organizer.id,
      categoryId: categories[4].id, // food
      venueId: venues[2].id, // al-shaheed-park
      ticketTiers: {
        create: [
          { nameAr: "تذكرة يومية", nameEn: "Day Pass", type: "STANDARD", price: "5.000", quantityTotal: 1000, maxPerBooking: 10 },
          { nameAr: "تذكرة المهرجان الكاملة", nameEn: "Full Festival Pass", type: "GROUP", price: "12.000", quantityTotal: 300, maxPerBooking: 5 },
        ],
      },
    },
    {
      titleAr: "مؤتمر التقنية الكويتي",
      titleEn: "Kuwait Tech Conference",
      slug: "kuwait-tech-conference-2026",
      descriptionAr: "مؤتمر تقني سنوي يضم متحدثين عالميين وورش عمل في الذكاء الاصطناعي والبرمجة.",
      descriptionEn: "Annual tech conference with international speakers and workshops on AI and programming.",
      coverImageUrl: "/images/events/kuwait-tech-conference.png",
      galleryUrls: "[]",
      startDate: new Date("2026-09-10"),
      endDate: new Date("2026-09-11"),
      startTime: "09:00",
      endTime: "18:00",
      status: "PUBLISHED",
      isFeatured: false,
      organizerId: organizer.id,
      categoryId: categories[3].id, // tech
      venueId: venues[0].id,
      ticketTiers: {
        create: [
          { nameAr: "تذكرة مبكرة", nameEn: "Early Bird", type: "EARLY_BIRD", price: "25.000", quantityTotal: 100, maxPerBooking: 2 },
          { nameAr: "تذكرة عادية", nameEn: "Standard", type: "STANDARD", price: "35.000", quantityTotal: 300, maxPerBooking: 5 },
        ],
      },
    },
    {
      titleAr: "بطولة كرة القدم الشاطئية",
      titleEn: "Beach Football Championship",
      slug: "beach-football-2026",
      descriptionAr: "بطولة كرة قدم شاطئية مفتوحة مع فرق من دول الخليج العربي.",
      descriptionEn: "Open beach football championship with teams from the Arabian Gulf countries.",
      coverImageUrl: "/images/events/beach-football.png",
      galleryUrls: "[]",
      startDate: new Date("2026-10-05"),
      startTime: "16:00",
      endTime: "21:00",
      status: "PUBLISHED",
      isFeatured: false,
      organizerId: organizer.id,
      categoryId: categories[1].id, // sports
      venueId: venues[1].id, // kuwait-towers
      ticketTiers: {
        create: [
          { nameAr: "تذكرة عادية", nameEn: "Standard", type: "STANDARD", price: "3.000", quantityTotal: 500, maxPerBooking: 10 },
        ],
      },
    },
    {
      titleAr: "معرض الفنون المعاصرة",
      titleEn: "Contemporary Art Exhibition",
      slug: "contemporary-art-exhibition-2026",
      descriptionAr: "معرض فني يضم أعمالاً لفنانين كويتيين وعرب معاصرة في مجال الرسم والنحت.",
      descriptionEn: "Art exhibition featuring works by contemporary Kuwaiti and Arab artists in painting and sculpture.",
      coverImageUrl: "/images/events/contemporary-art-exhibition.png",
      galleryUrls: "[]",
      startDate: new Date("2026-07-20"),
      endDate: new Date("2026-08-20"),
      startTime: "10:00",
      endTime: "22:00",
      status: "PUBLISHED",
      isFeatured: false,
      organizerId: organizer.id,
      categoryId: categories[2].id, // culture
      venueId: venues[0].id,
      ticketTiers: {
        create: [
          { nameAr: "تذكرة دخول", nameEn: "Entry Ticket", type: "STANDARD", price: "2.000", quantityTotal: 2000, maxPerBooking: 10 },
        ],
      },
    },
    {
      titleAr: "ندوة ريادة الأعمال",
      titleEn: "Entrepreneurship Seminar",
      slug: "entrepreneurship-seminar-2026",
      descriptionAr: "ندوة تفاعلية مع رواد أعمال كويتيين ناجحين يشاركون تجاربهم ونصائحهم.",
      descriptionEn: "Interactive seminar with successful Kuwaiti entrepreneurs sharing their experiences and advice.",
      coverImageUrl: "/images/events/entrepreneurship-seminar.png",
      galleryUrls: "[]",
      startDate: new Date("2026-08-15"),
      startTime: "18:00",
      endTime: "21:00",
      status: "PUBLISHED",
      isFeatured: false,
      organizerId: organizer.id,
      categoryId: categories[5].id, // business
      venueId: venues[1].id, // kuwait-towers
      ticketTiers: {
        create: [
          { nameAr: "تذكرة مجانية", nameEn: "Free Ticket", type: "STANDARD", price: "0.000", quantityTotal: 150, maxPerBooking: 2 },
        ],
      },
    },
  ];

  for (const eventData of events) {
    const { ticketTiers, ...rest } = eventData;
    const event = await db.event.upsert({
      where: { slug: rest.slug },
      update: {},
      create: { ...rest, ticketTiers: { create: ticketTiers.create } },
    });
    // Backfill minPrice for each event
    await updateEventMinPrice(event.id);
  }

  console.log(`✅ Created ${events.length} events with ticket tiers`);

  // Backfill minPrice for any existing events that might not have it
  const allEvents = await db.event.findMany({ select: { id: true } });
  for (const e of allEvents) {
    await updateEventMinPrice(e.id);
  }
  console.log(`✅ Backfilled minPrice for ${allEvents.length} events`);

  console.log("🌱 Seeding completed!");
}

main()
  .catch((e: unknown) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
