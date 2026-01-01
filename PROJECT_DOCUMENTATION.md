# 📚 توثيق شامل لمشروع أكاديمية التميز - Quran System

## 🎯 نظرة عامة على المشروع

**اسم المشروع:** أكاديمية التميز (Quran System)  
**النوع:** نظام إدارة تعليمي متكامل  
**الهدف:** إدارة الطلاب، المعلمين، الحصص، الاشتراكات، والمعاملات المالية

---

## 🏗️ البنية التقنية (Tech Stack)

### Frontend
- **Framework:** Next.js 16.0.8 (React)
- **Language:** TypeScript
- **Styling:** CSS Modules + Vanilla CSS
- **Icons:** Lucide React
- **Routing:** Next.js App Router
- **State Management:** React Hooks (useState, useEffect)

### Backend
- **Language:** PHP 8.x
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **API Style:** RESTful API

### Deployment
- **Hosting:** Hostinger
- **Domain:** https://perfect-due.com
- **API Base URL:** https://perfect-due.com/api
- **Frontend:** Deployed on same domain

---

## 🗄️ معلومات قاعدة البيانات

### بيانات الاتصال
```php
DB_HOST: localhost
DB_USER: u291541652_quransystem
DB_PASS: iP03RQ!H;nJ1
DB_NAME: u291541652_quransystem
```

### الجداول (18 جدول)

| الجدول | الوصف | الحالة |
|--------|-------|--------|
| `users` | جميع المستخدمين (Admin, Teacher, Student, Parent) | ✅ مكتمل |
| `students` | بيانات الطلاب | ✅ مكتمل |
| `parents` | أولياء الأمور | ✅ مكتمل |
| `teachers` | المعلمين | ✅ مكتمل |
| `subjects` | المواد الدراسية | ✅ مكتمل |
| `teacher_subjects` | ربط المعلمين بالمواد | ✅ مكتمل |
| `plans` | خطط الاشتراك | ✅ مكتمل |
| `subscriptions` | اشتراكات الطلاب | ✅ مكتمل |
| `sessions` | الحصص الدراسية | ✅ مكتمل |
| `homework` | الواجبات | ⚠️ جاهز للتوسع |
| `exams` | الامتحانات | ⚠️ جاهز للتوسع |
| `exam_results` | نتائج الامتحانات | ⚠️ جاهز للتوسع |
| `transactions` | المعاملات المالية | ✅ مكتمل |
| `expenses` | المصروفات | ✅ مكتمل |
| `currencies` | العملات | ✅ مكتمل |
| `subscription_requests` | طلبات الاشتراك | ⚠️ جدول موجود |
| `teacher_rates` | أسعار المعلمين | ⚠️ جدول موجود |
| `notifications` | الإشعارات | ⚠️ جدول موجود |

---

## 📡 Backend API - الحالة الكاملة

### ✅ APIs المكتملة والمربوطة بالـ Database

#### 1. Authentication (`/api/auth/`)
- ✅ `POST /api/auth/login` - تسجيل الدخول
- ✅ `POST /api/auth/register` - تسجيل حساب جديد
- ✅ `GET /api/auth/verify` - التحقق من الرمز

**الملفات:**
- `/api/auth/index.php`

---

#### 2. Dashboard (`/api/dashboard/`)
- ✅ `GET /api/dashboard` - إحصائيات شاملة

**البيانات المعروضة:**
- عدد الطلاب، المعلمين، الحصص، الاشتراكات
- الإيرادات، المصروفات، الأرباح
- الاتجاهات (Trends) لكل قسم

**الملفات:**
- `/api/dashboard/index.php`

---

#### 3. Users (`/api/users/`)
- ✅ `GET /api/users` - قائمة المستخدمين
- ✅ `GET /api/users/{id}` - مستخدم محدد
- ✅ `POST /api/users` - إنشاء مستخدم
- ✅ `PUT /api/users/{id}` - تحديث مستخدم
- ✅ `DELETE /api/users/{id}` - حذف مستخدم

**الملفات:**
- `/api/users/index.php`

---

