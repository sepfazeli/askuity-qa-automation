# Bugs

Found while testing https://qa-task--oyettijon.replit.app on 17–19 Oct 2026, using Chrome 155 on macOS
(desktop at 1440×900, plus mobile emulation). The password for every account is `test_sauce`.

Each bug has a test tagged `@known-bug` that fails until the bug is fixed (`npm run test:bugs`).

| ID | Title | Severity | Priority |
| --- | --- | --- | --- |
| [BUG-001](#bug-001) | "Price: High to Low" sorts from low to high | Medium | P2 |
| [BUG-002](#bug-002) | "Bolt T-Shirt" can't be added to the cart | High | P1 |
| [BUG-003](#bug-003) | Missing first name shows "Last Name is required" | Low | P3 |
| [BUG-004](#bug-004) | Missing password shows "Username is required" | Low | P3 |
| [BUG-005](#bug-005) | `count_echo`: cart badge is one higher than the cart | Medium | P2 |
| [BUG-006](#bug-006) | `lens_warp`: products show the wrong images | Medium | P2 |
| [BUG-007](#bug-007) | "System overload" after 6 clicks blocks the item | High | P2 |
| [BUG-008](#bug-008) | Cart isn't cleared after an order, so it can be placed twice | High | P1 |
| [BUG-009](#bug-009) | Refreshing the page logs you out and empties the cart | Medium | P2 |
| [BUG-010](#bug-010) | Pages fail WCAG 2.1 AA accessibility checks | Medium | P2 |
| [BUG-011](#bug-011) | A long name pushes the order summary and Finish button off-screen | Medium | P3 |

---

<a id="bug-001"></a>

## BUG-001: "Price: High to Low" sorts from low to high

**Severity:** Medium | **Priority:** P2 | **Test:** `TC-INV-07`

**Steps**

1. Log in as `fern_signal`.
2. In the sort menu, choose **Price: High to Low**.

**Expected:** Most expensive first ($49.99, $44.99 … $4.99).

**Actual:** Cheapest first ($4.99, $7.99 … $49.99), the same order as Price: Low to High. It also happens
inside a category filter.

**Screenshot:** [BUG-001-price-high-to-low.png](docs/bug-evidence/BUG-001-price-high-to-low.png)

---

<a id="bug-002"></a>

## BUG-002: "Bolt T-Shirt" can't be added to the cart

**Severity:** High | **Priority:** P1 | **Tests:** `TC-CART-07`, `TC-CART-08`

**Steps**

1. Log in as `fern_signal`.
2. Click **Add to Cart** on Bolt T-Shirt ($15.99).
3. Open the cart.

**Expected:** "Added!" appears, the badge shows 1, and the cart lists Bolt T-Shirt.

**Actual:** Nothing happens. There's no "Added!", no badge, and the cart is empty. The same happens on the
Bolt T-Shirt product page. The other 11 products add normally.

**Screenshot:** [BUG-002-bolt-tshirt-not-added.png](docs/bug-evidence/BUG-002-bolt-tshirt-not-added.png)

---

<a id="bug-003"></a>

## BUG-003: Missing first name shows "Last Name is required"

**Severity:** Low | **Priority:** P3 | **Test:** `TC-CHK-02`

**Steps**

1. Add any product to the cart and go to checkout.
2. Leave **First Name** empty. Fill in Last Name and Postal Code.
3. Click **Continue**.

**Expected:** "First Name is required" under First Name.

**Actual:** "Last Name is required" under First Name. The same happens when the whole form is left empty.

**Screenshot:** [BUG-003-first-name-error-copy.png](docs/bug-evidence/BUG-003-first-name-error-copy.png)

---

<a id="bug-004"></a>

## BUG-004: Missing password shows "Username is required"

**Severity:** Low | **Priority:** P3 | **Test:** `TC-LOGIN-04`

**Steps**

1. On the login page, enter `fern_signal` as the username and leave the password empty.
2. Click **Login**.

**Expected:** "Password is required".

**Actual:** "Epic sadface below — Username is required".

**Screenshot:** [BUG-004-empty-password-message.png](docs/bug-evidence/BUG-004-empty-password-message.png)

---

<a id="bug-005"></a>

## BUG-005: `count_echo`: cart badge is one higher than the cart

**Severity:** Medium | **Priority:** P2 | **Test:** `TC-VAR-02`

**Steps**

1. Log in as `count_echo`.
2. Look at the cart badge before adding anything.
3. Add Daybreak Ceramic Mug and Gridline Journal, then open the cart.

**Expected:** No badge while the cart is empty, then 2, matching "Your Cart (2 items)".

**Actual:** The badge shows 1 with an empty cart and 3 with two items. The cart page itself is correct.

**Screenshot:** [BUG-005-count-echo-empty-cart-badge.png](docs/bug-evidence/BUG-005-count-echo-empty-cart-badge.png)

---

<a id="bug-006"></a>

## BUG-006: `lens_warp`: products show the wrong images

**Severity:** Medium | **Priority:** P2 | **Test:** `TC-VAR-01`

**Steps**

1. Log in as `lens_warp`.
2. Compare each product's image with its name, or with what `fern_signal` sees.

**Expected:** Each product shows its own image.

**Actual:** All 12 products show another product's image. For example, After Hours Hoodie shows a mug and
Bug Hunt Crew Socks shows a book.

**Screenshot:** [BUG-006-lens-warp-images.png](docs/bug-evidence/BUG-006-lens-warp-images.png)

---

<a id="bug-007"></a>

## BUG-007: "System overload" after 6 clicks blocks the item

**Severity:** High | **Priority:** P2 | **Test:** `TC-CART-09`

**Steps**

1. Log in, add Daybreak Ceramic Mug and open the cart.
2. Click **+** seven times.

**Expected:** The quantity goes up to 8.

**Actual:** The quantity stops at 6 and a red banner says "Error: System overload — item interaction limit
exceeded for this session. Please refresh the page to continue." After that, the mug can't be added again,
even after removing it from the cart. Refreshing, as the banner suggests, logs you out (BUG-009).

**Screenshot:** [BUG-007-overload-banner.png](docs/bug-evidence/BUG-007-overload-banner.png)

---

<a id="bug-008"></a>

## BUG-008: Cart isn't cleared after an order, so it can be placed twice

**Severity:** High | **Priority:** P1 | **Test:** `TC-CHK-06`

**Steps**

1. Log in, add Daybreak Ceramic Mug and Gridline Journal.
2. Check out and click **Finish**.
3. On the "Order Placed!" page, click **Cart** in the header.
4. Check out and click **Finish** again.

**Expected:** The cart is empty after the first order.

**Actual:** The badge still shows 2 and the cart still holds both items, so the same order can be placed a
second time. The cart only clears if you click **Continue Shopping** on the confirmation page.

**Screenshot:** [BUG-008-cart-not-cleared-after-order.png](docs/bug-evidence/BUG-008-cart-not-cleared-after-order.png)

---

<a id="bug-009"></a>

## BUG-009: Refreshing the page logs you out and empties the cart

**Severity:** Medium | **Priority:** P2 | **Test:** `TC-CART-10`

**Steps**

1. Log in and add two products to the cart.
2. Refresh the page.

**Expected:** Still logged in, with 2 items in the cart.

**Actual:** You're sent to the login page. After logging in again, the cart is empty.

**Screenshot:** none (the result is just the login page).

---

<a id="bug-010"></a>

## BUG-010: Pages fail WCAG 2.1 AA accessibility checks

**Severity:** Medium | **Priority:** P2 | **Test:** `TC-A11Y-01` (one test per page)

**Steps**

1. Install the free **axe DevTools** browser extension (Chrome or Firefox).
2. Log in as `fern_signal`.
3. Open the browser's developer tools, go to the **axe DevTools** tab and scan the products page.
4. Repeat on the login, cart, checkout and order summary pages.

**Expected:** No WCAG 2.1 AA violations.

**Actual:** Every page has violations:

- **Links with no text:** the 12 product image links on the products page, and the back-arrow link on the
  checkout form. A screen reader only says "link".
- **Button with no name (critical):** the back-arrow button on the order summary.
- **Low text contrast on every page.** The worst is the grey footer text at 2.23:1, where at least 4.5:1 is
  required. The "Demo only — no real payment is processed." note is 2.6:1.
- **Visible text missing from the screen-reader name:** the 4 practice-account buttons on the login page,
  and the Logout button ("Logout" on screen, "Log out" for screen readers).

**Evidence:** `npm run test:bugs` lists every broken rule for each page.

---

<a id="bug-011"></a>

## BUG-011: A long name pushes the order summary and Finish button off-screen

**Severity:** Medium | **Priority:** P3 | **Test:** `TC-CHK-08`

**Steps**

1. Log in, add any product to the cart and go to checkout.
2. Enter a 150-character first name with no spaces (for example `AAAA…`), any last name and postal code.
3. Click **Continue**.

**Expected:** The name wraps inside the "Shipping to" box and the page fits the screen.

**Actual:** The name runs out of the "Shipping to" box. On desktop the page becomes wider than the window and
the Payment Summary, including the **Finish** button, moves off-screen to the right. On phones the name runs
off the screen edge, and at iPhone SE size the whole page scrolls sideways. The shipping fields also have no
length limit.

**Screenshots:** [desktop](docs/bug-evidence/BUG-011-long-name-desktop.png),
[phone](docs/bug-evidence/BUG-011-long-name-phone.png)

---

## Other observations

These may be intentional, so I haven't filed them as bugs:

- The shipping fields accept anything, for example `12345` as a first name or `@@@@` as a postal code
  (see also BUG-011).
- Every login error starts with "Epic sadface below —", which looks like leftover placeholder text.
- The "12 items to explore" counter has no `data-test` attribute, unlike the rest of the page.
