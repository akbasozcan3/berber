import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").notNull(),
});

export const barbers = sqliteTable("barbers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  position: text("position").notNull(),
  avatar: text("avatar"),
  specialty: text("specialty"),
  workingDays: text("working_days").notNull().default("1,2,3,4,5,6"),
  workingStart: text("working_start").notNull().default("09:00"),
  workingEnd: text("working_end").notNull().default("22:00"),
  onVacation: integer("on_vacation", { mode: "boolean" }).notNull().default(false),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  performance: integer("performance").notNull().default(95),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  price: real("price").notNull(),
  image: text("image"),
  popular: integer("popular", { mode: "boolean" }).notNull().default(false),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const barberServices = sqliteTable("barber_services", {
  barberId: integer("barber_id").notNull().references(() => barbers.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  visitCount: integer("visit_count").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  lastVisit: text("last_visit"),
  favoriteBarberId: integer("favorite_barber_id"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  barberId: integer("barber_id").references(() => barbers.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(),
  price: real("price").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  rating: integer("rating").notNull(),
  review: text("review").notNull(),
  source: text("source").notNull().default("website"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  replied: integer("replied", { mode: "boolean" }).notNull().default(false),
  reply: text("reply"),
  createdAt: text("created_at").notNull(),
});

export const galleryImages = sqliteTable("gallery_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const telegramLogs = sqliteTable("telegram_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appointmentId: integer("appointment_id"),
  chatId: text("chat_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(),
  response: text("response"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const availabilityBlocks = sqliteTable("availability_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by"),
  createdAt: text("created_at").notNull(),
});

export const availabilityAuditLog = sqliteTable("availability_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminName: text("admin_name").notNull(),
  action: text("action").notNull(),
  previousState: text("previous_state"),
  newState: text("new_state"),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
});

export const heroSlides = sqliteTable("hero_slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  badge: text("badge"),
  ctaText: text("cta_text").notNull().default("Hemen Randevu Al"),
  ctaLink: text("cta_link").notNull().default("/randevu"),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const pageContent = sqliteTable("page_content", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  heroImage: text("hero_image"),
  content: text("content").notNull(),
  sections: text("sections"),
  meta: text("meta"),
  updatedAt: text("updated_at").notNull(),
});