#### 4. Students (`/api/students/`)
- ✅ `GET /api/students` - قائمة الطلاب
- ✅ `GET /api/students/{id}` - طالب محدد + بيانات الاشتراك
- ✅ `POST /api/students` - إنشاء طالب + ولي أمر + اشتراك
- ✅ `PUT /api/students/{id}` - تحديث طالب
- ✅ `DELETE /api/students/{id}` - حذف طالب
- ✅ `GET /api/students/stats` - إحصائيات الطلاب

**الملفات:**
- `/api/students/index.php`

**ملاحظات:**
- تم إصلاح مشكلة `bind_param` في دالة الإنشاء
- تم إضافة التحقق من البريد المكرر في جدولي `students` و `users`

---

#### 5. Teachers (`/api/teachers/`)
- ✅ `GET /api/teachers` - قائمة المعلمين
- ✅ `GET /api/teachers/{id}` - معلم محدد + المواد + الطلاب
- ✅ `POST /api/teachers` - إنشاء معلم
- ✅ `PUT /api/teachers/{id}` - تحديث معلم
- ✅ `DELETE /api/teachers/{id}` - حذف معلم
- ✅ `GET /api/teachers/stats` - إحصائيات المعلمين

**الملفات:**
- `/api/teachers/index.php`

---

#### 6. Plans (`/api/plans/`)
- ✅ `GET /api/plans` - قائمة الخطط
- ✅ `GET /api/plans/{id}` - خطة محددة
- ✅ `POST /api/plans` - إنشاء خطة
- ✅ `PUT /api/plans/{id}` - تحديث خطة
- ✅ `DELETE /api/plans/{id}` - حذف خطة

**الملفات:**
- `/api/plans/index.php`

---

#### 7. Subscriptions (`/api/subscriptions/`)
- ✅ `GET /api/subscriptions` - قائمة الاشتراكات
- ✅ `GET /api/subscriptions/{id}` - اشتراك محدد
- ✅ `POST /api/subscriptions` - إنشاء اشتراك
- ✅ `PUT /api/subscriptions/{id}` - تحديث اشتراك
- ✅ `DELETE /api/subscriptions/{id}` - حذف اشتراك

**الملفات:**
- `/api/subscriptions/index.php`

---

#### 8. Sessions (`/api/sessions/`)
- ✅ `GET /api/sessions` - قائمة الحصص
- ✅ `GET /api/sessions/{id}` - حصة محددة
- ✅ `POST /api/sessions` - إنشاء حصة
- ✅ `PUT /api/sessions/{id}` - تحديث حصة
- ✅ `DELETE /api/sessions/{id}` - حذف حصة
- ✅ `GET /api/sessions/stats` - إحصائيات الحصص

**الملفات:**
- `/api/sessions/index.php`

---

#### 9. Subjects (`/api/subjects/`)
- ✅ `GET /api/subjects` - قائمة المواد
- ✅ `POST /api/subjects` - إنشاء مادة
- ✅ `PUT /api/subjects/{id}` - تحديث مادة
- ✅ `DELETE /api/subjects/{id}` - حذف مادة

**الملفات:**
- `/api/subjects/index.php`

---

#### 10. Finances - Currencies (`/api/finances/currencies/`)
- ✅ `GET /api/finances/currencies` - قائمة العملات
- ✅ `GET /api/finances/currencies/{id}` - عملة محددة
- ✅ `POST /api/finances/currencies` - إضافة عملة
- ✅ `PUT /api/finances/currencies/{id}` - تحديث عملة
- ✅ `DELETE /api/finances/currencies/{id}` - حذف عملة

**الملفات:**
- `/api/finances/currencies/index.php`

**ملاحظات:**
- تم إضافة دالة `getById()`
- يمنع حذف العملة الافتراضية
- عملة واحدة فقط يمكن أن تكون افتراضية

---

#### 11. Finances - Transactions (`/api/finances/transactions/`)
- ✅ `GET /api/finances/transactions` - المعاملات المالية
- ✅ `POST /api/finances/transactions` - إنشاء معاملة
- ✅ `PUT /api/finances/transactions/{id}` - تحديث معاملة
- ✅ `DELETE /api/finances/transactions/{id}` - حذف معاملة

**الملفات:**
- `/api/finances/transactions/index.php`

---

