import { Link } from "react-router-dom";

const supportEmail = "unirentcustomer@gmail.com";
const supportPhone = "+918077561640";
const lastUpdated = "May 24, 2026";

function LegalShell({ title, intro, children }) {
  return (
    <div className="page-shell">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <p className="label">UniRent policy</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">{intro}</p>
        <p className="mt-4 text-sm font-semibold text-slate-500">Last updated: {lastUpdated}</p>
      </section>
      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 shadow-sm">
        {children}
      </section>
      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950 shadow-sm">
        <p className="font-bold">Need help with a policy question?</p>
        <p className="mt-1">
          Contact UniRent support at <a className="font-semibold text-campus" href={`mailto:${supportEmail}`}>{supportEmail}</a>
          {" "}or <a className="font-semibold text-campus" href={`tel:${supportPhone}`}>+91 8077561640</a>.
        </p>
      </section>
    </div>
  );
}

function PolicyBlock({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

export function TermsAndConditions() {
  return (
    <LegalShell
      title="Terms & Conditions"
      intro="These terms explain how students use UniRent to list items, request rentals, pay securely, return items, and settle refundable deposits."
    >
      <PolicyBlock title="1. About UniRent">
        <p>
          UniRent is a student rental marketplace where users can list useful campus items and request short-term rentals from other users.
          The platform records listings, rental dates, payment status, return OTP confirmation, and deposit settlement status.
        </p>
      </PolicyBlock>
      <PolicyBlock title="2. User accounts">
        <p>
          Users must provide accurate registration details and keep account credentials private. Each user is responsible for activity performed from their account.
        </p>
      </PolicyBlock>
      <PolicyBlock title="3. Listings and rental requests">
        <p>
          Owners should list items with clear photos, rent per day, refundable deposit amount, condition, pickup address, and contact details.
          Renters should review the listing before submitting a rental request.
        </p>
      </PolicyBlock>
      <PolicyBlock title="4. Payments and checkout">
        <p>
          UniRent uses Razorpay checkout for rent and deposit collection. A rental can move to active status only after successful payment verification.
          UniRent currently supports single-item checkout after owner approval, so a separate shopping cart is not required for the rental workflow.
        </p>
      </PolicyBlock>
      <PolicyBlock title="5. Returns and deposit settlement">
        <p>
          The renter starts the return process from My Rentals. The return is confirmed through OTP, then the owner can refund the deposit or deduct an eligible amount for damage or late return.
        </p>
      </PolicyBlock>
      <PolicyBlock title="6. Prohibited use">
        <p>
          Users must not list illegal, unsafe, counterfeit, restricted, or misleading items. UniRent may remove listings or block accounts that misuse the platform.
        </p>
      </PolicyBlock>
      <PolicyBlock title="7. Contact">
        <p>
          For support, email <a className="font-semibold text-campus" href={`mailto:${supportEmail}`}>{supportEmail}</a>,
          call <a className="font-semibold text-campus" href={`tel:${supportPhone}`}>+91 8077561640</a>, or visit the{" "}
          <Link className="font-semibold text-campus" to="/help">Help Center</Link>.
        </p>
      </PolicyBlock>
    </LegalShell>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro="This policy explains what information UniRent collects and how it is used to operate rentals, payments, support, and account security."
    >
      <PolicyBlock title="1. Information we collect">
        <p>
          UniRent may collect name, email, mobile number, login details, listed item details, item photos, rental dates, pickup information,
          payment status, Razorpay payment identifiers, reviews, and support messages.
        </p>
      </PolicyBlock>
      <PolicyBlock title="2. How we use information">
        <p>
          Information is used to create accounts, show listings, process rental requests, verify payments, manage returns, support refunds,
          prevent misuse, and respond to customer support requests.
        </p>
      </PolicyBlock>
      <PolicyBlock title="3. Payment data">
        <p>
          Payments are processed through Razorpay. UniRent stores payment status and Razorpay transaction identifiers, but does not store full card, UPI PIN, CVV, or banking credentials.
        </p>
      </PolicyBlock>
      <PolicyBlock title="4. Information sharing">
        <p>
          Relevant listing and contact details may be visible to renters and owners for rental coordination. Payment processing information is shared with Razorpay as needed to complete transactions and refunds.
        </p>
      </PolicyBlock>
      <PolicyBlock title="5. Data security">
        <p>
          UniRent uses authenticated API requests and protected environment variables for secrets. Users should keep their passwords private and report suspicious activity promptly.
        </p>
      </PolicyBlock>
      <PolicyBlock title="6. Contact">
        <p>
          For privacy questions or account data requests, email{" "}
          <a className="font-semibold text-campus" href={`mailto:${supportEmail}`}>{supportEmail}</a> or call{" "}
          <a className="font-semibold text-campus" href={`tel:${supportPhone}`}>+91 8077561640</a>.
        </p>
      </PolicyBlock>
    </LegalShell>
  );
}

export function RefundCancellationPolicy() {
  return (
    <LegalShell
      title="Refund & Cancellation Policy"
      intro="This policy explains when rental requests can be cancelled and how refundable deposits are settled after item return."
    >
      <PolicyBlock title="1. Cancellation before payment">
        <p>
          A renter can delete a pending rental request before payment. No charge is collected when a request is deleted before successful checkout.
        </p>
      </PolicyBlock>
      <PolicyBlock title="2. Cancellation after payment">
        <p>
          Once a payment is completed and the rental becomes active, cancellation depends on owner coordination and item handover status.
          Users should contact support with the rental details if a paid rental must be cancelled.
        </p>
      </PolicyBlock>
      <PolicyBlock title="3. Deposit refund after return">
        <p>
          After the renter returns the item and the return OTP is verified, the owner can initiate the deposit refund from My Rentals.
          Refunds are sent back through Razorpay to the original payment method where supported.
        </p>
      </PolicyBlock>
      <PolicyBlock title="4. Deposit deductions">
        <p>
          The owner may deduct from the deposit for damage, missing accessories, or late return charges. Any deduction should match the item condition, listing details, and rental record.
        </p>
      </PolicyBlock>
      <PolicyBlock title="5. Refund timelines">
        <p>
          Razorpay refund timelines depend on the payment method and banking network. Standard refunds commonly take several working days after the refund is initiated.
        </p>
      </PolicyBlock>
      <PolicyBlock title="6. Support">
        <p>
          For refund disputes, include the item name, rental dates, payment status, and screenshots when contacting{" "}
          <a className="font-semibold text-campus" href={`mailto:${supportEmail}`}>{supportEmail}</a> or{" "}
          <a className="font-semibold text-campus" href={`tel:${supportPhone}`}>+91 8077561640</a>.
        </p>
      </PolicyBlock>
    </LegalShell>
  );
}
