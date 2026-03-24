import { defineConfig } from "vitepress";

export default defineConfig({
  title: "ferman",
  description: "Inspect ports, identify processes, and free busy ports with predictable CLI output.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  base: "/ferman/",
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "ferman",
    nav: [
      { text: "Guide", link: "/" },
      { text: "Vitest", link: "/vitest" },
      { text: "GitHub", link: "https://github.com/borakilicoglu/ferman" },
      { text: "npm", link: "https://www.npmjs.com/package/ferman" }
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/borakilicoglu/ferman" }],
    footer: {
      message: "The hands of AI.",
      copyright: "MIT Licensed"
    },
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Overview", link: "/" },
          { text: "Vitest", link: "/vitest" }
        ]
      }
    ]
  }
});