#### 12. Finances - Expenses (`/api/finances/expenses/`)
- ✅ `GET /api/finances/expenses` - المصروفات
- ✅ `POST /api/finances/expenses` - إضافة مصروف
- ✅ `PUT /api/finances/expenses/{id}` - تحديث مصروف
- ✅ `DELETE /api/finances/expenses/{id}` - حذف مصروف

**الملفات:**
- `/api/finances/expenses/index.php`

---

### ⚠️ APIs الموجودة لكن غير مكتملة

#### 13. Homework (`/api/homework/`)
- ⚠️ الجدول موجود في الـ database
- ⚠️ الـ API موجود لكن يحتاج توسع
- ❌ غير مربوط بالـ Frontend

**الملفات:**
- `/api/homework/index.php`

---

#### 14. Exams (`/api/exams/`)
- ⚠️ الجدول موجود في الـ database
- ⚠️ الـ API موجود لكن يحتاج توسع
- ❌ غير مربوط بالـ Frontend

**الملفات:**
- `/api/exams/index.php`

---

### ❌ APIs غير موجودة

#### 15. Subscription Requests
- ❌ لا يوجد API
- ⚠️ الجدول `subscription_requests` موجود في الـ database
- ❌ غير مربوط بالـ Frontend

**المطلوب:**
- إنشاء `/api/subscription-requests/index.php`
- CRUD كامل

---

#### 16. Teacher Rates
- ❌ لا يوجد API
- ⚠️ الجدول `teacher_rates` موجود في الـ database
- ❌ غير مربوط بالـ Frontend

**المطلوب:**
- إنشاء `/api/teacher/rates/index.php`
- CRUD كامل

---

#### 17. Notifications
- ❌ لا يوجد API
- ⚠️ الجدول `notifications` موجود في الـ database
- ❌ غير مربوط بالـ Frontend

**المطلوب:**
- إنشاء `/api/notifications/index.php`
- CRUD كامل

---

## 🎨 Frontend - الحالة الكاملة

### ✅ الصفحات المكتملة والمربوطة بالـ API

#### 1. Authentication
- ✅ `/login` - صفحة تسجيل الدخول
- ✅ `/register` - صفحة التسجيل
- ✅ مربوطة بـ `/api/auth/`

**الملفات:**
- `/app/login/page.tsx`
- `/app/register/page.tsx`

---

#### 2. Dashboard
- ✅ `/dashboard` - لوحة التحكم الرئيسية
- ✅ مربوطة بـ `/api/dashboard/`
- ✅ تعرض إحصائيات حية

**الملفات:**
- `/app/dashboard/page.tsx`

---

#### 3. Students
- ✅ `/students` - قائمة الطلاب
- ✅ `/students/create` - إضافة طالب
- ✅ `/students/[id]` - تفاصيل طالب
- ✅ مربوطة بـ `/api/students/`
- ✅ Cache busting مطبق

**الملفات:**
- `/app/students/page.tsx`
- `/app/students/create/page.tsx`
- `/app/students/[id]/page.tsx`

**ملاحظات:**
- تم إصلاح مشكلة CDN caching
- تم إضافة timestamp لكل request

---

#### 4. Teachers
- ✅ `/teachers` - قائمة المعلمين
- ✅ `/teachers/create` - إضافة معلم
- ✅ `/teachers/[id]` - تفاصيل معلم
- ✅ مربوطة بـ `/api/teachers/`

**الملفات:**
- `/app/teachers/page.tsx`
- `/app/teachers/create/page.tsx`
- `/app/teachers/[id]/page.tsx`

---

#### 5. Plans
- ✅ `/plans` - قائمة الخطط
- ✅ `/plans/create` - إضافة خطة
- ✅ `/plans/[id]/edit` - تعديل خطة
- ✅ مربوطة بـ `/api/plans/`
- ✅ Cache busting مطبق

**الملفات:**
- `/app/plans/page.tsx`
- `/app/plans/create/page.tsx`
- `/app/plans/[id]/edit/page.tsx`

---

#### 6. Subscriptions
- ✅ `/subscriptions` - قائمة الاشتراكات
- ✅ `/subscriptions/create` - إضافة اشتراك
- ✅ مربوطة بـ `/api/subscriptions/`
- ✅ Cache busting مطبق

**الملفات:**
- `/app/subscriptions/page.tsx`
- `/app/subscriptions/create/page.tsx`

