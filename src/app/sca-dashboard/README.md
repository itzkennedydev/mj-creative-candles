# SCA Dashboard - Standalone UI Components Package

This package contains all the UI components, layouts, and pages needed to add the SCA Dashboard to any Next.js project.

## 📁 Folder Structure

```
sca-dashboard/
├── components/
│   ├── ui/              # Core UI components (buttons, modals, forms, etc.)
│   └── layout/          # Layout components (MainNav, Sidebar, etc.)
├── pages/
│   └── dashboard/       # Dashboard page examples
├── config/
│   └── tailwind.config.ts  # Tailwind configuration
├── styles/
│   ├── themes.css       # Theme CSS variables
│   └── ui.css          # UI component styles
├── hooks.ts            # React hooks (useMediaQuery, useRouterStuff, useLocalStorage)
├── utils.ts            # Utility functions (cn, createHref, getSearchParams)
├── plan-capabilities.ts # Plan feature flags
├── package.json         # Dependencies list
├── update-imports.sh    # Script to update import paths
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Copy to Your Project

Copy the entire `sca-dashboard` folder into your Next.js project:

```bash
cp -r sca-dashboard /path/to/your/project/components/
```

### 2. Update Import Paths

**Important:** Run the import update script to fix all import paths:

```bash
cd /path/to/your/project/components/sca-dashboard
./update-imports.sh
```

Or manually update paths using the guide in `UPDATE_IMPORTS.md`.

### 3. Install Dependencies

```bash
npm install
# Install all dependencies from package.json
```

### 4. Configure Tailwind CSS

Update your `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";
import dashboardConfig from "./components/sca-dashboard/config/tailwind.config";

const config: Config = {
  ...dashboardConfig,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/sca-dashboard/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
```

### 5. Import Styles

Add to your `app/globals.css`:

```css
@import "../components/sca-dashboard/styles/themes.css";
@import "../components/sca-dashboard/styles/ui.css";
```

### 6. Set Up Path Aliases (Optional but Recommended)

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@sca/ui": ["./components/sca-dashboard/components/ui"],
      "@sca/ui/*": ["./components/sca-dashboard/components/ui/*"],
      "@sca/layout": ["./components/sca-dashboard/components/layout"],
      "@sca/layout/*": ["./components/sca-dashboard/components/layout/*"],
      "@sca/hooks": ["./components/sca-dashboard/hooks"],
      "@sca/utils": ["./components/sca-dashboard/utils"]
    }
  }
}
```

### 7. Use the Dashboard

Create a dashboard page:

```typescript
// app/dashboard/page.tsx
import { MainNav } from "@/components/sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "@/components/sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "@/components/sca-dashboard/components/layout/sidebar/help-button";
import { ReferButton } from "@/components/sca-dashboard/components/layout/sidebar/refer-button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <MainNav
        sidebar={AppSidebarNav}
        toolContent={
          <>
            <ReferButton />
            <HelpButton />
          </>
        }
      >
        <div className="px-6 py-8 space-y-8">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Your dashboard content here
            </p>
          </header>
          {/* Your dashboard content */}
        </div>
      </MainNav>
    </div>
  );
}
```

## 📦 Key Files

### Hooks (`hooks.ts`)
- `useMediaQuery()` - Responsive design hook
- `useRouterStuff()` - Next.js router utilities
- `useLocalStorage()` - Local storage hook

### Utils (`utils.ts`)
- `cn()` - Classname utility (clsx + tailwind-merge)
- `createHref()` - URL helper function
- `getSearchParams()` - Parse URL search params

### Plan Capabilities (`plan-capabilities.ts`)
- `getPlanCapabilities()` - Feature flags based on plan type

## 🔧 Required Utilities

Make sure these are available in your project:

1. **clsx** and **tailwind-merge** (for `cn` function)
2. **next/navigation** (for router hooks)
3. **lucide-react** (for icons)

## 📝 Import Path Updates

After copying, you **must** update import paths. The `update-imports.sh` script will:
- Convert `@sca/ui` → relative paths
- Convert `@sca/utils` → relative paths  
- Convert `@/lib` → relative paths
- Convert `@/ui` → relative paths

See `UPDATE_IMPORTS.md` for detailed instructions.

## 🎨 Customization

### Colors & Themes

Edit `styles/themes.css` to customize colors:

```css
:root {
  --bg-default: 255 255 255;
  --content-default: 64 64 64;
  /* ... */
}
```

### Fonts

Add font variables to your root layout:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});
```

## 🐛 Troubleshooting

**Import errors?**
- Run `./update-imports.sh` to fix paths
- Check path aliases in `tsconfig.json`
- Verify relative paths match your folder structure

**Styles not loading?**
- Ensure Tailwind config includes dashboard paths
- Check CSS imports are in correct order
- Verify `content` paths in `tailwind.config.ts`

**Hooks not found?**
- Make sure `hooks.ts` is in the dashboard root
- Check imports use `../../hooks` from layout components
- Verify Next.js navigation hooks are available

## 📄 Files That Need Manual Review

After running the update script, check these files:
- `components/layout/sidebar/sidebar-nav.tsx` - May need hook imports
- `components/layout/sidebar/user-dropdown.tsx` - May need auth utilities
- Any files importing from `@/lib` - May need custom implementations

## 📚 Additional Documentation

- `QUICK_START.md` - 5-minute setup guide
- `SETUP.md` - Detailed setup checklist
- `UPDATE_IMPORTS.md` - Import path update guide
- `IMPORT_PATHS.md` - Path mapping reference

## 📄 License

This package is part of the SCA Dashboard project. Check the main LICENSE file for details.
