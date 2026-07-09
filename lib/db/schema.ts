import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  doublePrecision,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").notNull(),
});

export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  position: text("position").notNull(),
  avatar: text("avatar"),
  specialty: text("specialty"),
  workingDays: text("working_days").notNull().default("1,2,3,4,5,6"),
  workingStart: text("working_start").notNull().default("09:00"),
  workingEnd: text("working_end").notNull().default("22:00"),
  onVacation: boolean("on_vacation").notNull().default(false),
  available: boolean("available").notNull().default(true),
  performance: integer("performance").notNull().default(95),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  price: doublePrecision("price").notNull(),
  image: text("image"),
  popular: boolean("popular").notNull().default(false),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const barberServices = pgTable(
  "barber_services",
  {
    barberId: integer("barber_id").notNull().references(() => barbers.id),
    serviceId: integer("service_id").notNull().references(() => services.id),
  },
  (t) => ({
    pk: primaryKey(t.barberId, t.serviceId),
  })
);

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  visitCount: integer("visit_count").notNull().default(0),
  totalSpent: doublePrecision("total_spent").notNull().default(0),
  lastVisit: text("last_visit"),
  favoriteBarberId: integer("favorite_barber_id"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  barberId: integer("barber_id").references(() => barbers.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(),
  price: doublePrecision("price").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  rating: integer("rating").notNull(),
  review: text("review").notNull(),
  source: text("source").notNull().default("website"),
  featured: boolean("featured").notNull().default(false),
  approved: boolean("approved").notNull().default(false),
  replied: boolean("replied").notNull().default(false),
  reply: text("reply"),
  createdAt: text("created_at").notNull(),
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  mediaType: text("media_type").notNull().default("image"),
  instagramUrl: text("instagram_url"),
  coverUrl: text("cover_url"),
  isVideo: boolean("is_video").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"),
  read: boolean("read").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const telegramLogs = pgTable("telegram_logs", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id"),
  chatId: text("chat_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(),
  response: text("response"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const availabilityBlocks = pgTable("availability_blocks", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  endDate: text("end_date"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  ruleType: text("rule_type").notNull().default("block"),
  customOpen: text("custom_open"),
  customClose: text("custom_close"),
  scope: text("scope"),
  reason: text("reason").notNull().default("Müsait değil"),
  barberId: integer("barber_id"),
  active: boolean("active").notNull().default(true),
  createdBy: text("created_by"),
  createdAt: text("created_at").notNull(),
});

export const availabilityAuditLog = pgTable("availability_audit_log", {
  id: serial("id").primaryKey(),
  adminName: text("admin_name").notNull(),
  action: text("action").notNull(),
  previousState: text("previous_state"),
  newState: text("new_state"),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
});

export const heroSlides = pgTable("hero_slides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  badge: text("badge"),
  ctaText: text("cta_text").notNull().default("Hemen Randevu Al"),
  ctaLink: text("cta_link").notNull().default("/randevu"),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const pageContent = pgTable("page_content", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  heroImage: text("hero_image"),
  content: text("content").notNull(),
  sections: text("sections"),
  meta: text("meta"),
  updatedAt: text("updated_at").notNull(),
});
