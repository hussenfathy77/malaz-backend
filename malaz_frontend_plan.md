# Malaz Frontend Architecture & UI Plan

## 1. Tech Stack (التقنيات المستخدمة)
- **Framework:** React.js (via Vite) or Next.js (App Router).
- **Styling:** TailwindCSS (for rapid, modern UI development).
- **State Management:** Zustand أو Redux Toolkit (لإدارة الجلسات وبيانات المستخدم).
- **Data Fetching:** React Query (TanStack Query) للتواصل السلس مع الـ APIs التي بنيناها.
- **Icons & Components:** Lucide-react (للأيقونات) و Radix UI / Shadcn UI (للمكونات الجاهزة).

---

## 2. Sitemap & API Integration (خريطة الموقع وربط البيانات)

### 🚪 Auth & Onboarding (المصادقة)
- **Pages:** `/login`, `/register`, `/forgot-password`, `/reset-password`
- **APIs:** 
  - `POST /api/v1/auth/register` (تسجيل حساب: مريض، طبيب، مقدم رعاية).
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`

### 🧑‍⚕️ Patient Portal (بوابة المريض)
- **Pages:** 
  - `/dashboard`: ملخص للحالة، المواعيد القادمة، واختصار لإضافة حالة مزاجية.
  - `/appointments`: قائمة المواعيد، حجز موعد جديد (بحث عن أطباء)، الدفع الوهمي.
    - **APIs:** `GET /doctors`, `POST /appointments/book`, `GET /appointments`
  - `/toolkit`: متتبع الحالة المزاجية (Mood Tracker) وكتابة اليوميات (Journal) مع تحليل الذكاء الاصطناعي.
    - **APIs:** `POST /toolkit/mood`, `GET /toolkit/journal`
  - `/community`: دوائر الأمان (Safe Circles)، الدردشة الجماعية.
    - **APIs:** `GET /circles`, `POST /circles/:id/messages`
  - `/caregivers`: قائمة مقدمي الرعاية، وإرسال دعوات جديدة.
    - **APIs:** `GET /caregivers/my-caregivers`, `POST /caregivers/invite`

### 🩺 Doctor Portal (بوابة الطبيب)
- **Pages:**
  - `/doctor/dashboard`: المواعيد اليومية، التقييمات.
  - `/doctor/schedule`: إدارة ساعات العمل (Working Hours).
    - **APIs:** `GET /working-hours`, `POST /working-hours`
  - `/doctor/patients`: قائمة المرضى والملاحظات السريرية (Clinical Notes).
    - **APIs:** `POST /clinical-notes`, `GET /clinical-notes/:id`

### 🛡️ Caregiver Portal (بوابة مقدم الرعاية)
- **Pages:**
  - `/caregiver/dashboard`: قبول/رفض الدعوات، عرض ملخص الحالة المزاجية للمرضى المربوطين به.
    - **APIs:** `PUT /caregivers/:id/status`, `GET /caregivers/patient/:id/summary`

---

## 3. The Mega-Prompt (أمر التوليد لأدوات الذكاء الاصطناعي)

*انسخ هذا النص الإنجليزي وضعه في أداة مثل **v0.dev** أو **Figma AI** أو أي AI UI Builder للحصول على واجهة احترافية فورية:*

```text
Create a comprehensive, modern, and highly aesthetic web application UI for "Malaz", a premium mental health and medical therapy platform. The tech stack should be React, TailwindCSS, and Lucide Icons.

### Design System & Aesthetics:
- **Color Palette:** Calming and premium. Use soft teal/mint greens (primary), deep navy blues (text and contrast), and warm off-whites/light grays for backgrounds.
- **Style:** Glassmorphism accents, soft shadows, rounded corners (xl or 2xl), and smooth micro-animations on hover. The UI should feel safe, clinical yet warm, and highly engaging.
- **Layout:** A responsive dashboard layout with a collapsible sidebar navigation on the left, and a top header (with search, notifications, and user avatar).

### Key Views to Generate:

1. **Dashboard Overview (Patient View):**
   - A greeting header: "Good morning, [Name]".
   - **Quick Actions:** Buttons for "Book Session", "Log Mood", "New Journal Entry".
   - **Cards/Widgets:** 
     - "Upcoming Appointment" card (showing Doctor's photo, name, date, time, and a "Join Call" button).
     - "Mood Tracker Summary" (a beautiful mini chart or row of recent mood emojis).
     - "Safe Circles Activity" (showing unread messages from community groups).

2. **Doctors Directory & Booking View:**
   - A search bar and filter tags (e.g., "Psychiatrist", "Therapist", "Top Rated").
   - A grid of "Doctor Cards". Each card displays: Doctor's picture, Name, Specialization, Rating (stars), Session Price, and a "Book Now" primary button.

3. **Mental Health Toolkit (Journal & Mood):**
   - A split view. Left side: A clean, distraction-free text area to write a journal entry with a "Save" button.
   - Right side: A vertical timeline of past journal entries and mood logs, showing AI-generated feedback tags (e.g., "Positive", "Needs Attention").

4. **Doctor's Workspace (Doctor View):**
   - A calendar/schedule view showing today's appointments.
   - A "Working Hours" configuration panel with day-of-week toggles and time inputs.
   - A side panel for "Clinical Notes" where the doctor can write diagnosis and treatment plans for the selected appointment.

Ensure the code uses modern React practices (functional components, hooks), semantic HTML, and fully responsive Tailwind classes. The design must be pixel-perfect, wow the user at first glance, and avoid looking like a generic template.
```