---

#### 7. Sessions
- ✅ `/sessions` - قائمة الحصص
- ✅ `/sessions/create` - إضافة حصة
- ✅ `/sessions/[id]/edit` - تعديل حصة
- ✅ مربوطة بـ `/api/sessions/`

**الملفات:**
- `/app/sessions/page.tsx`
- `/app/sessions/create/page.tsx`
- `/app/sessions/[id]/edit/page.tsx`

---

#### 8. Subjects
- ✅ `/subjects` - قائمة المواد
- ✅ `/subjects/create` - إضافة مادة
- ✅ `/subjects/[id]/edit` - تعديل مادة
- ✅ مربوطة بـ `/api/subjects/`

**الملفات:**
- `/app/subjects/page.tsx`
- `/app/subjects/create/page.tsx`
- `/app/subjects/[id]/edit/page.tsx`

---

#### 9. Finances - Currencies
- ✅ `/finances/currencies` - قائمة العملات
- ✅ `/finances/currencies/create` - إضافة عملة
- ✅ `/finances/currencies/[id]/edit` - تعديل عملة
- ✅ مربوطة بـ `/api/finances/currencies/`
- ✅ Cache busting مطبق
- ✅ is_default parsing صحيح

**الملفات:**
- `/app/finances/currencies/page.tsx`
- `/app/finances/currencies/create/page.tsx`
- `/app/finances/currencies/[id]/edit/page.tsx`

**التحديثات الأخيرة:**
- ✅ إصلاح صفحة الإضافة - ترسل POST للـ API
- ✅ إصلاح صفحة التعديل - تجلب البيانات من API
- ✅ إصلاح الـ redirect بعد الحفظ (setTimeout)
- ✅ إضافة loading state

---

#### 10. Users
- ✅ `/users` - قائمة المستخدمين
- ✅ `/users/create` - إضافة مستخدم
- ✅ مربوطة بـ `/api/users/`

**الملفات:**
- `/app/users/page.tsx`
- `/app/users/create/page.tsx`

---

### ⚠️ الصفحات الموجودة لكن غير مربوطة بالكامل

#### 11. Finances - Transactions
- ⚠️ `/finances/transactions` - الصفحة موجودة
- ❌ غير مربوطة بالـ API
- ❌ لا يوجد صفحة إضافة/تعديل

**الملفات:**
- `/app/finances/transactions/page.tsx`

**المطلوب:**
- ربط بـ `/api/finances/transactions/`
- إضافة صفحة create
- إضافة صفحة edit

---

#### 12. Finances - Expenses
- ⚠️ `/finances/expenses` - الصفحة موجودة
- ❌ غير مربوطة بالـ API
- ❌ لا يوجد صفحة إضافة/تعديل

**الملفات:**
- `/app/finances/expenses/page.tsx`

**المطلوب:**
- ربط بـ `/api/finances/expenses/`
- إضافة صفحة create
- إضافة صفحة edit

---

#### 13. Homework
- ⚠️ `/homework` - الصفحة موجودة
- ❌ غير مربوطة بالـ API
- ❌ لا يوجد صفحة إضافة/تعديل

**الملفات:**
- `/app/homework/page.tsx`

**المطلوب:**
- توسيع `/api/homework/`
- ربط الصفحة بالـ API
- إضافة صفحات create/edit

---

#### 14. Exams
- ⚠️ `/exams` - الصفحة موجودة
- ❌ غير مربوطة بالـ API
- ❌ لا يوجد صفحة إضافة/تعديل

**الملفات:**
- `/app/exams/page.tsx`

**المطلوب:**
- توسيع `/api/exams/`
- ربط الصفحة بالـ API
- إضافة صفحات create/edit

---

### ❌ الصفحات غير الموجودة

#### 15. Subscription Requests
- ❌ `/subscription-requests` - الصفحة موجودة لكن فارغة
- ❌ لا يوجد API
- ❌ لا يوجد صفحات create/edit

**المطلوب:**
- إنشاء API
- بناء الصفحة بالكامل
- إضافة صفحات create/edit

---

#### 16. Active Subscriptions
- ⚠️ `/active-subscriptions` - الصفحة موجودة
- ❌ غير واضح الفرق بينها وبين `/subscriptions`

