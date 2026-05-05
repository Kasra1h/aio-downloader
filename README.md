# aio-downloader — All-in-One GitHub Actions Downloader

**[راهنمای فارسی (Persian)](#راهنمای-فارسی)**

> A collection of **GitHub Actions workflows** that let you download videos, images, and files from **YouTube**, **Instagram**, and **any direct URL** – all from your browser, **without running any software on your own computer**.

---

## 🌟 Features

| Workflow | What it does |
|----------|--------------|
| **YouTube Downloader** | Downloads YouTube videos in your chosen resolution (including 4K) with optional FPS selection. Supports video-only and audio-only modes. |
| **Instagram Downloader** | Downloads **all media** from Instagram posts, reels, stories, highlights, and profiles – including mixed carousels. Handles both images and videos. |
| **Direct Downloader** | Downloads **any file** from a direct URL using `aria2c` (16 parallel connections, ultra-fast). Great for large files. |

✅ **All downloads are automatically split into 99 MB parts, zipped, and uploaded back to your repository** – you can download them anytime from GitHub.

✅ **No server, no VPS, and no local installation required** – everything runs on GitHub's free infrastructure.

✅ **Cookies are stored securely** as GitHub Secrets – never exposed in logs or code.

✅ **Batch downloading** – paste up to 10+ Instagram links at once, separated by commas, spaces, or newlines.

---

## 🔧 Requirements (Before You Start)

- A **GitHub account** (free)
- A **browser** (Chrome/Firefox/Edge) with the extension **"Get cookies.txt LOCALLY"** to export your login cookies
- (Optional) An **Instagram account** if you want to download private/story content

---

## 🍴 How to Fork and Set Up

### Step 1: Fork the repository

Click the **"Fork"** button at the top-right of this page.

### Step 2: Enable GitHub Actions

1. Go to your forked repository → **Settings** → **Actions** → **General**
2. Under **"Actions permissions"** select **"Allow all actions and reusable workflows"**
3. Click **Save**

### Step 3: Grant Workflow Write Permissions (IMPORTANT!)

1. Still under **Settings** → **Actions** → **General**
2. Scroll down to **"Workflow permissions"**
3. Select **"Read and write permissions"**  
   (Workflows need this to commit and push downloaded files back to your repository.)
4. Click **Save**

> ⚠️ If you skip this step, the workflow will fail when trying to upload the ZIP files.

---

## 🍪 How to Add Cookies (For YouTube & Instagram)

> **Note:** YouTube and Instagram often require login cookies to access certain content (e.g., private videos, stories, highlights). If you're only downloading public content, you can skip this step.

### 1. Export Cookies from Your Browser

- Install the extension **"Get cookies.txt LOCALLY"** from the Chrome Web Store or Firefox Add-ons.
- Log into **youtube.com** (for the YouTube downloader) or **instagram.com** (for the Instagram downloader) in your browser.
- Click the extension icon and choose **"Export"** (Netscape format).
- Save the `.txt` file somewhere safe.

### 2. Add Cookies as GitHub Secrets

1. In your forked repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Create a secret named **`YOUTUBE_COOKIES`** and paste the entire contents of your YouTube `cookies.txt` file.
4. Create another secret named **`INSTAGRAM_COOKIES`** and paste your Instagram `cookies.txt` contents.

> ⚠️ **Never commit your cookie files directly to the repository.** The workflow automatically reads them from the secrets and creates a temporary file during execution.

---

## 🚀 How to Use

### YouTube Downloader

1. Go to your forked repository → **Actions** → Select **"youtube-downloader"**
2. Click the **"Run workflow"** button
3. In the input box, type: `URL` `v/a` `resolution/bitrate` `FPS (optional)`

**Examples:**
1. https://www.youtube.com/watch?v=VIDEO_ID v max
2. https://www.youtube.com/watch?v=VIDEO_ID v 1080 60
3. https://www.youtube.com/watch?v=VIDEO_ID v 4k
4. https://www.youtube.com/watch?v=VIDEO_ID a max


- `v` = video, `a` = audio
- Resolution: `max`, `min`, `1080`, `2k`, `4k`, etc.
- FPS: optional, e.g., `60`, `30`
- If you omit `v/a`, it defaults to **video max quality**

4. Click **"Run workflow"**
5. When the workflow finishes, the output will be in the **`youtube/`** folder of your repository.

---

### Instagram Downloader

1. Go to **Actions** → Select **"instagram-downloader"**
2. Click **"Run workflow"**
3. In the input box, paste your Instagram links – **separated by commas, spaces, or newlines**

**Example:**
https://www.instagram.com/p/DX2y7oLDFOb/, https://www.instagram.com/reel/DVRXhn0gjL3/, https://www.instagram.com/p/DX6US4uCNGb/


4. Click **"Run workflow"**
5. When finished, the output ZIP will appear in the **`instagram/`** folder of your repository.

> 💡 **Tip:** You can paste up to 10+ links at once – the downloader processes them all and bundles them into a single ZIP file.

---

### Direct Downloader

1. Go to **Actions** → Select **"direct-downloader"**
2. Click **"Run workflow"**
3. Paste any direct download URL (e.g., a `.zip`, `.mp4`, `.apk`, `.pdf`, etc.)

**Example:**
https://example.com/path/to/large-file.zip


4. Click **"Run workflow"**
5. The file will be downloaded with 16 parallel connections and uploaded to the **`direct/`** folder of your repository, split into 99 MB parts if needed.

---

## 📁 Output Folder Structure
your-repository/
├── youtube/
│ └── Video Title.mp4.zip ← YouTube downloads (split into parts if > 99 MB)
├── instagram/
│ └── instagram-contents-YYYYMMDD_HHMMSS.zip ← All Instagram content bundled together
├── direct/
│ └── filename.zip ← Direct downloads (split into parts if > 99 MB)


### Inside the Instagram ZIP

When you open the Instagram ZIP, you'll see:
instagram-content/
├── instagram_moruhiko_388851...jpg
├── instagram_moruhiko_388851...jpg
├── instagram_israelinpersian_...webp
├── instagram_meme.azaad_...mp4
└── ...


All files are flattened into a single folder for easy browsing. Filenames are prefixed with the uploader's username to avoid collisions.

---

## ⏱️ Limitations

- **GitHub Free Tier** allows up to **6 hours per job** (public repos get **unlimited minutes**).
- Files larger than **99 MB** are automatically split into multi-part ZIP archives (`.z01`, `.z02`, ...). You need a tool like **7-Zip** or **WinRAR** to extract them.
- For very large Instagram batches, consider splitting them into smaller groups to avoid hitting GitHub's storage limits.

---

## 📄 License

MIT License

Copyright (c) 2025 ProAlit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<hr style="border-top: 3px solid #333;">

# راهنمای فارسی

## aio-downloader — دانلودر همه‌کاره با GitHub Actions

> مجموعه‌ای از **گردش‌کارهای GitHub Actions** که به شما امکان می‌دهند ویدیوها، تصاویر و فایل‌ها را از **یوتیوب**، **اینستاگرام** و **هر لینک مستقیم** — مستقیماً از مرورگر خود و **بدون اجرای هیچ نرم‌افزاری روی کامپیوترتان** دانلود کنید.

---

## 🌟 ویژگی‌ها

| گردش‌کار | کاربرد |
|----------|--------|
| **دانلودر یوتیوب** | دانلود ویدیوهای یوتیوب با رزولوشن دلخواه (از جمله 4K) و انتخاب FPS. پشتیبانی از حالت فقط-ویدیو و فقط-صدا. |
| **دانلودر اینستاگرام** | دانلود **تمام محتوا** از پست‌ها، ریلزها، استوری‌ها، هایلایت‌ها و پروفایل‌های اینستاگرام — شامل کاروسل‌های ترکیبی (عکس + ویدیو). |
| **دانلودر مستقیم** | دانلود **هر فایلی** از یک لینک مستقیم با `aria2c` (16 اتصال موازی، بسیار سریع). مناسب برای فایل‌های حجیم. |

✅ **تمام دانلودها به‌طور خودکار به قطعات ۹۹ مگابایتی تقسیم، فشرده و در مخزن شما آپلود می‌شوند** — هر زمان می‌توانید آن‌ها را از GitHub دانلود کنید.

✅ **بدون نیاز به سرور، VPS یا نصب نرم‌افزار** — همه چیز روی زیرساخت رایگان GitHub اجرا می‌شود.

✅ **کوکی‌ها به‌صورت امن در GitHub Secrets ذخیره می‌شوند** — هرگز در لاگ‌ها یا کد نمایش داده نمی‌شوند.

✅ **دانلود دسته‌جمعی** — تا ۱۰+ لینک اینستاگرام را همزمان (با کاما، فاصله یا خط جدید جدا کنید) بچسبانید.

---

## 🔧 پیش‌نیازها (قبل از شروع)

- یک **حساب GitHub** (رایگان)
- یک **مرورگر** (Chrome/Firefox/Edge) با افزونه **"Get cookies.txt LOCALLY"** برای استخراج کوکی‌های ورود
- (اختیاری) یک **حساب اینستاگرام** اگر می‌خواهید محتوای خصوصی/استوری دانلود کنید

---

## 🍴 نحوه فورک کردن و راه‌اندازی

### مرحله ۱: فورک کردن مخزن

روی دکمه **"Fork"** در بالای صفحه کلیک کنید.

### مرحله ۲: فعال کردن GitHub Actions

1. به مخزن فورک‌شده خود بروید → **Settings** → **Actions** → **General**
2. در بخش **"Actions permissions"** گزینه **"Allow all actions and reusable workflows"** را انتخاب کنید.
3. روی **Save** کلیک کنید.

### مرحله ۳: دادن دسترسی نوشتن به GitHub Actions (مهم!)

1. همچنان در **Settings** → **Actions** → **General** بمانید.
2. به بخش **"Workflow permissions"** بروید.
3. گزینه **"Read and write permissions"** را انتخاب کنید.  
   (گردش‌کارها برای commit کردن و push کردن فایل‌های دانلود شده به این دسترسی نیاز دارند.)
4. روی **Save** کلیک کنید.

> ⚠️ اگر این مرحله را انجام ندهید، گردش‌کار هنگام تلاش برای آپلود فایل‌های ZIP شکست خواهد خورد.

---

## 🍪 نحوه اضافه کردن کوکی‌ها (برای یوتیوب و اینستاگرام)

> **توجه:** یوتیوب و اینستاگرام اغلب برای دسترسی به محتوای خاص (مثلاً ویدیوهای خصوصی، استوری‌ها، هایلایت‌ها) به کوکی‌های ورود نیاز دارند. اگر فقط محتوای عمومی دانلود می‌کنید، می‌توانید این مرحله را نادیده بگیرید.

### ۱. استخراج کوکی‌ها از مرورگر

- افزونه **"Get cookies.txt LOCALLY"** را از فروشگاه Chrome یا Firefox نصب کنید.
- در مرورگر خود وارد **youtube.com** (برای دانلودر یوتیوب) یا **instagram.com** (برای دانلودر اینستاگرام) شوید.
- روی آیکون افزونه کلیک کنید و **"Export"** (فرمت Netscape) را انتخاب کنید.
- فایل `.txt` را در جای امنی ذخیره کنید.

### ۲. اضافه کردن کوکی‌ها به عنوان GitHub Secrets

1. در مخزن فورک‌شده، به **Settings** → **Secrets and variables** → **Actions** بروید.
2. روی **"New repository secret"** کلیک کنید.
3. یک secret با نام **`YOUTUBE_COOKIES`** بسازید و محتوای کامل فایل `cookies.txt` یوتیوب را در آن بچسبانید.
4. یک secret دیگر با نام **`INSTAGRAM_COOKIES`** بسازید و محتوای فایل `cookies.txt` اینستاگرام را در آن بچسبانید.

> ⚠️ **هرگز فایل‌های کوکی را مستقیماً در مخزن commit نکنید.** گردش‌کار به‌طور خودکار آن‌ها را از secrets خوانده و یک فایل موقت در زمان اجرا ایجاد می‌کند.

---

## 🚀 نحوه استفاده

### دانلودر یوتیوب

1. به مخزن فورک‌شده خود بروید → **Actions** → **"youtube-downloader"** را انتخاب کنید.
2. روی دکمه **"Run workflow"** کلیک کنید.
3. در کادر ورودی، تایپ کنید: `لینک` `v/a` `رزولوشن/بیت‌ریت` `FPS (اختیاری)`

**مثال‌ها:**
1. https://www.youtube.com/watch?v=VIDEO_ID v max
2. https://www.youtube.com/watch?v=VIDEO_ID v 1080 60
3. https://www.youtube.com/watch?v=VIDEO_ID v 4k
4. https://www.youtube.com/watch?v=VIDEO_ID a max


- `v` = ویدیو، `a` = صدا
- رزولوشن: `max`، `min`، `1080`، `2k`، `4k` و غیره.
- FPS: اختیاری، مثلاً `60`، `30`
- اگر `v/a` را وارد نکنید، به‌طور پیش‌فرض **حداکثر کیفیت ویدیو** انتخاب می‌شود.

4. روی **"Run workflow"** کلیک کنید.
5. پس از اتمام، خروجی در پوشه **`youtube/`** مخزن شما قرار می‌گیرد.

---

### دانلودر اینستاگرام

1. به **Actions** بروید → **"instagram-downloader"** را انتخاب کنید.
2. روی **"Run workflow"** کلیک کنید.
3. در کادر ورودی، لینک‌های اینستاگرام خود را — **با کاما، فاصله یا خط جدید جدا کنید** — بچسبانید.

**مثال:**
https://www.instagram.com/p/DX2y7oLDFOb/, https://www.instagram.com/reel/DVRXhn0gjL3/, https://www.instagram.com/p/DX6US4uCNGb/


4. روی **"Run workflow"** کلیک کنید.
5. پس از اتمام، فایل ZIP خروجی در پوشه **`instagram/`** مخزن شما ظاهر می‌شود.

> 💡 **نکته:** می‌توانید تا ۱۰+ لینک را همزمان بچسبانید — دانلودر همه را پردازش کرده و در یک فایل ZIP واحد بسته‌بندی می‌کند.

---

### دانلودر مستقیم

1. به **Actions** بروید → **"direct-downloader"** را انتخاب کنید.
2. روی **"Run workflow"** کلیک کنید.
3. هر لینک دانلود مستقیم را بچسبانید (مثلاً `.zip`، `.mp4`، `.apk`، `.pdf` و غیره).

**مثال:**
https://example.com/path/to/large-file.zip


4. روی **"Run workflow"** کلیک کنید.
5. فایل با ۱۶ اتصال موازی دانلود و در پوشه **`direct/`** مخزن شما آپلود می‌شود (در صورت نیاز به قطعات ۹۹ مگابایتی تقسیم می‌شود).

---

## 📁 ساختار پوشه خروجی
your-repository/
├── youtube/
│ └── Video Title.mp4.zip ← دانلودهای یوتیوب (در صورت > 99MB به قطعات تقسیم می‌شوند)
├── instagram/
│ └── instagram-contents-YYYYMMDD_HHMMSS.zip ← تمام محتوای اینستاگرام در یک ZIP
├── direct/
│ └── filename.zip ← دانلودهای مستقیم (در صورت > 99MB به قطعات تقسیم می‌شوند)


### داخل ZIP اینستاگرام

هنگام باز کردن ZIP اینستاگرام، خواهید دید:
instagram-content/
├── instagram_moruhiko_388851...jpg
├── instagram_moruhiko_388851...jpg
├── instagram_israelinpersian_...webp
├── instagram_meme.azaad_...mp4
└── ...


تمام فایل‌ها برای مرور آسان در یک پوشه واحد قرار می‌گیرند. نام فایل‌ها با نام کاربری آپلودکننده پیشوندگذاری شده تا از تداخل جلوگیری شود.

---

## ⏱️ محدودیت‌ها

- **طرح رایگان GitHub** تا **۶ ساعت برای هر کار (job)** اجازه می‌دهد (مخازن عمومی **دقیقه نامحدود** دارند).
- فایل‌های بزرگتر از **۹۹ مگابایت** به‌طور خودکار به آرشیوهای ZIP چندبخشی (`.z01`, `.z02`, ...) تقسیم می‌شوند. برای استخراج به نرم‌افزاری مانند **7-Zip** یا **WinRAR** نیاز دارید.
- برای دسته‌های بسیار بزرگ اینستاگرام، آن‌ها را به گروه‌های کوچک‌تر تقسیم کنید تا از محدودیت‌های ذخیره‌سازی GitHub فراتر نروید.

---

## 📄 مجوز (License)

MIT License

کپی‌رایت (c) 2025 ProAlit

بدین‌وسیله به هر شخصی که یک کپی از این نرم‌افزار و فایل‌های مستندات همراه آن («نرم‌افزار») را دریافت می‌کند، به‌طور رایگان و بدون محدودیت اجازه داده می‌شود که از نرم‌افزار استفاده کند، آن را کپی، ویرایش، ادغام، منتشر، توزیع، زیرمجوز دهد و / یا بفروشد، و به افرادی که نرم‌افزار به آن‌ها ارائه می‌شود اجازه انجام آن را بدهد، مشروط بر رعایت شرایط زیر:

اعلان کپی‌رایت فوق و این اعلان مجوز باید در تمام کپی‌ها یا بخش‌های عمده نرم‌افزار گنجانده شود.

نرم‌افزار «همان‌گونه که هست» ارائه می‌شود، بدون هیچ‌گونه ضمانتی، صریح یا ضمنی، شامل اما نه محدود به ضمانت‌های تجاری بودن، تناسب برای یک هدف خاص و عدم نقض حقوق. در هیچ صورت نویسندگان یا دارندگان کپی‌رایت در قبال هرگونه ادعا، خسارت یا مسئولیت دیگری که از استفاده یا در ارتباط با نرم‌افزار ناشی شود، مسئول نخواهند بود.

---

## ⭐ اگر این پروژه را دوست دارید

لطفاً به مخزن **ستاره** ⭐ بدهید — این کار به دیگران کمک می‌کند آن را پیدا کنند!

---

## 🐛 مشکلات و مشارکت‌ها

باگی پیدا کردید؟ پیشنهادی دارید؟ [یک issue باز کنید](https://github.com/ProAlit/aio-downloader/issues) — بازخورد همیشه خوش‌آمد است!
