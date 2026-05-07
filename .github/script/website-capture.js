const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const TurndownService = require('turndown');
const fs = require('fs').promises;
const path = require('path');

const inputUrl = process.argv[2];
if (!inputUrl) {
  console.error('No URL provided');
  process.exit(1);
}

// Read output type from env (default 'both' for backward compatibility)
const outputType = process.env.OUTPUT_TYPE || 'both';
if (!['pdf', 'md', 'both'].includes(outputType)) {
  console.error('Invalid output type. Must be pdf, md, or both.');
  process.exit(1);
}

const WANT_PDF = outputType === 'pdf' || outputType === 'both';
const WANT_MD  = outputType === 'md'  || outputType === 'both';

const MAX_LINKS = 20;
const MAX_MEDIA_PER_PAGE = 30;
const VIEWPORT = { width: 1280, height: 720 };

// ---------- turndown (only needed if MD requested) ----------
let turndownService = null;
if (WANT_MD) {
  turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**'
  });
  // Keep image alt text and src
  turndownService.addRule('images', {
    filter: ['img'],
    replacement: (content, node) => {
      const alt = node.getAttribute('alt') || '';
      const src = node.getAttribute('src') || '';
      return `![${alt}](${src})`;
    }
  });
}

// ---------- random 5 lowercase letters ----------
function randomFiveLetters() {
  return Array.from({ length: 5 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join('');
}

// ---------- wait for page to be fully loaded ----------
async function waitForStable(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
    console.warn('Network did not become fully idle – continuing…');
  });
}

// ---------- download media (only for MD mode) ----------
async function downloadMedia(url, contentDir, prefix, counter) {
  if (!WANT_MD) return null;   // safety guard
  try {
    const extMatch = url.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg|mov)(\?.*)?$/i);
    let ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    if (ext === 'jpeg') ext = 'jpg';
    const fileName = `${prefix}_${counter}.${ext}`;
    const filePath = path.join(contentDir, fileName);

    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.mkdir(contentDir, { recursive: true });
    await fs.writeFile(filePath, buffer);
    return `website/content/${fileName}`;   // relative path for markdown
  } catch (err) {
    console.warn(`    ⚠️ Failed to download ${url}: ${err.message}`);
    return null;
  }
}

// ---------- capture a URL → PDF buffer (full page) ----------
async function captureUrlPdf(context, url) {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForStable(page);

    await page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
  } catch (err) {
    console.error(`Failed to capture PDF for ${url} – ${err.message}`);
    return null;
  } finally {
    await page.close();
  }
}

// ---------- extract page content for Markdown ----------
async function capturePageMarkdown(page, url, hostname, randomStr, pageIndex) {
  if (!WANT_MD) return '';   // skip if not needed
  const title = await page.title().catch(() => url);
  const html = await page.evaluate(() => {
    const article = document.querySelector('article, main, .content, #content, .post-content');
    return article ? article.innerHTML : document.body.innerHTML;
  });

  const markdownBody = turndownService.turndown(html);

  // ---- extract and download media ----
  const mediaElements = await page.$$eval(
    'img[src], video[src], video source[src]',
    (els) => els.map(el => {
      const tag = el.tagName.toLowerCase();
      let src = '';
      if (tag === 'img') src = el.getAttribute('src');
      else src = el.getAttribute('src');
      return { src, tag };
    })
  );

  const downloadedMap = new Map();
  let counter = 0;
  for (const { src, tag } of mediaElements) {
    if (!src || !src.startsWith('http')) continue;
    if (downloadedMap.has(src)) continue;
    if (downloadedMap.size >= MAX_MEDIA_PER_PAGE) break;

    const contentDir = path.join('website', 'content');
    const prefix = `${hostname}_p${pageIndex}`;
    const localPath = await downloadMedia(src, contentDir, prefix, counter++);
    if (localPath) downloadedMap.set(src, localPath);
  }

  // Replace URLs in markdown
  let finalMarkdown = markdownBody;
  for (const [originalUrl, localPath] of downloadedMap.entries()) {
    finalMarkdown = finalMarkdown.replace(
      new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      localPath
    );
  }

  return `## ${title}\n\n> ${url}\n\n${finalMarkdown}\n\n---\n`;
}

// ---------- extract unique links from a page ----------
async function extractLinks(page) {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map(a => a.href)
      .filter(href => href.startsWith('http'));
    return [...new Set(links)];
  });
}

// ---------- main ----------
(async () => {
  console.log(`Output type selected: ${outputType} (PDF=${WANT_PDF}, MD=${WANT_MD})`);
  console.log('Launching browser…');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const hostname = new URL(inputUrl).hostname.replace(/^www\./, '');
  const randomPart = randomFiveLetters();
  const baseFilename = `${hostname}-${randomPart}`;

  // ---- Extract links (needed for both PDF and MD if we want subpages) ----
  let pageUrls = [inputUrl];
  try {
    const page = await context.newPage();
    await page.goto(inputUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForStable(page);
    const allLinks = await extractLinks(page);
    await page.close();

    const mainOrigin = new URL(inputUrl).origin;
    const uniqueLinks = [...new Set(
      allLinks
        .filter(link => link.startsWith(mainOrigin))
        .map(link => link.split('#')[0])
    )].slice(0, MAX_LINKS);

    console.log(`Found ${uniqueLinks.length} unique internal links (capped at ${MAX_LINKS})`);
    pageUrls.push(...uniqueLinks);
  } catch (err) {
    console.error('Link extraction failed, using main page only.');
  }

  // ---- PDF capture and merge (conditionally) ----
  if (WANT_PDF) {
    console.log('>>> PDF capture started <<<');
    const pdfBufs = [];
    for (const url of pageUrls) {
      console.log(`Capturing PDF for: ${url}`);
      const buf = await captureUrlPdf(context, url);
      if (buf) pdfBufs.push(buf);
    }
    if (pdfBufs.length > 0) {
      const mergedPdf = await PDFDocument.create();
      for (const buf of pdfBufs) {
        const srcDoc = await PDFDocument.load(buf);
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach(p => mergedPdf.addPage(p));
      }
      const finalPdfBytes = await mergedPdf.save();
      await fs.writeFile('output.pdf', finalPdfBytes);
      console.log('PDF saved: output.pdf');
    } else {
      console.error('No PDF pages captured – PDF output skipped.');
    }
  }

  // ---- Markdown capture (conditionally) ----
  if (WANT_MD) {
    console.log('>>> Markdown extraction started <<<');
    let combinedMarkdown = '';
    for (let i = 0; i < pageUrls.length; i++) {
      const url = pageUrls[i];
      console.log(`Extracting Markdown for: ${url}`);
      const mdPage = await context.newPage();
      try {
        await mdPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitForStable(mdPage);
        const mdSection = await capturePageMarkdown(mdPage, url, hostname, randomPart, i);
        combinedMarkdown += mdSection;
      } catch (err) {
        console.error(`Failed to extract Markdown for ${url} – ${err.message}`);
      } finally {
        await mdPage.close();
      }
    }
    await fs.writeFile('output.md', combinedMarkdown);
    console.log('Markdown saved: output.md');
  }

  // ---- Export the base filename for the upload step ----
  await fs.appendFile(process.env.GITHUB_ENV, `FILENAME=${baseFilename}\n`);

  await context.close();
  await browser.close();
  console.log('Done.');
})();