**المطلوب:**
- توضيح الفرق
- ربط بالـ API إذا لزم

---

#### 17. Pending Approval
- ⚠️ `/pending-approval` - الصفحة موجودة
- ❌ غير واضح الغرض منها

**المطلوب:**
- توضيح الغرض
- ربط بالـ API

---

## 🔐 بيانات الدخول

### Admin Account
```
Email: admin@academy.com
Password: admin123
```

### Database Access
```
Host: localhost (on Hostinger)
Username: u291541652_quransystem
Password: iP03RQ!H;nJ1
Database: u291541652_quransystem
```

### Hosting
```
Provider: Hostinger
Domain: https://perfect-due.com
cPanel: https://hpanel.hostinger.com
```

---

## 📂 هيكل المشروع

```
quran-system/
├── app/                          # Frontend (Next.js)
│   ├── dashboard/               # ✅ Dashboard
│   ├── login/                   # ✅ Login
│   ├── register/                # ✅ Register
│   ├── students/                # ✅ Students CRUD
│   ├── teachers/                # ✅ Teachers CRUD
│   ├── plans/                   # ✅ Plans CRUD
│   ├── subscriptions/           # ✅ Subscriptions CRUD
│   ├── sessions/                # ✅ Sessions CRUD
│   ├── subjects/                # ✅ Subjects CRUD
│   ├── users/                   # ✅ Users CRUD
│   ├── finances/
│   │   ├── currencies/          # ✅ Currencies CRUD
│   │   ├── transactions/        # ⚠️ غير مربوطة
│   │   └── expenses/            # ⚠️ غير مربوطة
│   ├── homework/                # ⚠️ غير مربوطة
│   ├── exams/                   # ⚠️ غير مربوطة
│   ├── subscription-requests/   # ❌ غير مكتملة
│   ├── active-subscriptions/    # ⚠️ غير واضحة
│   └── pending-approval/        # ⚠️ غير واضحة
│
├── api/                          # Backend (PHP)
│   ├── config.php               # ✅ Database config
│   ├── Database.php             # ✅ Database helper
│   ├── install.php              # ✅ Installation script
│   ├── .htaccess                # ✅ Routing + No-cache headers
│   ├── auth/                    # ✅ Authentication
│   ├── dashboard/               # ✅ Dashboard stats
│   ├── users/                   # ✅ Users CRUD
│   ├── students/                # ✅ Students CRUD
│   ├── teachers/                # ✅ Teachers CRUD
│   ├── plans/                   # ✅ Plans CRUD
│   ├── subscriptions/           # ✅ Subscriptions CRUD
│   ├── sessions/                # ✅ Sessions CRUD
│   ├── subjects/                # ✅ Subjects CRUD
│   ├── finances/
│   │   ├── currencies/          # ✅ Currencies CRUD
│   │   ├── transactions/        # ✅ Transactions CRUD
│   │   └── expenses/            # ✅ Expenses CRUD
│   ├── homework/                # ⚠️ يحتاج توسع
│   └── exams/                   # ⚠️ يحتاج توسع
│
└── components/                   # Shared components
    ├── Header.tsx               # ✅ Header
    ├── Sidebar.tsx              # ✅ Sidebar
    └── ...
```

---

## 🐛 المشاكل التي تم حلها

### 1. CDN Caching Issue
**المشكلة:** Hostinger CDN كان يخزن responses لمدة أسبوع  
**الحل:**
- إضافة headers في `/api/.htaccess`:
  ```apache
  Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
  Header set Pragma "no-cache"
  Header set Expires "0"
  ```
- إضافة timestamp لكل request: `?_t=${Date.now()}`

---

### 2. Student Creation bind_param Error
**المشكلة:** عدد type characters لا يطابق عدد parameters  
**الحل:** تصحيح `bind_param` في `/api/students/index.php`

---

### 3. Duplicate Email Error
**المشكلة:** البريد موجود في `users` لكن التحقق فقط على `students`  
**الحل:** التحقق من الجدولين

---

### 4. Currency is_default Display
**المشكلة:** جميع العملات تظهر كـ "افتراضية"  
**الحل:** تحويل `is_default` من string إلى boolean في Frontend

---

