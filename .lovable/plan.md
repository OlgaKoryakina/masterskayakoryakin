# Мастерская Корякиных — план реализации

Сайт-витрина ручных кожаных ремней и латунных пряжек в стилистике dark artisan luxury. Без онлайн-оплаты: корзина = форма заявки. Лёгкая админка для товаров и заявок.

## Стек

- Frontend: React + Vite + TailwindCSS + Framer Motion (стек Lovable; функционально эквивалентно ТЗ Next.js)
- Backend: Lovable Cloud (Supabase под капотом) — БД, Storage для фото, Auth для админа, RLS
- Роутинг: react-router
- SEO: react-helmet-async, sitemap, OpenGraph, JSON-LD Product/Organization
- Изображения: WebP, lazy-loading, responsive `srcset`

## Дизайн-система

- Палитра: графит `#0E0E10`, уголь `#1A1A1D`, патинированная латунь `#A9874A`, тёплый серый `#8A8378`, индиго-акцент `#2D3A55`, кость `#EAE5DC`
- Типографика: serif (Cormorant Garamond / Playfair) для заголовков, sans (Inter) для UI
- Тёмный фон по умолчанию, много воздуха, медленные fade/parallax, hover-zoom на карточках
- Все токены в `index.css` + `tailwind.config.ts` (HSL-переменные)

## Структура страниц (роуты)

```
/                       Главная (hero видео/фото, философия, избранное, процесс, кастом, отзывы, CTA)
/catalog                Каталог ремней (фильтры)
/buckles                Каталог пряжек
/product/:slug          Карточка товара
/custom                 Индивидуальный заказ (форма с референсами)
/about                  О мастерской
/shipping               Доставка и оплата
/faq                    FAQ
/contacts               Контакты
/cart                   Корзина / заявка
/privacy                Политика конфиденциальности
/offer                  Публичная оферта
/auth                   Вход для админа
/admin                  Дашборд (заявки)
/admin/products         CRUD товаров
/admin/requests         Заявки
/admin/content          Редактирование текстов (главная, FAQ, доставка)
```

## Глобальные компоненты

- **Header**: лого-монограмма «МК» слева; nav (Каталог, Пряжки, Кастом, О мастерской, Контакты); справа корзина (с бейджем) и кнопка «Оставить заявку». На главной — прозрачный поверх hero, темнеет при скролле. Мобайл — бургер с полноэкранным меню и stagger-анимацией.
- **Footer**: лого, навигация, соцсети (IG/TG/WA), контакты, ссылки на политику и оферту, копирайт.
- **CartDrawer / context**: localStorage, синхронизация с серверной заявкой при отправке.
- **SEOHead**: title, description, OG, canonical, JSON-LD на товарах.

## Главная — секции

1. Hero — фуллскрин видео/фото (texture/металл), заголовок serif, подзаголовок, CTA «Смотреть коллекцию»
2. Философия — манифест-цитата
3. Избранные изделия — асимметричная сетка 4–6 карточек
4. Процесс — горизонтальный scroll-таймлайн (эскиз → резка → тиснение → металл → полировка → готовое)
5. Индивидуальный заказ — крупный блок + CTA «Обсудить проект»
6. Отзывы — цитаты + макро-фото деталей
7. Финальный CTA — «Изделия, которые стареют красиво»

## Каталог

- Фильтры (sidebar на desktop, bottom-sheet на mobile): тип, цвет кожи, ширина, стиль, наличие, гравировка, кастом
- Карточки крупные, hover: zoom + смена кадра
- Пагинация / infinite scroll

## Карточка товара

- Галерея fullscreen с macro-кадрами
- Название (serif), краткое описание, «характер изделия» (теги: «грубая ковка», «патинированная латунь», «ручное тиснение»)
- Параметры: размер, ширина, цвет, материал, пряжка
- CTA «Оставить заявку» / «Добавить к заявке»
- Блоки: история изделия, процесс создания, похожие изделия

## Корзина / заявка

- Список выбранных, удаление, комментарий к каждому
- Форма: имя, телефон, Telegram/WhatsApp, общий комментарий, пожелания по кастому
- Валидация zod (имя ≤100, телефон формат, message ≤1000)
- POST → таблица `requests` + `request_items`
- Success-экран: «Мы свяжемся с вами для обсуждения деталей изделия»

## Индивидуальный заказ

- Отдельная форма с тем же набором + чекбоксы (тиснение, инициалы, рисунок, цвет, металл, пряжка, фактура)
- Загрузка референсов в Storage bucket `custom-references` (приватный)

## Админка

- Защита: Lovable Cloud Auth + таблица `user_roles` + RLS через `has_role(auth.uid(), 'admin')`
- `/admin` — сводка
- `/admin/requests` — таблица: имя, контакты, состав, дата, статус (новая/в работе/закрыта); просмотр и заметки
- `/admin/products` — CRUD: название, slug, категория, описание, характер, параметры, статус («в наличии»/«под заказ»), цена (опц.), фото (multi-upload в Storage), порядок
- `/admin/content` — KV-таблица `site_content` для редактируемых блоков (hero, философия, FAQ, доставка)

## Схема БД (Lovable Cloud)

```
products(id, slug uniq, category enum[belt,buckle], title, description, character_tags text[],
         params jsonb, status enum[in_stock,made_to_order], price numeric null,
         images text[], sort_order int, created_at)
requests(id, name, phone, messenger, message, custom_notes, status enum, created_at)
request_items(id, request_id fk, product_id fk null, snapshot jsonb, note)
custom_requests(id, name, contact, details jsonb, reference_urls text[], status, created_at)
site_content(key pk, value jsonb, updated_at)
faq_items(id, question, answer, sort_order)
profiles(id pk → auth.users, display_name)
user_roles(id, user_id, role enum[admin,user], unique(user_id,role))
```

RLS:
- products, site_content, faq_items: public SELECT; INSERT/UPDATE/DELETE только admin
- requests / request_items / custom_requests: public INSERT; SELECT/UPDATE только admin
- Security definer `has_role()` для проверки роли (избегаем рекурсии)

Storage:
- `product-images` (public)
- `custom-references` (private, signed URLs для админа)

## SEO / производительность

- ЧПУ через `slug`
- `<title>`, meta description, OG, canonical на каждой странице
- JSON-LD: Organization (футер), Product (карточка), BreadcrumbList
- `sitemap.xml` генерируется из products
- Lazy-loading изображений, WebP, `loading="lazy"`, `decoding="async"`
- Видео в hero — `preload="metadata"`, постер-фото

## Безопасность

- zod-валидация всех форм
- RLS на все таблицы
- Без онлайн-оплаты — платёжных данных нет
- Загрузка файлов ограничена типами и размером

## Подход к реализации

1. Включить Lovable Cloud, создать схему БД, RLS, Storage buckets, роль admin
2. Дизайн-токены, layout (Header/Footer), роутинг, SEOHead
3. Главная со всеми секциями и анимациями
4. Каталог + карточка товара (с моковыми данными из БД)
5. Корзина-контекст + страница заявки
6. Кастом, О мастерской, Доставка, FAQ, Контакты, Политика, Оферта
7. Auth + админка (заявки, товары, контент)
8. SEO, sitemap, финальная полировка анимаций и адаптива

Готов реализовать по этому плану. Если хотите — могу до старта сгенерировать 2–3 варианта визуального направления hero/каталога, чтобы вы выбрали.
