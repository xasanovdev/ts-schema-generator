import { useState, useCallback, useRef } from "react";

const CHAPTERS = [
    {
        id: 1,
        title: "Why MFE Exists",
        subtitle: "The problems that gave birth to micro frontends",
        icon: "🧱",
        content: `## The Monolith Wall

**Mental Model:** Imagine a massive mural painted on a single wall. If one painter makes a mistake, the whole wall needs to be repainted. If two painters want to work on different corners simultaneously, they constantly bump elbows. That wall is your monolith frontend.

### The Concrete Problems

**1. Deployment Coupling**
In a monolith, every team merges into the same repository and ships via the same pipeline. Team A's innocent CSS fix blocks Team B's critical feature because the shared CI is broken. Deploys become weekly ceremonies of fear.

**2. Scaling Teams, Not Code**
When your frontend grows from 5 to 50 developers, the monolith doesn't get faster — it gets slower. Build times balloon. PR review bottlenecks form. Every developer must understand the entire application's mental model just to change a button.

**3. Technology Lock-in**
You started with Angular 1. Now Angular 17 exists, but migrating the monolith is a multi-year initiative. Meanwhile, half your team wants React, and the new hire only knows Vue. In a monolith, everyone must agree on one stack — forever.

**4. Ownership Ambiguity**
When everything lives in one codebase, who owns the shared header? The utils folder? The auth module? Ownership dissolves into "everyone and no one," and code quality degrades.

### What Happens at the Network Level in a Monolith

The browser requests \`index.html\`, which loads a single massive JS bundle (or a few code-split chunks from ONE build). That bundle contains ALL features, ALL routes, ALL UI. Even with lazy loading, the build system that produces those chunks is singular. One build. One deploy. One point of failure.

### When NOT to Use MFE

MFE adds real complexity. Avoid it when:

- **Small team (< 8–10 frontend developers):** The coordination overhead isn't worth it. A well-structured monolith with clear module boundaries is simpler and faster.
- **Single product domain:** If your app is conceptually one thing (a calculator, a blog editor), splitting it into micro apps creates artificial boundaries.
- **Prototyping or MVPs:** Speed matters more than architecture. Ship the monolith. Refactor later.
- **No independent deploy need:** If all your features ship together anyway, MFE just adds network hops for no gain.
- **Performance-critical apps:** Each micro app adds bundle overhead (duplicate runtime code, extra HTTP requests). If every kilobyte matters, think twice.

**The Rule of Thumb:** MFE solves organizational problems (team autonomy, independent deploys) more than technical ones. If you don't have an org scaling problem, you don't need MFE.`,
        code: `// Monolith: ONE build, everything coupled
// package.json — everything lives here
{
  "name": "mega-frontend",
  "dependencies": {
    "react": "^18.2.0",
    "team-a-feature": "internal",
    "team-b-feature": "internal",
    "team-c-feature": "internal",
    "shared-components": "internal"
  },
  "scripts": {
    // One build command. If it fails, nobody ships.
    "build": "vite build",
    // One deploy. All or nothing.
    "deploy": "aws s3 sync dist/ s3://our-app"
  }
}

// vs. MFE: Each team owns their build & deploy
// team-a/package.json
{
  "name": "team-a-checkout",
  "scripts": {
    "build": "vite build",
    "deploy": "aws s3 sync dist/ s3://team-a-checkout"
  }
}`,
        mistakes: [
            "Adopting MFE for a 3-person team — you'll spend more time on infrastructure than features",
            "Thinking MFE fixes bad code — it just distributes bad code across more repos",
            "Not establishing clear domain boundaries first — if you can't draw boxes around features, MFE will create a distributed monolith",
        ],
        quiz: {
            question:
                "Your company has 4 frontend developers, one product (a dashboard), and deploys weekly. A tech lead proposes MFE to 'modernize.' What's your response?",
            options: [
                "Great idea — MFE is always better than monoliths",
                "Push back — the team is too small and there's no org scaling problem to solve. Invest in better module boundaries within the monolith instead.",
                "Agree but only use iframes",
                "Suggest rewriting everything in Web Components first",
            ],
            correct: 1,
            explanation:
                "MFE solves organizational scaling problems. With 4 devs and one product, the coordination overhead of MFE (shared dependency management, cross-app routing, deployment infrastructure) would slow you down. A monolith with clean module boundaries serves this team better.",
        },
    },
    {
        id: 2,
        title: "MFE Approaches Compared",
        subtitle: "Five strategies, each with sharp trade-offs",
        icon: "⚖️",
        content: `## The Toolbox

**Mental Model:** Think of building a city. You need buildings (micro apps) to coexist on shared land (the browser). You can:
1. Put each building in a glass box (iframe)
2. Pre-fabricate them offsite and truck them in (npm packages)
3. Connect them with sky bridges at runtime (Module Federation)
4. Give each building a shared address system (import maps)
5. Build with universal Lego bricks (Web Components)

---

### 1. Iframes — The Glass Box

**How it works:** Each micro app is a fully independent web page loaded inside an \`<iframe>\`. Total isolation.

**At the browser level:** The browser creates a separate browsing context — its own DOM, its own JS execution context, its own CSS cascade. It's literally a page within a page.

**Pros:**
- Perfect isolation — nothing leaks (CSS, JS, globals)
- Any framework, any version, zero conflicts
- Dead simple to implement

**Cons:**
- No shared dependencies (React loaded N times)
- Communication is painful (postMessage only)
- Routing is broken (back button, deep links don't work naturally)
- Accessibility nightmares (screen readers struggle with nested documents)
- Performance: N separate pages = N separate asset downloads
- Responsive design is extremely hard (iframe can't easily adapt to parent layout)

**Verdict:** Use only for truly isolated widgets (embedded third-party content, chat widgets). Not viable for a real MFE architecture.

---

### 2. NPM Packages — The Pre-Fab Approach

**How it works:** Each micro app is published as an npm package. The shell app installs them all and builds everything together.

**At the browser level:** It's indistinguishable from a monolith. One build, one bundle (or code-split chunks from one build).

**Pros:**
- Type safety across boundaries
- Shared dependencies are natural (one copy of React)
- Familiar tooling, no new concepts

**Cons:**
- NOT independent deployment — changing one micro app requires rebuilding the shell
- Version coordination is manual and error-prone
- Doesn't solve the core problem — it's still a monolith at build time

**Verdict:** Good for shared component libraries. Not a true MFE solution because it fails the independent deployment test.

---

### 3. Module Federation — The Sky Bridges

**How it works:** Webpack/Vite builds each app separately, but at runtime one app can dynamically import modules from another app's live deployment.

**At the browser level:** The host app fetches a manifest file (remoteEntry.js) from the remote's CDN, which tells it what modules are available and how to load them. Shared dependencies are negotiated at runtime.

**Pros:**
- True independent deployment
- Shared dependencies (single copy of React possible)
- Framework-agnostic (in theory)
- Works with existing build tools
- Fine-grained: share a single component or an entire app

**Cons:**
- Complex configuration
- Runtime errors instead of build-time errors (no type checking across boundaries)
- Debugging is harder (source maps across origins)
- Tight coupling to the build tool (Webpack or Vite plugin)
- Shared dependency negotiation can fail silently

**Verdict:** The most popular MFE approach for React/Vite/Webpack teams. High reward, high complexity.

---

### 4. Import Maps — The Shared Address System

**How it works:** A native browser feature that lets you map bare module specifiers (like "react") to URLs. Each micro app is deployed as ES modules on a CDN, and the import map tells the browser where to find them.

**At the browser level:** When the browser encounters \`import React from "react"\`, it consults the import map to resolve the URL, then fetches the ES module. No bundler needed at runtime.

**Pros:**
- Native browser feature — no framework lock-in
- Shared dependencies via a single import map
- Works with single-spa framework
- No build tool coupling

**Cons:**
- Browser support gaps (needs polyfill for older browsers)
- No built-in dependency version negotiation (you manage it manually)
- ES modules only — CommonJS won't work
- Dev experience is rougher (no HMR out of the box)

**Verdict:** Elegant and standards-based. Pairs well with single-spa. Less magic than Module Federation but more manual wiring.

---

### 5. Web Components — The Universal Lego Bricks

**How it works:** Each micro app exposes Custom Elements. The shell renders them as standard HTML tags. Shadow DOM provides style isolation.

**At the browser level:** The browser registers custom elements in its CustomElementRegistry. When it encounters \`<checkout-app></checkout-app>\`, it instantiates the class and attaches Shadow DOM.

**Pros:**
- Framework agnostic — truly works everywhere
- Native browser API — no library needed
- Shadow DOM gives free CSS isolation
- Works with any loading strategy

**Cons:**
- React's relationship with Web Components is awkward (event handling, props vs attributes)
- Shadow DOM makes theming hard (CSS custom properties must punch through)
- Lifecycle management is manual
- SSR support is weak
- Each component still needs to ship its framework runtime

**Verdict:** Best when teams use different frameworks. The React interop story has improved but still has friction.`,
        code: `// === 1. IFRAME APPROACH ===
// Shell app — drops in isolated micro apps
<iframe 
  src="https://checkout.myapp.com" 
  style={{ width: '100%', height: '600px', border: 'none' }}
/>
// Communication via postMessage (painful)
window.addEventListener('message', (e) => {
  if (e.origin === 'https://checkout.myapp.com') {
    console.log('Checkout said:', e.data);
  }
});

// === 2. NPM PACKAGE APPROACH ===
// Shell installs micro apps as packages
import CheckoutApp from '@myorg/checkout-app';  // npm package
import ProfileApp from '@myorg/profile-app';    // npm package
// All built together — NOT independent deployment

// === 3. MODULE FEDERATION (Vite) ===
// remote (checkout) — vite.config.js
import federation from '@originjs/vite-plugin-federation';
export default {
  plugins: [federation({
    name: 'checkout',
    filename: 'remoteEntry.js',
    exposes: { './App': './src/App.jsx' },
    shared: ['react', 'react-dom']
  })]
};

// host (shell) — vite.config.js
export default {
  plugins: [federation({
    name: 'shell',
    remotes: {
      checkout: 'https://checkout.cdn.com/remoteEntry.js'
    },
    shared: ['react', 'react-dom']
  })]
};

// === 4. IMPORT MAPS ===
// index.html — browser-native module resolution
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.2.0",
    "checkout-app": "https://cdn.myapp.com/checkout/main.js"
  }
}
</script>
<script type="module">
  import { render } from 'checkout-app';
  render(document.getElementById('checkout-root'));
</script>

// === 5. WEB COMPONENTS ===
// Checkout team defines a custom element
class CheckoutApp extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    const root = document.createElement('div');
    shadow.appendChild(root);
    // Mount React inside Shadow DOM
    ReactDOM.createRoot(root).render(<CheckoutReactApp />);
  }
}
customElements.define('checkout-app', CheckoutApp);

// Shell just uses it like HTML
<checkout-app user-id="123"></checkout-app>`,
        mistakes: [
            "Choosing iframes for 'simplicity' then drowning in postMessage spaghetti and broken routing",
            "Using npm packages and calling it MFE — it's still a monolith if you can't deploy independently",
            "Mixing approaches without understanding why (e.g., Web Components wrapping Module Federation for no reason)",
        ],
        quiz: {
            question:
                "Your org has 3 teams: one uses React 18, one uses React 17, and one is migrating to Svelte. All apps must share a global navigation and deploy independently. Which approach fits best?",
            options: [
                "Module Federation with shared React",
                "NPM packages — just install all three as dependencies",
                "Web Components — each team wraps their app in a custom element, framework differences don't matter",
                "Iframes for each team's app",
            ],
            correct: 2,
            explanation:
                "Web Components are the best fit when teams use different frameworks (or different versions of the same framework). Module Federation could work but sharing React across different versions is fragile. NPM packages fail the independent deploy requirement. Iframes create too many UX problems for apps that need to share navigation.",
        },
    },
    {
        id: 3,
        title: "Module Federation Deep Dive",
        subtitle:
            "What actually happens when the browser loads a remote module",
        icon: "🔬",
        content: `## Inside the Machine

**Mental Model:** Module Federation is like a restaurant franchise system. Each restaurant (micro app) has its own kitchen (build) and menu (exposed modules). The franchise headquarters (host/shell) has a directory (remoteEntry.js) that says "if a customer wants a burger, call Restaurant A; for sushi, call Restaurant B." The franchise also negotiates bulk ingredient deals (shared dependencies) — if everyone needs flour (React), they all use the same supplier instead of each sourcing their own.

---

### What Is remoteEntry.js?

remoteEntry.js is a manifest file generated at build time. It's a small JavaScript file that, when executed, registers a "container" on the global scope. This container knows:

1. **What modules this remote exposes** — a map of module names to lazy-loading functions
2. **What shared dependencies this remote needs** — and which versions it's compatible with
3. **How to initialize** — a function that wires up the shared scope

When the browser fetches and executes remoteEntry.js, it doesn't load the actual micro app code. It only registers the capability to load it later, on demand.

**At the network level:** remoteEntry.js is typically 5–30KB. The actual chunks it references are only fetched when a specific module is requested.

---

### The Runtime Loading Sequence (Step by Step)

Here's exactly what happens when a host loads a remote:

**Step 1: Host boots up.**
The host's Webpack/Vite runtime initializes. It registers its own shared modules (React, react-dom, etc.) into a "share scope" — a global registry.

**Step 2: Host encounters a remote import.**
Your code says \`const Checkout = lazy(() => import('checkout/App'))\`. The bundler has rewritten this into a call to the Module Federation runtime.

**Step 3: The runtime fetches remoteEntry.js.**
A \`<script>\` tag (or dynamic import) loads \`https://checkout.cdn.com/remoteEntry.js\`. This executes and registers \`window.checkout\` as a container object with two key methods: \`init()\` and \`get()\`.

**Step 4: Share scope negotiation (init).**
The host calls \`container.init(shareScope)\`. This is the handshake. The remote looks at the share scope and decides: "The host already has React 18.2.0 loaded. My range (^18.0.0) is compatible. I'll use the host's copy." If the versions are incompatible, the remote loads its own bundled copy.

**Step 5: Module resolution (get).**
The host calls \`container.get('./App')\`. The container returns a factory function. When invoked, this factory triggers a dynamic import of the actual chunk containing the component.

**Step 6: Chunk download.**
The browser fetches the actual JS chunk (e.g., \`src_App_jsx.js\`) from the remote's CDN.

**Step 7: Module execution.**
The chunk executes in the browser. It uses the negotiated shared dependencies (the host's React, not its own copy). The React component is now available and renders in the host's component tree.

---

### Shared Dependencies & Singleton Mode

**"Shared" means:** Instead of each micro app bundling its own React, they negotiate at runtime to use one copy.

**How it works internally:**
The share scope is essentially a versioned registry:
\`\`\`
shareScope = {
  react: {
    "18.2.0": { get: () => Promise<module>, loaded: true, from: "host" },
    "17.0.2": { get: () => Promise<module>, loaded: false, from: "checkout-remote" }
  }
}
\`\`\`

When a remote needs React, it checks this registry. If a compatible version exists and is already loaded, it reuses it.

**Singleton mode** adds a constraint: only ONE version of this package may exist. If versions conflict, Module Federation logs a warning and forces the higher version. This is critical for React because two copies of React in one page causes the "hooks rules" error — hooks rely on a single shared React instance.

**Without singleton:** Remote A uses React 18.2, Remote B uses React 18.3. Both load their own copy. Two React runtimes exist. If a component from A passes a ref to B, it breaks.

**With singleton: true:** Only one copy loads. If versions satisfy semver ranges, the latest compatible version wins. If they're incompatible (17 vs 18), you get a console warning and undefined behavior.

---

### Share Scope — The Deeper Layer

A "share scope" is a namespace for shared dependencies. By default, everything uses the "default" scope. But you can create multiple scopes:

- **Default scope:** All remotes negotiate in the same pool. If the host has React 18, everyone uses it.
- **Custom scopes:** Isolate groups of remotes. Useful if some remotes need React 17 and others need React 18 — they negotiate in separate pools.

In practice, multiple share scopes are rare. They exist as an escape hatch for the "two React versions" problem but add significant complexity.`,
        code: `// ======================================
// WHAT remoteEntry.js LOOKS LIKE (simplified)
// ======================================

// This is auto-generated. You never write this by hand.
var checkout;
(() => {
  var moduleMap = {
    './App': () => {
      // Lazy factory — only loads the chunk when called
      return import('./src_App_jsx.js')
        .then(m => () => m);
    }
  };

  var get = (module) => {
    return moduleMap[module]();
  };

  var sharedModules = {
    'react': {
      version: '18.2.0',
      requiredVersion: '^18.0.0',
      singleton: true,
      get: () => import('./node_modules_react_index_js.js')
    }
  };

  var init = (shareScope) => {
    // Register our shared modules in the scope
    for (let [name, config] of Object.entries(sharedModules)) {
      if (!shareScope[name]) shareScope[name] = {};
      shareScope[name][config.version] = config;
    }
    // Also consume what's already in the scope
    // (use host's React if compatible)
  };

  // Register globally
  checkout = { get, init };
})();

// ======================================
// HOST LOADING SEQUENCE (what the runtime does)
// ======================================

// Step 1: Host initializes share scope
const shareScope = {};
shareScope['react'] = {
  '18.2.0': {
    get: () => Promise.resolve(() => require('react')),
    loaded: true
  }
};

// Step 2: Load remote entry
await loadScript('https://checkout.cdn.com/remoteEntry.js');

// Step 3: Initialize remote with shared scope
await window.checkout.init(shareScope);
// Remote sees: "Host has React 18.2.0, I need ^18.0.0 → compatible!"

// Step 4: Get the module
const factory = await window.checkout.get('./App');
const Module = factory();

// Step 5: Use it — it's just a regular React component now
<Suspense fallback={<Spinner />}>
  <Module.default />
</Suspense>

// ======================================
// VITE CONFIG — What YOU actually write
// ======================================

// Remote: checkout/vite.config.js
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'checkout',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx',
        './CartButton': './src/components/CartButton.jsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ],
  build: {
    target: 'esnext',  // Important for dynamic imports
    minify: false,      // Easier debugging during dev
  }
});

// Host: shell/vite.config.js
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        checkout: 'https://checkout.cdn.com/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
      }
    })
  ]
});

// Host: using the remote — it's just an import!
import { lazy, Suspense } from 'react';

const CheckoutApp = lazy(() => import('checkout/App'));

function Shell() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutApp />
    </Suspense>
  );
}`,
        mistakes: [
            "Forgetting singleton: true for React — causes 'Invalid hook call' because two React instances exist",
            "Hardcoding remoteEntry.js URLs — use environment variables so dev/staging/prod resolve differently",
            "Not wrapping remote imports in Suspense/ErrorBoundary — a network failure will crash your entire app",
            "Assuming remoteEntry.js is cached forever — it must be fetched fresh (or use versioned URLs) to pick up new deployments",
            "Not setting eager: false — eager loading shared deps defeats the purpose of lazy loading",
        ],
        quiz: {
            question:
                "The host app has React 18.2.0 with singleton: true. A remote was just deployed with React 19.0.0 and singleton: true, requiredVersion: '^19.0.0'. What happens when the host tries to load this remote?",
            options: [
                "It works fine — Module Federation auto-upgrades React",
                "The remote silently loads its own React 19 and both versions coexist peacefully",
                "Singleton mode forces one version. Since 18.2.0 doesn't satisfy ^19.0.0, you get a warning and likely runtime errors (two React instances or API incompatibilities)",
                "The build fails at compile time",
            ],
            correct: 2,
            explanation:
                "Singleton mode enforces one instance, but it can't magically resolve incompatible major versions. React 18 doesn't satisfy ^19. The runtime will log a warning and the behavior is unpredictable — the remote might try to use React 18's API where React 19 changed it. This is why version alignment across remotes is critical, and why shared dependency contracts must be enforced at the CI level, not just at runtime.",
        },
    },
    {
        id: 4,
        title: "Routing in MFE",
        subtitle: "How the shell and micro apps share the URL bar",
        icon: "🔀",
        content: `## Who Owns the URL?

**Mental Model:** Think of a shopping mall. The mall (shell) has a main directory that says "Floor 1 = Clothing, Floor 2 = Electronics." When you're on Floor 2, the Electronics store has its own internal layout — aisles for TVs, laptops, phones. The mall handles getting you to the right floor (top-level routing), and each store handles navigation within their space (nested routing).

---

### The Two-Layer Routing Model

In MFE, routing is split:

**Layer 1 — Shell Router (top-level):**
Matches broad URL patterns to micro apps.
- \`/checkout/*\` → loads Checkout remote
- \`/profile/*\` → loads Profile remote
- \`/dashboard/*\` → loads Dashboard remote

**Layer 2 — Micro App Router (nested):**
Each micro app has its own React Router that handles sub-routes.
- Checkout handles \`/checkout/cart\`, \`/checkout/payment\`, \`/checkout/confirmation\`
- Profile handles \`/profile/settings\`, \`/profile/orders\`

---

### How React Router Works Across Boundaries

The critical insight: **both routers share the same browser URL** (window.location). They must cooperate, not compete.

**Strategy 1: MemoryRouter in remotes (recommended)**
The shell uses BrowserRouter (owns the URL bar). Each remote uses MemoryRouter (in-memory, doesn't touch the URL). The shell passes the initial route to the remote, and the remote syncs route changes back via a callback.

**Why MemoryRouter?** Two BrowserRouters fighting over the URL is chaos. MemoryRouter lets the remote manage its internal navigation state without touching window.history.

**Strategy 2: basename-scoped BrowserRouter**
Each remote's BrowserRouter is scoped with a basename prop (\`basename="/checkout"\`). The shell's router handles top-level, and when it renders the Checkout micro app, Checkout's router only matches paths after \`/checkout\`.

**Risk:** Both routers still listen to popstate events. You need careful coordination to avoid double-handling back/forward navigation.

---

### What Happens at the Browser Level

1. User clicks a link to \`/checkout/payment\`
2. The shell's BrowserRouter matches \`/checkout/*\`
3. Shell lazily loads the Checkout remote (if not already loaded)
4. Checkout's MemoryRouter initializes with \`/payment\` as the initial entry
5. User navigates within checkout (\`/checkout/confirmation\`)
6. Checkout's MemoryRouter updates internally
7. Checkout calls \`onNavigate('/checkout/confirmation')\` callback
8. Shell's router updates the URL bar via \`window.history.pushState\`
9. Browser back button triggers popstate → shell router handles it → passes new path down to remote`,
        code: `// ==========================================
// SHELL — owns the URL bar (BrowserRouter)
// ==========================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const CheckoutApp = lazy(() => import('checkout/App'));
const ProfileApp = lazy(() => import('profile/App'));

function Shell() {
  return (
    <BrowserRouter>
      <GlobalNav />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/checkout/*" element={<CheckoutWrapper />} />
          <Route path="/profile/*" element={<ProfileWrapper />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// The wrapper mediates between shell routing and remote routing
function CheckoutWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the sub-path: /checkout/payment → /payment
  const subPath = location.pathname.replace('/checkout', '') || '/';

  const handleRemoteNavigate = (newPath) => {
    // Remote wants to navigate — update the real URL
    navigate(\`/checkout\${newPath}\`);
  };

  const handleGlobalNavigate = (path) => {
    // Remote wants to leave its domain entirely
    navigate(path);  // e.g., navigate('/profile')
  };

  return (
    <CheckoutApp
      initialPath={subPath}
      onNavigate={handleRemoteNavigate}
      onGlobalNavigate={handleGlobalNavigate}
    />
  );
}

// ==========================================
// REMOTE (Checkout) — uses MemoryRouter
// ==========================================
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Internal component that syncs route changes back to shell
function NavigationSync({ onNavigate }) {
  const location = useLocation();
  
  useEffect(() => {
    // Every time internal route changes, tell the shell
    onNavigate?.(location.pathname);
  }, [location.pathname, onNavigate]);

  return null;
}

export default function CheckoutApp({ 
  initialPath = '/', 
  onNavigate, 
  onGlobalNavigate 
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <NavigationSync onNavigate={onNavigate} />
      <Routes>
        <Route path="/" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/confirmation" element={
          <ConfirmationPage onGoToProfile={() => 
            onGlobalNavigate?.('/profile')
          } />
        } />
      </Routes>
    </MemoryRouter>
  );
}

// ==========================================
// ALTERNATIVE: basename approach
// ==========================================
// Remote uses BrowserRouter with basename
export default function CheckoutApp() {
  return (
    <BrowserRouter basename="/checkout">
      <Routes>
        <Route path="/" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
// ⚠️ Risk: two BrowserRouters both listening to popstate
// The shell and remote may fight over navigation events`,
        mistakes: [
            "Using two BrowserRouters without coordination — they both call history.pushState and fight over popstate events",
            "Forgetting to sync the URL bar when the remote navigates internally — user refreshes and loses their place",
            "Hardcoding routes in the remote that overlap with the shell's routes — causes infinite redirects",
            "Not handling the case where a remote wants to navigate OUTSIDE its domain (e.g., checkout → profile)",
        ],
        quiz: {
            question:
                "A user is on /checkout/payment, refreshes the page, and sees the checkout cart ('/checkout/') instead of the payment page. What's likely happening?",
            options: [
                "React Router has a bug",
                "The shell passes the initial sub-path to the remote's MemoryRouter, but on refresh it's defaulting to '/' instead of extracting '/payment' from the URL",
                "The browser cache is stale",
                "Module Federation doesn't support routing",
            ],
            correct: 1,
            explanation:
                "On refresh, the shell must extract the sub-path from window.location.pathname and pass it as the MemoryRouter's initialEntries. If the shell always passes '/' (or doesn't extract the sub-path correctly), the remote always starts at its root route. This is a very common bug in MFE routing setups.",
        },
    },
    {
        id: 5,
        title: "Shared State & Communication",
        subtitle: "How micro apps talk without becoming coupled",
        icon: "📡",
        content: `## Talking Across Walls

**Mental Model:** Micro apps are like apartments in a building. They shouldn't drill holes in the walls to pass things (tight coupling). Instead, they use the building's infrastructure: the mailbox system (custom events), the shared bulletin board (URL state), or the building manager (a shared store that lives in the shell).

---

### The Communication Spectrum (least to most coupling)

**1. URL State (Least coupled)**
The URL is a shared, observable state container. Any micro app can read query params. The shell can encode shared state in the URL.

Best for: Filters, search queries, selected IDs — anything that should survive a page refresh.

**2. Custom Events (Low coupling)**
The browser's native CustomEvent API. Any app can dispatch events on window, and any app can listen. No shared library needed.

Best for: Fire-and-forget notifications. "User added item to cart." "Theme changed." "User logged out."

**3. Props Down from Shell (Medium coupling)**
The shell passes data as props to each micro app. This is the simplest and most React-natural approach.

Best for: User context, auth tokens, feature flags — data the shell already owns.

**4. Shared Store via Module Federation (Higher coupling)**
Expose a shared store (Zustand, Redux, a plain EventEmitter) as a Module Federation shared module. All micro apps import the same singleton instance.

Best for: Complex shared state that multiple apps read and write (shopping cart, real-time notifications).

**5. Shared Service/API Layer (Highest coupling)**
A shared API client that caches server state. All micro apps query the same cache.

Best for: When the "shared state" is really server state. Use React Query / TanStack Query as a shared dependency.

---

### The Rules of MFE Communication

1. **Prefer events over shared state.** Events are unidirectional and don't create hidden dependencies.
2. **Shared state should be owned by exactly one app.** Others subscribe, they don't write directly.
3. **The shell is the state broker.** If two micro apps need to share data, the shell mediates.
4. **URL state is free synchronization.** Use it more than you think.
5. **Never reach into another app's internals.** No \`document.querySelector('#remote-app .price')\`.`,
        code: `// ==========================================
// 1. URL STATE — simplest, survives refresh
// ==========================================
// Shell encodes shared state in the URL
// /dashboard?org=acme&theme=dark

// Any micro app reads it:
function useSharedURLState(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}
// In remote: const org = useSharedURLState('org'); // "acme"

// ==========================================
// 2. CUSTOM EVENTS — fire and forget
// ==========================================
// Event bus using native browser APIs
// shared-contracts/events.ts (shared npm package — just types)
const EVENTS = {
  CART_UPDATED: 'mfe:cart-updated',
  USER_LOGOUT: 'mfe:user-logout',
  THEME_CHANGE: 'mfe:theme-change',
};

// Checkout app dispatches:
window.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
  detail: { itemCount: 3, total: 59.99 }
}));

// Header app listens:
useEffect(() => {
  const handler = (e) => setCartCount(e.detail.itemCount);
  window.addEventListener(EVENTS.CART_UPDATED, handler);
  return () => window.removeEventListener(EVENTS.CART_UPDATED, handler);
}, []);

// ==========================================
// 3. PROPS FROM SHELL — React-natural
// ==========================================
function ShellApp() {
  const user = useAuth();
  const featureFlags = useFeatureFlags();
  
  return (
    <Routes>
      <Route path="/checkout/*" element={
        <CheckoutApp 
          user={user} 
          featureFlags={featureFlags}
          onCartUpdate={(count) => setGlobalCartCount(count)}
        />
      } />
    </Routes>
  );
}

// ==========================================
// 4. SHARED STORE (Zustand via Module Federation)
// ==========================================
// shared-store/src/cartStore.js — exposed via Module Federation
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (item) => set((s) => ({ 
    items: [...s.items, item] 
  })),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));

// Remote vite.config.js — expose the store
federation({
  name: 'shared-store',
  exposes: {
    './cartStore': './src/cartStore.js'
  },
  shared: { zustand: { singleton: true } }
});

// Any micro app imports it:
import { useCartStore } from 'shared-store/cartStore';
function CartButton() {
  const count = useCartStore((s) => s.items.length);
  return <button>Cart ({count})</button>;
}

// ==========================================
// 5. CUSTOM EVENT WITH TYPED CONTRACT
// ==========================================
// A more robust pattern: typed event emitter
class MFEEventBus {
  emit(event, data) {
    window.dispatchEvent(new CustomEvent(event, { 
      detail: { data, timestamp: Date.now() } 
    }));
  }
  
  on(event, callback) {
    const handler = (e) => callback(e.detail.data);
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }
}

// Singleton — shared via Module Federation or a <script> tag
export const eventBus = new MFEEventBus();

// Producer (checkout):
eventBus.emit('mfe:cart-updated', { items: cart.items });

// Consumer (header):
useEffect(() => {
  return eventBus.on('mfe:cart-updated', (data) => {
    setBadgeCount(data.items.length);
  });
}, []);`,
        mistakes: [
            "Using a shared Redux store where every micro app dispatches actions — creates invisible coupling and debugging nightmares",
            "Custom events without namespacing — 'update' collides across apps. Always prefix: 'mfe:checkout:update'",
            "Passing entire state objects as props instead of callbacks — micro apps re-render on every state change",
            "Not cleaning up event listeners — memory leaks when micro apps unmount and remount",
        ],
        quiz: {
            question:
                "Checkout app needs to tell the Header app that the cart count changed. Which approach is best if you want MINIMAL coupling and the count should update in real-time?",
            options: [
                "Shared Redux store",
                "Custom events — checkout dispatches 'mfe:cart-updated' with the count, header listens",
                "URL query parameter ?cartCount=3",
                "localStorage with a polling interval",
            ],
            correct: 1,
            explanation:
                "Custom events are the sweet spot: real-time, zero shared dependencies (native browser API), unidirectional, and the apps don't need to know about each other's existence. URL state doesn't update in real-time. Shared Redux creates coupling. localStorage polling is wasteful and slow.",
        },
    },
    {
        id: 6,
        title: "CSS Isolation",
        subtitle: "Preventing style wars between micro apps",
        icon: "🎨",
        content: `## The Style Collision Problem

**Mental Model:** Each micro app is like a guest at a dinner party who brought their own table settings. If Guest A defines "all plates are blue" and Guest B defines "all plates are red," whoever arrives last wins — and someone's dinner looks wrong. CSS has no scoping by default; it's all one big global namespace.

---

### Why This Is Worse in MFE Than Monoliths

In a monolith, you at least see all the CSS in one codebase. In MFE, Team A writes \`.button { background: blue }\` in their repo, and Team B writes \`.button { background: red }\` in theirs. Neither knows about the other until production breaks.

Worse: the winning style depends on **load order**, which in MFE is nondeterministic (async remote loading).

---

### Isolation Strategies

**1. CSS Modules (Most common with Vite/React)**
Each CSS file is locally scoped at build time. \`.button\` becomes \`.button_a7x2k\`. Unique hashes mean no collisions.

Limitation: Doesn't protect against global styles (resets, third-party CSS). If one micro app imports a global CSS reset, it nukes everything.

**2. Shadow DOM (Strongest isolation)**
Web Components' Shadow DOM creates a fully encapsulated style boundary. No CSS leaks in or out.

Limitation: Theming is hard. You must use CSS custom properties (variables) to pass design tokens through the shadow boundary. Most CSS frameworks (Tailwind, Bootstrap) don't work inside Shadow DOM without extra setup.

**3. BEM or Prefix Convention (Simplest)**
Namespace all classes: \`.checkout-button\`, \`.profile-button\`. It's manual discipline, no tooling enforcement.

Limitation: Relies on humans not making mistakes. Will break eventually.

**4. Tailwind CSS (Utility-first approach)**
Tailwind classes are atomic (\`bg-blue-500\`, \`p-4\`) and don't collide. But if two micro apps load Tailwind with different configs, the base reset (\`@tailwind base\`) can still conflict.

Strategy: Only load Tailwind's base/reset once in the shell. Remotes use utility classes only — no duplicate base resets. Use the \`prefix\` option: one app uses \`tw-\`, another uses default.

**5. CSS-in-JS (Styled Components, Emotion)**
Styles are generated with unique class names at runtime. Each component's styles are scoped automatically.

Limitation: Runtime cost. And if two micro apps use different versions of Emotion, the style injection order can still conflict.

---

### What Happens at the Browser Level

CSS specificity and cascade order determine which style wins. When Remote A loads and injects a \`<style>\` tag, then Remote B loads and injects another \`<style>\` tag, B's styles come later in the document and win for equally specific selectors. This is **load-order dependent** — and in MFE, load order is unpredictable.`,
        code: `// ==========================================
// 1. CSS MODULES (Recommended for Vite + React)
// ==========================================
// checkout/src/Button.module.css
.button {
  background: blue;
  /* Compiled to: .button_x7a2k — unique to this build */
}

// checkout/src/Button.jsx
import styles from './Button.module.css';
export const Button = () => (
  <button className={styles.button}>Buy Now</button>
);
// Output: <button class="button_x7a2k">Buy Now</button>

// ==========================================
// 2. SHADOW DOM ISOLATION
// ==========================================
class CheckoutApp extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Styles are TRAPPED inside shadow DOM
    const style = document.createElement('style');
    style.textContent = \`
      .button { background: blue; }  /* Only affects this shadow tree */
    \`;
    shadow.appendChild(style);
    
    const root = document.createElement('div');
    shadow.appendChild(root);
    ReactDOM.createRoot(root).render(<CheckoutReactApp />);
  }
}

// Theming through the shadow boundary:
// Host defines CSS custom properties:
// :root { --brand-primary: #0066ff; }
// Shadow DOM CSS uses them:
// .button { background: var(--brand-primary); }

// ==========================================
// 3. TAILWIND PREFIX STRATEGY
// ==========================================
// checkout/tailwind.config.js
module.exports = {
  prefix: 'co-',  // All classes prefixed: co-bg-blue-500
  // IMPORTANT: disable Tailwind's base reset in remotes
  corePlugins: {
    preflight: false, // Don't inject base reset — shell handles it
  }
};

// shell/tailwind.config.js
module.exports = {
  prefix: '',  // Shell uses default (no prefix)
  // Shell IS allowed to have preflight — it loads once
};

// Usage in checkout remote:
<button className="co-bg-blue-500 co-text-white co-px-4 co-py-2">
  Buy Now
</button>

// ==========================================
// 4. CSS CONTAINMENT WRAPPER
// ==========================================
// A shell-level wrapper that prevents style leaks
function MicroAppContainer({ children, appName }) {
  return (
    <div
      className={\`mfe-container mfe-\${appName}\`}
      style={{
        // CSS containment hints for the browser
        contain: 'layout style',
        // Reset inherited styles
        all: 'initial',
        // Re-enable things you need
        display: 'block',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </div>
  );
}

// Usage in shell:
<MicroAppContainer appName="checkout">
  <CheckoutApp />
</MicroAppContainer>`,
        mistakes: [
            "Loading Tailwind's @tailwind base in every micro app — each one resets the page's styles",
            "Using :root or html/body selectors in remote apps — these are global and affect the entire page",
            "Assuming CSS Modules protect you from global @import statements — they don't scope imported CSS",
            "Forgetting that CSS custom properties (--vars) pierce Shadow DOM — this is a feature, but it means a remote can accidentally override your variables",
        ],
        quiz: {
            question:
                "Two micro apps both use Tailwind. After loading the second app, the first app's typography looks wrong (fonts, sizes). What's the most likely cause?",
            options: [
                "Tailwind classes are colliding",
                "Both apps include @tailwind base (Tailwind's CSS reset / preflight), and the second one's reset overrides the first's inherited styles",
                "Shadow DOM is leaking styles",
                "React is re-rendering the first app",
            ],
            correct: 1,
            explanation:
                "Tailwind's preflight (@tailwind base) includes aggressive CSS resets on html, body, and all elements. When the second app loads its own preflight, it re-applies the reset, potentially overriding styles that the first app expected. The fix: only the shell loads preflight. All remotes set corePlugins: { preflight: false }.",
        },
    },
    {
        id: 7,
        title: "Build & Deploy Independently",
        subtitle: "The whole point of MFE — shipping without coordination",
        icon: "🚀",
        content: `## Independent Deployment: The Core Promise

**Mental Model:** Think of MFE deployment like updating apps on your phone. When Instagram ships an update, it doesn't require Twitter and WhatsApp to also update. Each app has its own release cycle. Your phone's OS (the shell) loads whatever version of each app is currently published.

---

### How Independent Deployment Works

**The contract:** Each micro app deploys to its own URL (CDN path). The shell doesn't embed the remote's code — it references it by URL at runtime.

**The key file:** \`remoteEntry.js\` is the contract. As long as a remote's remoteEntry.js is valid and exposes the agreed-upon modules, the shell doesn't care when it was built or what changed internally.

**Deployment flow:**
1. Checkout team merges a fix
2. Checkout CI builds, producing new chunks + updated remoteEntry.js
3. New files are uploaded to \`https://checkout.cdn.com/assets/\`
4. The OLD remoteEntry.js is replaced with the NEW one
5. Next time any user's browser loads the shell, it fetches the new remoteEntry.js
6. Shell was never rebuilt. Profile app was never rebuilt. Only checkout changed.

---

### Cache Strategy — The Tricky Part

**remoteEntry.js must NOT be long-cached.** It's the index that points to the latest chunks. If it's cached for 24 hours, users won't see updates for 24 hours.

**Chunk files CAN be long-cached** because they're content-hashed (e.g., \`App-a7x2k.js\`). When the code changes, the hash changes, creating a new filename. Old chunks can live on the CDN indefinitely.

Pattern:
- \`remoteEntry.js\` → \`Cache-Control: no-cache\` or short TTL (5 min)
- \`App-a7x2k.js\` → \`Cache-Control: max-age=31536000, immutable\`

---

### Versioning Strategies

**1. URL Versioning (Explicit)**
\`https://checkout.cdn.com/v2.3.1/remoteEntry.js\`
The shell explicitly pins to a version. Upgrading requires a shell config change.

Pros: Predictable, rollback is instant (change the URL back).
Cons: Not truly independent — someone must update the shell's config.

**2. Latest Channel (Implicit)**
\`https://checkout.cdn.com/latest/remoteEntry.js\`
Always points to the most recent deployment.

Pros: True independence — remotes deploy, users get the latest automatically.
Cons: A bad remote deploy immediately breaks production for everyone.

**3. Semantic Channels (Balanced)**
\`https://checkout.cdn.com/stable/remoteEntry.js\` — promoted after testing
\`https://checkout.cdn.com/canary/remoteEntry.js\` — for internal testing

The shell points to \`stable\`. The checkout team deploys to \`canary\`, tests, then promotes to \`stable\`.

---

### Rollback

Since remoteEntry.js is just a file on a CDN, rollback = repoint to the previous file. If using versioned URLs, just change the URL. If using channels, re-promote the old version to \`stable\`.

Critical: Keep old chunk files on the CDN. If a user's browser still has the old remoteEntry.js cached, it will try to fetch old chunk filenames. If those are deleted, the app breaks.`,
        code: `// ==========================================
// CI/CD for a Remote (GitHub Actions example)
// ==========================================
// .github/workflows/deploy.yml
name: Deploy Checkout Remote
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install & Build
        run: |
          npm ci
          npm run build
          # Output: dist/assets/remoteEntry.js + chunks
      
      - name: Deploy to CDN (S3 + CloudFront)
        run: |
          # Upload chunks with long cache
          aws s3 sync dist/assets/ s3://mfe-cdn/checkout/assets/ \\
            --cache-control "max-age=31536000,immutable" \\
            --exclude "remoteEntry.js"
          
          # Upload remoteEntry.js with short cache
          aws s3 cp dist/assets/remoteEntry.js \\
            s3://mfe-cdn/checkout/assets/remoteEntry.js \\
            --cache-control "no-cache,max-age=0"
          
          # Invalidate CDN cache for remoteEntry.js
          aws cloudfront create-invalidation \\
            --distribution-id $CDN_DIST_ID \\
            --paths "/checkout/assets/remoteEntry.js"

// ==========================================
// DYNAMIC REMOTE URLs (environment-aware)
// ==========================================
// shell/src/remoteConfig.js
const REMOTE_URLS = {
  development: {
    checkout: 'http://localhost:3001/assets/remoteEntry.js',
    profile: 'http://localhost:3002/assets/remoteEntry.js',
  },
  staging: {
    checkout: 'https://staging.cdn.com/checkout/assets/remoteEntry.js',
    profile: 'https://staging.cdn.com/profile/assets/remoteEntry.js',
  },
  production: {
    checkout: 'https://cdn.myapp.com/checkout/stable/remoteEntry.js',
    profile: 'https://cdn.myapp.com/profile/stable/remoteEntry.js',
  },
};

export const getRemoteUrl = (name) => {
  const env = process.env.NODE_ENV || 'development';
  return REMOTE_URLS[env]?.[name];
};

// ==========================================
// ROLLBACK SCRIPT
// ==========================================
// scripts/rollback.sh
#!/bin/bash
REMOTE=$1       # e.g., "checkout"
VERSION=$2      # e.g., "v2.3.0"

echo "Rolling back $REMOTE to $VERSION"

# Copy the old remoteEntry.js to the stable channel
aws s3 cp \\
  "s3://mfe-cdn/$REMOTE/$VERSION/remoteEntry.js" \\
  "s3://mfe-cdn/$REMOTE/stable/remoteEntry.js" \\
  --cache-control "no-cache"

# Invalidate CDN
aws cloudfront create-invalidation \\
  --distribution-id $CDN_DIST_ID \\
  --paths "/$REMOTE/stable/remoteEntry.js"

echo "Rollback complete. Users will get $VERSION on next load."

// ==========================================
// CONTRACT TESTING (CI check)
// ==========================================
// Ensure the remote still exposes expected modules
// test/contract.test.js
import { describe, it, expect } from 'vitest';

describe('Checkout Remote Contract', () => {
  it('exposes ./App module', async () => {
    // Load the built remoteEntry
    const container = await import('../dist/assets/remoteEntry.js');
    
    // Verify the expected module exists
    const appFactory = await container.get('./App');
    expect(appFactory).toBeDefined();
    
    const AppModule = appFactory();
    expect(AppModule.default).toBeDefined();
    expect(typeof AppModule.default).toBe('function'); // React component
  });

  it('declares react as shared singleton', () => {
    // Read the Vite config and assert shared config
    const config = require('../vite.config.js');
    const federationPlugin = config.plugins.find(
      p => p.name === 'federation'
    );
    expect(federationPlugin.config.shared.react.singleton).toBe(true);
  });
});`,
        mistakes: [
            "Long-caching remoteEntry.js — users get stale versions and nothing seems to deploy",
            "Deleting old chunks from the CDN — breaks users who have the old remoteEntry.js cached",
            "Not having a rollback strategy — when a remote breaks prod, you're scrambling",
            "Deploying without contract tests — a remote can change its exposed module names and silently break the shell",
        ],
        quiz: {
            question:
                "You deploy a new version of the Checkout remote. Users who opened the app before the deploy can still see the old version. Users who open the app now see the new version. But some users report a white screen. What happened?",
            options: [
                "The browser is caching JavaScript incorrectly",
                "You deleted the old chunk files from the CDN. Users with the old remoteEntry.js cached are requesting old chunk filenames that no longer exist, getting 404s.",
                "Module Federation has a bug",
                "React concurrent mode caused a race condition",
            ],
            correct: 1,
            explanation:
                "This is the classic 'stale manifest, missing chunks' problem. User A loaded the page 10 minutes ago and has the OLD remoteEntry.js cached. When they navigate to checkout, the old remoteEntry references chunk 'App-old123.js'. If you deleted old chunks during deployment, that 404s and the app crashes. The fix: never delete old chunks (or only delete chunks older than 30 days).",
        },
    },
    {
        id: 8,
        title: "Common Pitfalls",
        subtitle: "Landmines you'll step on (so you can avoid them)",
        icon: "💣",
        content: `## The MFE Minefield

These aren't theoretical — these are the issues that consume debugging hours in real MFE projects.

---

### 1. Dependency Version Mismatches

**The bomb:** Host uses React 18.2. Remote was built with React 18.3 (a minor bump). Singleton mode picks 18.3, but the host's code was compiled against 18.2's types. A new API in 18.3 is undefined in the host's context.

**The fix:**
- Pin shared dependencies to exact versions in a shared config file
- Use a CI bot that checks all remotes use compatible versions
- Run integration tests that load all remotes together in a staging environment
- Use \`requiredVersion\` in Module Federation config to enforce ranges

---

### 2. Shared State Leaking

**The bomb:** Checkout app creates a Zustand store. User navigates away. The store persists in memory. User returns — stale state from the previous visit shows ghost items.

**The fix:**
- Reset micro app state on unmount
- Use React's key prop to force fresh mounts: \`<CheckoutApp key={navigationId} />\`
- Prefer URL state and server state over client-side stores for cross-session data
- Implement cleanup in useEffect return functions

---

### 3. CSS Conflicts (covered in Chapter 6)

**Additional pitfalls:**
- Third-party libraries injecting global styles (looking at you, Ant Design)
- z-index wars: Remote A's modal (z-index: 1000) vs Remote B's dropdown (z-index: 999)
- A global \`* { box-sizing: border-box }\` in one remote affecting layout in another

**The fix:**
- Establish a z-index contract across teams
- Audit third-party CSS for global selectors before adopting libraries
- Use CSS containment (\`contain: layout style\`)

---

### 4. Performance Death by a Thousand Cuts

**The bomb:** Shell loads remoteEntry.js for 5 remotes. Each remote has its own vendor chunk. Even with shared dependencies, there are 15+ HTTP requests before anything renders.

**At the network level:**
- Shell HTML: 1 request
- Shell JS bundle: 1 request
- 5x remoteEntry.js: 5 requests (sequential — each must load before its chunks are known)
- Shared deps (React, etc.): 1-3 requests
- Each remote's main chunk: 5 requests
- Total: 15+ requests, many sequential (not parallelizable)

**The fix:**
- Only load remotes the user actually navigates to (lazy loading)
- Preload remoteEntry.js for likely navigation targets: \`<link rel="preload" href="checkout/remoteEntry.js">\`
- Use HTTP/2 or HTTP/3 for multiplexing
- Measure! Set a performance budget for initial load time

---

### 5. Circular Dependencies Between Remotes

**The bomb:** Remote A imports a component from Remote B. Remote B imports a utility from Remote A. At runtime, the loading sequence deadlocks or crashes.

**The fix:**
- Enforce a strict dependency direction: shell → remotes, NEVER remote → remote
- If two remotes need to share code, extract it to a third "shared" remote
- Use a dependency graph visualization tool and reject cycles in CI
- Communication between remotes should go through the shell (events or props), never direct imports`,
        code: `// ==========================================
// PITFALL: Stale state on re-mount
// ==========================================
// BAD — state persists between navigations
function CheckoutWrapper() {
  return <CheckoutApp />;
  // User leaves and returns — CheckoutApp still has old cart
}

// GOOD — force fresh mount with key
function CheckoutWrapper() {
  const [mountKey, setMountKey] = useState(Date.now());
  const location = useLocation();
  
  // Reset when navigating back to checkout
  useEffect(() => {
    setMountKey(Date.now());
  }, [location.key]);

  return <CheckoutApp key={mountKey} />;
}

// ==========================================
// PITFALL: Loading all remotes upfront
// ==========================================
// BAD — fetches ALL remoteEntry.js files on initial load
import CheckoutApp from 'checkout/App';
import ProfileApp from 'profile/App';
import DashboardApp from 'dashboard/App';
import SettingsApp from 'settings/App';
import AnalyticsApp from 'analytics/App';
// 5 HTTP requests BEFORE the user sees anything

// GOOD — lazy load based on route
const CheckoutApp = lazy(() => import('checkout/App'));
const ProfileApp = lazy(() => import('profile/App'));
// Only loads when the user navigates to that route

// ==========================================
// PITFALL: No error boundary
// ==========================================
// BAD — remote failure crashes the entire app
<Routes>
  <Route path="/checkout/*" element={<CheckoutApp />} />
</Routes>
// If checkout's CDN is down → white screen of death

// GOOD — isolate failures
class RemoteErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="remote-error">
          <h3>This section is temporarily unavailable</h3>
          <p>Our team has been notified.</p>
          <button onClick={() => {
            this.setState({ hasError: false });
            // Optionally: retry by clearing module cache
          }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
<RemoteErrorBoundary>
  <Suspense fallback={<Skeleton />}>
    <CheckoutApp />
  </Suspense>
</RemoteErrorBoundary>

// ==========================================
// PITFALL: z-index chaos
// ==========================================
// shared-contracts/z-index.css (shared via shell)
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;
}

// Every micro app uses these tokens:
.my-modal { z-index: var(--z-modal); }
.my-dropdown { z-index: var(--z-dropdown); }`,
        mistakes: [
            "Not wrapping remotes in ErrorBoundary — one remote's failure kills the entire app",
            "Importing between remotes directly (A imports from B, B imports from A) — creates circular dependency deadlocks",
            "Loading all remotes eagerly on app startup — kills initial load performance",
            "Not having a z-index contract — modals render behind dropdowns from other apps",
        ],
        quiz: {
            question:
                "Your MFE app loads 4 remotes. Initial page load takes 8 seconds. The shell and home page don't need any remotes — they only show static content. What's the first optimization?",
            options: [
                "Enable HTTP/3",
                "Lazy load all remotes — none should load until the user navigates to a route that needs them",
                "Add more CDN edge locations",
                "Minify the remoteEntry.js files",
            ],
            correct: 1,
            explanation:
                "If the home page doesn't use any remote, loading 4 remoteEntry.js files upfront is pure waste. Lazy loading (React.lazy + Suspense on route boundaries) defers all remote fetching until the user actually navigates to a micro app. This is typically the single biggest performance win in MFE.",
        },
    },
    {
        id: 9,
        title: "Production Patterns",
        subtitle: "How Spotify, IKEA, and Zalando do it",
        icon: "🏢",
        content: `## Real-World MFE at Scale

---

### Spotify — "Squads and Iframes (then Web Components)"

**Architecture:** Spotify pioneered the "squad" model. Each squad owns a feature end-to-end (backend + frontend). Initially, the Spotify desktop client used iframes heavily — each section was an isolated web page.

**Evolution:** They moved toward Web Components and a custom framework. Each squad's UI is a self-contained component that can be rendered anywhere.

**Key patterns:**
- Strong domain boundaries — each squad owns the full vertical slice (UI, API, data)
- A shared design system ("Encore") ensures visual consistency
- Event-driven communication between squads
- No shared runtime state — each component fetches its own data

**Lesson:** Start with organizational structure (squads), not technology. The tech follows the team topology.

---

### IKEA — "Server-Side Composition"

**Architecture:** IKEA uses a server-side MFE approach. A composition layer stitches together HTML fragments from different teams before sending the final page to the browser.

**How it works:**
1. User requests a product page
2. The composition server calls 3 services in parallel:
   - Product info service → returns HTML fragment
   - Reviews service → returns HTML fragment
   - Recommendations service → returns HTML fragment
3. Fragments are assembled into a complete page
4. Complete HTML is sent to the browser

**Key patterns:**
- Server-side composition for initial page load performance
- Client-side hydration for interactivity
- Team autonomy — each service is independently deployable
- Edge-side includes (ESI) or Podium framework for stitching

**Lesson:** Not all MFE has to be client-side. Server-side composition gives you better SEO, faster first paint, and simpler client code.

---

### Zalando — "Project Mosaic → Interface Framework"

**Architecture:** Zalando built Mosaic, then evolved to their Interface Framework. It's a layout service that composes pages from fragments.

**Key patterns:**
- A "layout service" defines which fragments appear on each page
- Each fragment is owned by one team and deployed independently
- A "fragment gateway" handles routing fragments to their services
- Fragments communicate through a shared "sandbox" API
- A/B testing baked into the fragment routing layer

**Lesson:** Invest in the platform layer. A good composition layer lets teams focus on features, not plumbing.

---

### Patterns That Appear Across All Three

1. **Strong team ownership:** One team = one domain = one micro app. No shared ownership of code.

2. **Shared design system:** Every company has one. It's how visual consistency survives team autonomy. It's usually the one true shared npm package.

3. **Composition layer:** Whether client-side (Module Federation), server-side (Podium/Mosaic), or hybrid — something assembles the pieces.

4. **Independent deployment is non-negotiable:** If you can't deploy independently, you haven't actually achieved MFE.

5. **Contract testing:** Teams don't trust runtime integration. They test that their exposed interfaces match expected contracts in CI.

6. **Observability per micro app:** Each team monitors their own bundle size, load time, error rate. A team dashboard shows MFE-level metrics.

---

### The Architecture Decision Framework

| Factor | Choose Module Federation | Choose Server-Side | Choose Web Components |
|---|---|---|---|
| Primary framework | React/Webpack/Vite everywhere | Mixed or mostly SSR | Mixed frameworks |
| SEO critical? | No (SPA) | Yes | Either |
| Team size | 3-10 teams | 5-20+ teams | 3-8 teams |
| Interaction complexity | High (SPA-like) | Page-based | Widget-based |
| Performance priority | Bundle size < UX | First paint < TTI | Isolation > sharing |`,
        code: `// ==========================================
// PRODUCTION SHELL ARCHITECTURE
// ==========================================
// A real-world shell that handles everything

// shell/src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { FeatureFlagProvider } from './flags/FeatureFlagProvider';
import { RemoteErrorBoundary } from './errors/RemoteErrorBoundary';
import { PageSkeleton } from './ui/PageSkeleton';
import { GlobalNav } from './ui/GlobalNav';
import { MFEMetrics } from './observability/MFEMetrics';

// Lazy-loaded remotes — nothing loads until navigated to
const CheckoutApp = lazy(() => import('checkout/App'));
const ProfileApp = lazy(() => import('profile/App'));
const DashboardApp = lazy(() => import('dashboard/App'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeatureFlagProvider>
          <MFEMetrics> {/* Tracks load times per remote */}
            <GlobalNav />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/checkout/*" element={
                  <RemoteErrorBoundary name="checkout">
                    <Suspense fallback={<PageSkeleton />}>
                      <CheckoutApp />
                    </Suspense>
                  </RemoteErrorBoundary>
                } />
                <Route path="/profile/*" element={
                  <RemoteErrorBoundary name="profile">
                    <Suspense fallback={<PageSkeleton />}>
                      <ProfileApp />
                    </Suspense>
                  </RemoteErrorBoundary>
                } />
              </Routes>
            </main>
          </MFEMetrics>
        </FeatureFlagProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// ==========================================
// OBSERVABILITY: Track remote load performance
// ==========================================
function MFEMetrics({ children }) {
  useEffect(() => {
    // Track remote module load times
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('remoteEntry.js')) {
          analytics.track('mfe.remote.load', {
            remote: entry.name,
            duration: entry.duration,
            transferSize: entry.transferSize,
          });
        }
      }
    });
    observer.observe({ entryTypes: ['resource'] });
    return () => observer.disconnect();
  }, []);

  return children;
}

// ==========================================
// SHARED DESIGN SYSTEM CONTRACT
// ==========================================
// packages/design-system/src/Button.jsx
// This is the ONE shared npm package all teams use
export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) {
  return (
    <button
      className={\`ds-btn ds-btn--\${variant} ds-btn--\${size}\`}
      {...props}
    >
      {children}
    </button>
  );
}

// Every micro app installs: @myorg/design-system
// It's a normal npm package — the ONE thing that's shared at build time
// It ensures visual consistency without runtime coupling`,
        mistakes: [
            "Copying big company patterns without having big company problems — IKEA's complexity is justified at their scale",
            "Not investing in a shared design system — teams ship visually inconsistent UIs and users notice",
            "Skipping contract testing — production integration breaks are discovered by users, not CI",
            "No per-remote observability — when something is slow, nobody knows which team's app caused it",
        ],
        quiz: {
            question:
                "You're building an e-commerce site. SEO is critical for product pages. Your teams all use React. You have 6 frontend teams. Which architecture fits best?",
            options: [
                "Pure client-side Module Federation SPA",
                "Hybrid: Server-side composition for product pages (SEO), client-side Module Federation for interactive sections (cart, account)",
                "All iframes for maximum isolation",
                "Single monolith with code splitting",
            ],
            correct: 1,
            explanation:
                "SEO-critical pages need server-rendered HTML. Interactive sections (cart, account area) benefit from SPA-like Module Federation. A hybrid approach gives you the best of both: fast, indexable product pages with rich interactivity where it matters. This is close to what IKEA does.",
        },
    },
];