### 5. Currency Edit Page Empty
**المشكلة:** صفحة التعديل تستخدم Mock Data  
**الحل:** 
- إعادة كتابة الصفحة لجلب البيانات من API
- نقل `fetchCurrency` داخل `useEffect`
- إضافة `getById()` في Backend API

---

### 6. Currency Create Not Saving
**المشكلة:** صفحة الإضافة تعمل `console.log` فقط  
**الحل:** إضافة POST request للـ API

---

### 7. Redirect After Save
**المشكلة:** الـ redirect لا يعمل بعد الـ alert  
**الحل:** استخدام `setTimeout` قبل `router.push`

---

## 📋 قائمة المهام المتبقية

### Backend

#### High Priority
- [ ] إنشاء `/api/subscription-requests/` - طلبات الاشتراك
- [ ] إنشاء `/api/teacher/rates/` - أسعار المعلمين
- [ ] توسيع `/api/homework/` - الواجبات
- [ ] توسيع `/api/exams/` - الامتحانات

#### Medium Priority
- [ ] إنشاء `/api/notifications/` - الإشعارات
- [ ] إضافة file upload للصور
- [ ] إضافة pagination لجميع الـ APIs

#### Low Priority
- [ ] إضافة search/filter لجميع الـ APIs
- [ ] إضافة sorting options

---

### Frontend

#### High Priority
- [ ] ربط `/finances/transactions` بالـ API
- [ ] ربط `/finances/expenses` بالـ API
- [ ] إضافة صفحات create/edit للـ Transactions
- [ ] إضافة صفحات create/edit للـ Expenses

#### Medium Priority
- [ ] ربط `/homework` بالـ API
- [ ] ربط `/exams` بالـ API
- [ ] إضافة صفحات create/edit للـ Homework
- [ ] إضافة صفحات create/edit للـ Exams
- [ ] بناء `/subscription-requests` بالكامل

#### Low Priority
- [ ] توضيح `/active-subscriptions` vs `/subscriptions`
- [ ] توضيح `/pending-approval`
- [ ] إضافة pagination للجداول
- [ ] إضافة search/filter للجداول

---

## 🚀 خطوات النشر

### 1. Backend Deployment
```bash
# رفع الملفات المعدلة
- api/students/index.php
- api/finances/currencies/index.php
- api/.htaccess

# مسح CDN cache من Hostinger
```

### 2. Frontend Deployment
```bash
# Build
npm run build

# رفع مجلد .next
```

### 3. Testing
```bash
# اختبار الـ APIs
curl https://perfect-due.com/api/students
curl https://perfect-due.com/api/finances/currencies

# اختبار Frontend
https://perfect-due.com/students
https://perfect-due.com/finances/currencies
```

---

## 💡 ملاحظات مهمة للذكاء الاصطناعي

### عند العمل على Backend:
1. **استخدم Prepared Statements دائماً** لمنع SQL Injection
2. **استخدم `$this->db->sanitize()`** لتنظيف المدخلات
3. **تحقق من JWT Token** في الـ APIs المحمية
4. **أرسل responses بصيغة JSON** دائماً
5. **استخدم HTTP status codes الصحيحة**

### عند العمل على Frontend:
1. **أضف cache busting** لكل API request: `?_t=${Date.now()}`
2. **أضف headers** لمنع caching:
   ```javascript
   headers: {
     'Cache-Control': 'no-cache, no-store, must-revalidate',
     'Pragma': 'no-cache'
   }
   ```
3. **استخدم `setTimeout` قبل `router.push`** بعد الـ alerts
4. **أضف loading states** للأزرار
5. **تحقق من `is_default` parsing** للـ booleans

### عند إنشاء APIs جديدة:
1. **اتبع نفس الهيكل** الموجود في الـ APIs الحالية
2. **أضف CRUD كامل** (Create, Read, Update, Delete)
3. **أضف validation** للبيانات المدخلة
4. **أضف error handling** شامل
5. **وثق الـ API** في الـ README

---

## 📞 معلومات الاتصال

**الاستضافة:** Hostinger  
**الدومين:** https://perfect-due.com  
**API Base:** https://perfect-due.com/api  
**Database:** u291541652_quransystem

---

**آخر تحديث:** 15 ديسمبر 2025  
**الحالة:** ✅ 70% مكتمل - جاهز للتوسع
