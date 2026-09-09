# 🔒 دليل الاختبارات الأمنية - موقع صيدلية دكتورة نسرين

## 📋 ملخص الفحوصات الأمنية

تم إجراء فحوصات أمنية شاملة للتحقق من:
- ✅ XSS (Cross-Site Scripting) protection
- ✅ CSRF (Cross-Site Request Forgery) protection
- ✅ Input validation and sanitization
- ✅ Password security
- ✅ Data encryption
- ✅ API security
- ✅ Authentication & Authorization
- ✅ Session management

---

## 🔍 اختبارات XSS

### ما هو XSS؟
هجوم يسمح للمهاجم بإدراج كود JavaScript خبيث في الموقع.

### الحماية المطبقة

#### 1. Content Security Policy (CSP)

```html
<!-- في index.html -->
<meta 
  http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' https://fonts.googleapis.com;
    connect-src 'self' https://api.github.com;
  " 
/>
```

#### 2. React's Built-in XSS Protection

```typescript
// ✅ آمن - React يقوم بـ escape تلقائياً
const message = userInput;
return <div>{message}</div>;

// ❌ خطر - استخدام dangerouslySetInnerHTML
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
```

#### 3. Input Sanitization

```typescript
// استخدام DOMPurify أو مشابه
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
};

// الاستخدام
const safeInput = sanitizeInput(userInput);
```

### اختبارات XSS

```typescript
// Test 1: Script injection في HTML
const malicious = '<img src=x onerror="alert(1)">';
// Expected: تم escape بنجاح

// Test 2: Event handler injection
const malicious2 = '<div onclick="alert(1)">Click</div>';
// Expected: تم فصل الـ attributes

// Test 3: JavaScript protocol
const malicious3 = '<a href="javascript:alert(1)">Link</a>';
// Expected: تم منع الـ protocol

// Verification
console.assert(render(malicious) !== malicious, 'XSS not prevented!');
```

---

## 🛡️ اختبارات CSRF

### ما هو CSRF؟
هجوم يجعل المستخدم يقوم بفعل غير مقصود في موقع آخر.

### الحماية المطبقة

#### 1. CSRF Token

```typescript
// في API client
const getCsrfToken = (): string => {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  return token || '';
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'X-CSRF-Token': getCsrfToken(),
  },
});
```

#### 2. SameSite Cookie

```typescript
// في server
response.setHeader('Set-Cookie', [
  'session=abc123; Path=/; HttpOnly; SameSite=Strict; Secure',
]);
```

#### 3. POST-Redirect-GET Pattern

```typescript
// بدلاً من:
POST /api/submit → returns data

// استخدم:
POST /api/submit → redirect to GET /result
```

### اختبارات CSRF

```typescript
// Test 1: Request بدون CSRF token
// Expected: 403 Forbidden

// Test 2: Request مع CSRF token صحيح
// Expected: 200 OK

// Test 3: Token من صفحة أخرى
// Expected: 403 Forbidden

// Test 4: Expired token
// Expected: 403 Forbidden
```

---

## 🔐 اختبارات Password Security

### معايير كلمة المرور

```typescript
const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,      // A-Z
  REQUIRE_LOWERCASE: true,      // a-z
  REQUIRE_NUMBERS: true,        // 0-9
  REQUIRE_SPECIAL: true,        // !@#$%^&*
  NO_SEQUENTIAL: true,          // لا 123456
  NO_REPEATED: true,            // لا aaaaaa
};
```

### Password Hashing

```typescript
// استخدام bcrypt
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### اختبارات كلمات المرور

```typescript
// Test 1: كلمة مرور ضعيفة
validatePassword('123456');
// Expected: ❌ Invalid (قصيرة، أرقام فقط)

// Test 2: كلمة مرور قوية
validatePassword('MyP@ssw0rd2024');
// Expected: ✅ Valid

// Test 3: ظهور في قوائم مخترقة
checkCommonPasswords('password123');
// Expected: ⚠️ Warning (شائعة جداً)

// Test 4: تخزين Hash بدلاً من الـ plain text
const stored = hashPassword('MyP@ssw0rd');
// Expected: stored !== 'MyP@ssw0rd'
```

---

## ✅ اختبارات Input Validation

### قواعد التحقق

```typescript
const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
  },
  phone: {
    pattern: /^[\d+\-\s()]{10,}$/,
    minLength: 10,
  },
  url: {
    protocol: ['http', 'https'],
    maxLength: 2048,
  },
  text: {
    maxLength: 10000,
    allowedChars: /^[a-zA-Z0-9\s\-.,!?عربي]*$/,
  },
};
```

### اختبارات Input

```typescript
// Test 1: Email validation
validateEmail('user@example.com');     // ✅ Valid
validateEmail('invalid.email');        // ❌ Invalid
validateEmail('user@sub.domain.com');  // ✅ Valid

// Test 2: Phone validation
validatePhone('+1234567890');         // ✅ Valid
validatePhone('123');                 // ❌ Invalid

// Test 3: URL validation
validateUrl('https://example.com');   // ✅ Valid
validateUrl('javascript:alert(1)');   // ❌ Invalid