// ============ Quiz Component ============
function Quiz({
    quiz,
    chapterId,
}: {
    quiz: {
        question: string;
        options: string[];
        correct: number;
        explanation: string;
    };
    chapterId: number;
}) {
    const [selected, setSelected] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);

    const handleSelect = (idx: number) => {
        if (revealed) return;
        setSelected(idx);
        setRevealed(true);
    };

    const isCorrect = selected === quiz.correct;

    return (
        <div
            style={{
                background: "#1a1a2e",
                borderRadius: 12,
                padding: 28,
                marginTop: 32,
                border: "1px solid #2a2a4a",
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: "#f7b731",
                    marginBottom: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                }}
            >
                ✦ Check Your Understanding
            </div>
            <p
                style={{
                    fontSize: 15,
                    color: "#e0e0e0",
                    lineHeight: 1.7,
                    marginBottom: 20,
                }}
            >
                {quiz.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {quiz.options.map((opt: string, idx: number) => {
                    let bg = "#0d0d1a";
                    let border = "1px solid #2a2a4a";
                    let color = "#c0c0d0";
                    if (revealed && idx === quiz.correct) {
                        bg = "#0a2e1a";
                        border = "1px solid #2ecc71";
                        color = "#2ecc71";
                    }
                    if (revealed && idx === selected && idx !== quiz.correct) {
                        bg = "#2e0a0a";
                        border = "1px solid #e74c3c";
                        color = "#e74c3c";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            style={{
                                background: bg,
                                border,
                                borderRadius: 8,
                                padding: "12px 16px",
                                color,
                                textAlign: "left",
                                cursor: revealed ? "default" : "pointer",
                                fontSize: 14,
                                lineHeight: 1.5,
                                transition: "all 0.2s",
                                fontFamily: "'IBM Plex Sans', sans-serif",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    marginRight: 10,
                                    opacity: 0.5,
                                }}
                            >
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>
            {revealed && (
                <div
                    style={{
                        marginTop: 20,
                        padding: 16,
                        background: isCorrect ? "#0a2e1a" : "#1a1020",
                        borderRadius: 8,
                        borderLeft: `3px solid ${isCorrect ? "#2ecc71" : "#f7b731"}`,
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isCorrect ? "#2ecc71" : "#f7b731",
                            marginBottom: 8,
                        }}
                    >
                        {isCorrect ? "Correct!" : "Not quite."}
                    </div>
                    <p
                        style={{
                            fontSize: 14,
                            color: "#b0b0c0",
                            lineHeight: 1.7,
                            margin: 0,
                        }}
                    >
                        {quiz.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}

// ============ Code Block ============
function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            style={{
                position: "relative",
                background: "#0d0d1a",
                borderRadius: 10,
                border: "1px solid #1e1e3a",
                marginTop: 24,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderBottom: "1px solid #1e1e3a",
                    background: "#0a0a18",
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        color: "#666",
                        fontFamily: "'JetBrains Mono', monospace",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                    }}
                >
                    Code Example
                </span>
                <button
                    onClick={handleCopy}
                    style={{
                        background: "none",
                        border: "1px solid #333",
                        color: copied ? "#2ecc71" : "#888",
                        fontSize: 11,
                        padding: "4px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontFamily: "'JetBrains Mono', monospace",
                    }}
                >
                    {copied ? "Copied ✓" : "Copy"}
                </button>
            </div>
            <pre
                style={{
                    padding: 20,
                    margin: 0,
                    overflowX: "auto",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#c0c0d0",
                    fontFamily: "'JetBrains Mono', monospace",
                }}
            >
                <code>{code}</code>
            </pre>
        </div>
    );
}

// ============ Chapter Content Renderer ============
function ChapterContent({ chapter }: { chapter: (typeof CHAPTERS)[number] }) {
    const renderMarkdown = (text: string) => {
        const lines = text.split("\n");
        const elements = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            if (line.startsWith("## ")) {
                elements.push(
                    <h2
                        key={i}
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#f0f0f0",
                            marginTop: 32,
                            marginBottom: 16,
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        {line.slice(3)}
                    </h2>,
                );
            } else if (line.startsWith("### ")) {
                elements.push(
                    <h3
                        key={i}
                        style={{
                            fontSize: 17,
                            fontWeight: 600,
                            color: "#d0d0e0",
                            marginTop: 28,
                            marginBottom: 12,
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        {line.slice(4)}
                    </h3>,
                );
            } else if (line.startsWith("---")) {
                elements.push(
                    <hr
                        key={i}
                        style={{
                            border: "none",
                            borderTop: "1px solid #1e1e3a",
                            margin: "32px 0",
                        }}
                    />,
                );
            } else if (line.startsWith("| ")) {
                const tableRows = [];
                let j = i;
                while (j < lines.length && lines[j].startsWith("|")) {
                    if (!lines[j].startsWith("|---")) {
                        tableRows.push(
                            lines[j]
                                .split("|")
                                .filter((c: string) => c.trim())
                                .map((c: string) => c.trim()),
                        );
                    }
                    j++;
                }
                const [header, ...body] = tableRows;
                elements.push(
                    <div
                        key={i}
                        style={{
                            overflowX: "auto",
                            marginTop: 16,
                            marginBottom: 16,
                            borderRadius: 8,
                            border: "1px solid #1e1e3a",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr>
                                    {header.map((h: string, hi: number) => (
                                        <th
                                            key={hi}
                                            style={{
                                                padding: "10px 14px",
                                                background: "#0d0d1a",
                                                color: "#f7b731",
                                                textAlign: "left",
                                                fontFamily:
                                                    "'JetBrains Mono', monospace",
                                                fontSize: 11,
                                                textTransform: "uppercase",
                                                letterSpacing: 1,
                                                borderBottom:
                                                    "1px solid #1e1e3a",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {body.map((row, ri) => (
                                    <tr key={ri}>
                                        {row.map((cell: string, ci: number) => (
                                            <td
                                                key={ci}
                                                style={{
                                                    padding: "10px 14px",
                                                    color: "#b0b0c0",
                                                    borderBottom:
                                                        "1px solid #1a1a2e",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>,
                );
                i = j - 1;
            } else if (line.trim() === "") {
                // skip
            } else {
                // Process inline formatting
                let content = line;

                const parts = [];
                const regex =
                    /(\*\*.*?\*\*)|(`[^`]+`)|(\\\`\\\`\\\`[\s\S]*?\\\`\\\`\\\`)/g;
                let lastIdx = 0;
                let match;
                const boldRegex = /\*\*(.*?)\*\*/g;
                const codeRegex = /`([^`]+)`/g;
                const combinedRegex = /(\*\*.*?\*\*)|(`[^`]+`)/g;

                let processed = [];
                let lastIndex = 0;
                let m;
                const combined = /(\*\*.*?\*\*)|(`[^`]+`)/g;

                while ((m = combined.exec(content)) !== null) {
                    if (m.index > lastIndex) {
                        processed.push(content.slice(lastIndex, m.index));
                    }
                    if (m[1]) {
                        // bold
                        processed.push(
                            <strong
                                key={`b${m.index}`}
                                style={{ color: "#f0f0f0", fontWeight: 600 }}
                            >
                                {m[1].slice(2, -2)}
                            </strong>,
                        );
                    } else if (m[2]) {
                        // inline code
                        processed.push(
                            <code
                                key={`c${m.index}`}
                                style={{
                                    background: "#1a1a2e",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    fontSize: "0.9em",
                                    color: "#f7b731",
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            >
                                {m[2].slice(1, -1)}
                            </code>,
                        );
                    }
                    lastIndex = m.index + m[0].length;
                }
                if (lastIndex < content.length) {
                    processed.push(content.slice(lastIndex));
                }

                elements.push(
                    <p
                        key={i}
                        style={{
                            fontSize: 15,
                            color: "#b0b0c0",
                            lineHeight: 1.8,
                            marginBottom: 12,
                        }}
                    >
                        {processed}
                    </p>,
                );
            }
            i++;
        }
        return elements;
    };

    return (
        <div>
            {renderMarkdown(chapter.content)}
            {chapter.code && <CodeBlock code={chapter.code} />}
            {chapter.mistakes && (
                <div
                    style={{
                        background: "#1a0a0a",
                        borderRadius: 10,
                        padding: 24,
                        marginTop: 28,
                        borderLeft: "3px solid #e74c3c",
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: 2,
                            color: "#e74c3c",
                            marginBottom: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                    >
                        ⚠ Common Beginner Mistakes
                    </div>
                    {chapter.mistakes.map((m: string, idx: number) => (
                        <div
                            key={idx}
                            style={{
                                display: "flex",
                                gap: 10,
                                marginBottom: 10,
                                fontSize: 14,
                                color: "#c08080",
                                lineHeight: 1.6,
                            }}
                        >
                            <span style={{ color: "#e74c3c", flexShrink: 0 }}>
                                ✗
                            </span>
                            <span>{m}</span>
                        </div>
                    ))}
                </div>
            )}
            {chapter.quiz && (
                <Quiz quiz={chapter.quiz} chapterId={chapter.id} />
            )}
        </div>
    );
}

// ============ Main App ============
export default function MFEDeepDive() {
    const [activeChapter, setActiveChapter] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const chapter = CHAPTERS[activeChapter];

    const goTo = useCallback((idx: number) => {
        setActiveChapter(idx);
        setSidebarOpen(false);
        contentRef.current?.scrollTo(0, 0);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                background: "#0a0a14",
                color: "#e0e0e0",
                fontFamily: "'IBM Plex Sans', sans-serif",
                overflow: "hidden",
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
                rel="stylesheet"
            />

            {/* Mobile hamburger */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: "fixed",
                    top: 16,
                    left: 16,
                    zIndex: 100,
                    background: "#1a1a2e",
                    border: "1px solid #2a2a4a",
                    color: "#f0f0f0",
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                }}
                className="mobile-toggle"
            >
                ☰
            </button>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        zIndex: 49,
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Sidebar */}
            <nav
                style={{
                    width: 300,
                    minWidth: 300,
                    background: "#0d0d1a",
                    borderRight: "1px solid #1a1a2e",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 50,
                    transition: "transform 0.3s ease",
                }}
                className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
            >
                <div
                    style={{
                        padding: "28px 24px 20px",
                        borderBottom: "1px solid #1a1a2e",
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: 3,
                            color: "#f7b731",
                            marginBottom: 6,
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                    >
                        Deep Dive
                    </div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#f0f0f0",
                            fontFamily: "'Space Grotesk', sans-serif",
                            lineHeight: 1.3,
                        }}
                    >
                        Micro Frontend
                        <br />
                        Architecture
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
                    {CHAPTERS.map((ch, idx) => (
                        <button
                            key={ch.id}
                            onClick={() => goTo(idx)}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                width: "100%",
                                padding: "12px 20px",
                                background:
                                    idx === activeChapter
                                        ? "#1a1a3e"
                                        : "transparent",
                                border: "none",
                                borderLeft:
                                    idx === activeChapter
                                        ? "2px solid #f7b731"
                                        : "2px solid transparent",
                                color:
                                    idx === activeChapter
                                        ? "#f0f0f0"
                                        : "#707090",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.15s",
                                fontFamily: "'IBM Plex Sans', sans-serif",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 18,
                                    flexShrink: 0,
                                    marginTop: 1,
                                }}
                            >
                                {ch.icon}
                            </span>
                            <div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color:
                                            idx === activeChapter
                                                ? "#f7b731"
                                                : "#505070",
                                        fontFamily:
                                            "'JetBrains Mono', monospace",
                                        marginBottom: 2,
                                    }}
                                >
                                    CH.{String(ch.id).padStart(2, "0")}
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {ch.title}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <div
                    style={{
                        padding: "16px 20px",
                        borderTop: "1px solid #1a1a2e",
                        fontSize: 11,
                        color: "#404060",
                        fontFamily: "'JetBrains Mono', monospace",
                    }}
                >
                    {activeChapter + 1} / {CHAPTERS.length} chapters
                </div>
            </nav>

            {/* Main content */}
            <main
                ref={contentRef}
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "48px max(40px, calc((100% - 760px) / 2))",
                }}
            >
                <div style={{ maxWidth: 760 }}>
                    <div
                        style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: 3,
                            color: "#f7b731",
                            marginBottom: 8,
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                    >
                        Chapter {String(chapter.id).padStart(2, "0")}{" "}
                        {chapter.icon}
                    </div>
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: "#f0f0f0",
                            marginBottom: 8,
                            fontFamily: "'Space Grotesk', sans-serif",
                            lineHeight: 1.2,
                        }}
                    >
                        {chapter.title}
                    </h1>
                    <p
                        style={{
                            fontSize: 16,
                            color: "#707090",
                            marginBottom: 40,
                            lineHeight: 1.6,
                        }}
                    >
                        {chapter.subtitle}
                    </p>

                    <ChapterContent chapter={chapter} />

                    {/* Navigation */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 56,
                            paddingTop: 32,
                            borderTop: "1px solid #1a1a2e",
                            paddingBottom: 48,
                        }}
                    >
                        <button
                            onClick={() =>
                                activeChapter > 0 && goTo(activeChapter - 1)
                            }
                            disabled={activeChapter === 0}
                            style={{
                                background: "none",
                                border: "1px solid #2a2a4a",
                                color:
                                    activeChapter === 0 ? "#2a2a4a" : "#b0b0c0",
                                padding: "10px 20px",
                                borderRadius: 8,
                                cursor:
                                    activeChapter === 0
                                        ? "not-allowed"
                                        : "pointer",
                                fontSize: 13,
                                fontFamily: "'IBM Plex Sans', sans-serif",
                            }}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() =>
                                activeChapter < CHAPTERS.length - 1 &&
                                goTo(activeChapter + 1)
                            }
                            disabled={activeChapter === CHAPTERS.length - 1}
                            style={{
                                background:
                                    activeChapter === CHAPTERS.length - 1
                                        ? "#1a1a2e"
                                        : "#f7b731",
                                border: "none",
                                color:
                                    activeChapter === CHAPTERS.length - 1
                                        ? "#2a2a4a"
                                        : "#0a0a14",
                                padding: "10px 24px",
                                borderRadius: 8,
                                cursor:
                                    activeChapter === CHAPTERS.length - 1
                                        ? "not-allowed"
                                        : "pointer",
                                fontSize: 13,
                                fontWeight: 600,
                                fontFamily: "'IBM Plex Sans', sans-serif",
                            }}
                        >
                            Next Chapter →
                        </button>
                    </div>
                </div>
            </main>

            <style>{`
        @media (max-width: 768px) {
          .mobile-toggle { display: flex !important; }
          .sidebar { 
            position: fixed !important; 
            left: 0; top: 0; bottom: 0;
            transform: translateX(-100%);
          }
          .sidebar-open { transform: translateX(0) !important; }
          main { padding: 48px 20px !important; }
        }
      `}</style>
        </div>
    );
}
