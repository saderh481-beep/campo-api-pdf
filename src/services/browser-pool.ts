import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { config } from "../config/index.ts";
import { createRequestLogger } from "../utils/logger.ts";

interface PooledPage {
  page: Page;
  inUse: boolean;
  createdAt: number;
  lastUsedAt: number;
}

class BrowserPool {
  private browser: Browser | null = null;
  private pages: PooledPage[] = [];
  private initPromise: Promise<void> | null = null;
  private initResolve: (() => void) | null = null;

  async initialize(): Promise<void> {
    if (this.browser) return;

    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = new Promise((resolve) => {
      this.initResolve = resolve;
    });

    try {
      const log = createRequestLogger("browser-pool-init");
      log.info("Initializing browser pool...");

      const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
          "--font-render-hinting=none",
          "--disable-libreoffice",
          "--disable-extensions",
          "--disable-background-networking",
          "--disable-default-apps",
          "--disable-sync",
          "--disable-translate",
          "--no-first-run",
          "--single-process",
          "--memory-pressure-off",
          "--ignore-certificate-errors",
          "--ignore-ssl-errors",
        ],
      };

      if (config.CHROMIUM_PATH) {
        launchOptions.executablePath = config.CHROMIUM_PATH;
      } else {
        try {
          const chromiumMin = await import("@sparticuz/chromium-min");
          // @ts-expect-error - chromium-min types
          const chromePath = process.env.CHROMIUM_PATH || (chromiumMin.executablePath as () => string)();
          if (chromePath) {
            launchOptions.executablePath = chromePath;
          }
        } catch {
          // @sparticuz/chromium-min not available in dev
        }
      }

      this.browser = await puppeteer.launch(launchOptions);

      // Pre-create pages
      for (let i = 0; i < config.BROWSER_MAX_PAGES; i++) {
        const page = await this.browser.newPage();
        await page.setContent("<html><body></body></html>");
        this.pages.push({
          page,
          inUse: false,
          createdAt: Date.now(),
          lastUsedAt: Date.now(),
        });
        // Clean up the page
        await page.evaluate(() => {
          document.body.innerHTML = "";
        });
      }

      log.info({ pageCount: this.pages.length }, "Browser pool initialized");
      this.initResolve?.();
    } catch (error) {
      this.initResolve?.();
      throw error;
    }
  }

  async acquirePage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    // Find available page
    const availablePage = this.pages.find((p) => !p.inUse);
    if (availablePage) {
      availablePage.inUse = true;
      availablePage.lastUsedAt = Date.now();
      await this.resetPage(availablePage.page);
      return availablePage.page;
    }

    // All pages in use - create new if under limit
    if (this.pages.length < config.BROWSER_MAX_PAGES * 2) {
      const newPage = await this.browser!.newPage();
      const pooledPage: PooledPage = {
        page: newPage,
        inUse: true,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      };
      this.pages.push(pooledPage);
      return newPage;
    }

    // Wait for available page
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.acquirePage();
  }

  async releasePage(page: Page): Promise<void> {
    const pooledPage = this.pages.find((p) => p.page === page);
    if (pooledPage) {
      pooledPage.inUse = false;
      pooledPage.lastUsedAt = Date.now();
    }
  }

  private async resetPage(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        document.body.innerHTML = "";
        document.body.style.cssText = "";
      });
      await page.setContent("<html><body></body></html>", { waitUntil: "domcontentloaded" });
    } catch {
      // Page might be closed, ignore
    }
  }

  async closePage(page: Page): Promise<void> {
    try {
      await page.close();
    } catch {
      // Page might already be closed
    }

    const index = this.pages.findIndex((p) => p.page === page);
    if (index !== -1) {
      this.pages.splice(index, 1);
    }
  }

  async close(): Promise<void> {
    if (!this.browser) return;

    for (const pooledPage of this.pages) {
      try {
        await pooledPage.page.close();
      } catch {
        // Ignore
      }
    }
    this.pages = [];

    try {
      await this.browser.close();
    } catch {
      // Ignore
    }
    this.browser = null;
  }

  getStats(): { total: number; available: number; inUse: number } {
    const total = this.pages.length;
    const inUse = this.pages.filter((p) => p.inUse).length;
    return {
      total,
      available: total - inUse,
      inUse,
    };
  }

  isReady(): boolean {
    return this.browser !== null && this.browser.connected;
  }

  async testPage(): Promise<boolean> {
    if (!this.browser || !this.browser.connected) return false;

    try {
      const page = await this.browser.newPage();
      await page.close();
      return true;
    } catch {
      return false;
    }
  }
}

export const browserPool = new BrowserPool();