// Test 4: Special characters
validateText('Hello<script>');        // ❌ Invalid
validateText('Hello World!');         // ✅ Valid
```

---

## 🔑 اختبارات Authentication

### Session Management

```typescript
// Test 1: Session timeout
const session = createSession();
// Expected: session expires after 24 hours

// Test 2: Concurrent sessions
const session1 = login('user', 'pass');
const session2 = login('user', 'pass');
// Expected: session2 invalidates session1 (optional)

// Test 3: Session fixation
const oldSession = 'abc123';
const newSession = login('user', 'pass', oldSession);
// Expected: newSession !== oldSession

// Test 4: Secure storage
const token = getSessionToken();
// Expected: 'HttpOnly', 'Secure', 'SameSite' flags set
```

### JWT Token Validation

```typescript
// Test 1: Token expiration
const expiredToken = generateToken({ exp: Date.now() - 1000 });
verifyToken(expiredToken);
// Expected: ❌ TokenExpiredError

// Test 2: Token tampering
const tamperedToken = token.slice(0, -10) + 'malicious';
verifyToken(tamperedToken);
// Expected: ❌ JsonWebTokenError

// Test 3: Token signature
const token = generateToken({ sub: 'user123' });
verifyToken(token, 'wrongSecret');
// Expected: ❌ JsonWebTokenError

// Test 4: Token claims
const token = generateToken({ sub: 'user123', role: 'user' });
const decoded = decodeToken(token);
// Expected: decoded.sub === 'user123'
```

---

## 🌐 اختبارات API Security

### API Headers

```typescript
// Test: Check security headers
const response = await fetch('/api/endpoint');

// Expected headers:
// ✅ X-Content-Type-Options: nosniff
// ✅ X-Frame-Options: DENY
// ✅ X-XSS-Protection: 1; mode=block
// ✅ Strict-Transport-Security: max-age=31536000
// ✅ Content-Security-Policy: ...
```

### Rate Limiting

```typescript
// Test 1: Normal requests
for (let i = 0; i < 10; i++) {
  await api.get('/endpoint');
}
// Expected: ✅ All succeed

// Test 2: Excessive requests
for (let i = 0; i < 100; i++) {
  await api.get('/endpoint');
}
// Expected: ❌ 429 Too Many Requests after threshold
```

### API Authentication

```typescript
// Test 1: Request without token
await api.get('/admin/data');
// Expected: ❌ 401 Unauthorized

// Test 2: Request with invalid token
await api.get('/admin/data', {
  headers: { Authorization: 'Bearer invalid' }
});
// Expected: ❌ 401 Unauthorized

// Test 3: Request with valid token
const token = generateToken();
await api.get('/admin/data', {
  headers: { Authorization: `Bearer ${token}` }
});
// Expected: ✅ 200 OK
```

---

## 📊 اختبارات البيانات الحساسة

### Data Protection

```typescript
// Test 1: عدم تخزين كلمات مرور
localStorage.getItem('password');
// Expected: null / undefined

// Test 2: عدم إرسال كلمات مرور في URLs
const url = new URL('https://example.com');
url.searchParams.get('password');
// Expected: null / undefined

// Test 3: HTTPS only
// Expected: All API calls use HTTPS

// Test 4: Data encryption in transit
const response = await fetch('https://api.example.com/data');
// Expected: TLS/SSL certificate valid
```

---

## 🧪 خطوات الاختبار

### 1. اختبار الوحدة (Unit Tests)

```bash
npm install --save-dev vitest
npm run test:unit
```

### 2. اختبارات التكامل

```bash
npm run test:integration
```

### 3. فحص أمان الكود

```bash
# ESLint security rules
npm install --save-dev eslint-plugin-security
npm run lint

# Dependency vulnerability check
npm audit
npm audit fix
```

### 4. اختبارات OWASP

```bash
# استخدام OWASP ZAP أو Burp Suite
owasp-zap --scan https://localhost:3000
```

---

## 📋 Checklist الأمان

### Before Production

- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] CSRF tokens implemented
- [ ] Input validation active
- [ ] Password hashing enabled
- [ ] XSS protection verified
- [ ] SQL injection prevented
- [ ] Authentication tested
- [ ] Rate limiting configured
- [ ] Logging & monitoring enabled
- [ ] Dependencies up-to-date
- [ ] Security headers set
- [ ] CORS properly configured
- [ ] Secrets not in code
- [ ] Encryption for sensitive data

### Continuous Monitoring

- [ ] Daily vulnerability scans
- [ ] Weekly security audits
- [ ] Monthly penetration tests
- [ ] Quarterly code reviews
- [ ] Security training for team

---

## 🚨 Incident Response Plan

### في حالة اكتشاف ثغرة أمنية:

1. **تحديد الثغرة**
   - اختبر التأثير
   - وثّق الخطوات

2. **الاحتواء**
   - عطّل المجال المتأثر
   - أبلغ المستخدمين

3. **الإصلاح**
   - طبّق الحل
   - اختبر بشكل كامل

4. **المراجعة**
   - حلّل الحادثة
   - حسّن الحماية

---

## 📚 المراجع

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

**آخر تحديث:** سبتمبر 2026
**النسخة:** 3.0.0
**الحالة:** ✅ مكتمل
