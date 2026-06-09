/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";

export const metadata: Metadata = {
  title: "Privacy Policy — MotoCraft Careers",
  description: "Learn how MotoCraft collects, uses, and protects your personal information when you apply through our careers form.",
};

export default function PrivacyPolicy() {
  return (
    <div className="privacy-root">
      {/* Header */}
      <header
        className="privacy-header"
        style={{ justifyContent: "space-between" }}
      >
        <Link href="/" className="privacy-back">
          <IoChevronBack style={{ fontSize: "1rem" }} /> Back
        </Link>  
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/motocraft_icon_foreground.png" alt="MotoCraft" className="privacy-logo" />
        </Link>
      </header>

      {/* Content */}
      <main className="privacy-content">
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#F8F8F6",
            marginBottom: 8,
          }}
        >
          Privacy Policy
        </h1>
        <p
          style={{
            color: "#D5B47D",
            fontSize: "0.85rem",
            marginBottom: 40,
            opacity: 0.8,
          }}
        >
          Last updated: June 8, 2026
        </p>

        <Section title="1. Who We Are">
          <p>
            MotoCraft (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates this careers application form
            to collect job applications for positions at our dealership locations. This Privacy Policy
            explains how we collect, use, store, and protect your personal information when you
            submit an application through this website.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>When you submit an application through our form, we collect the following information:</p>
          <ul style={{ paddingLeft: 24, marginTop: 12 }}>
            <li><strong>Full Name</strong> — to identify you as an applicant</li>
            <li><strong>Email Address</strong> — to communicate with you regarding your application</li>
            <li><strong>Phone Number</strong> — to contact you for interviews or follow-ups</li>
            <li><strong>Location</strong> — to determine your proximity to our Bengaluru office</li>
            <li><strong>Position Applied For</strong> — to route your application to the correct department</li>
            <li><strong>Resume (optional)</strong> — to evaluate your qualifications and experience</li>
          </ul>
          <p style={{ marginTop: 16 }}>
            We also automatically collect:
          </p>
          <ul style={{ paddingLeft: 24, marginTop: 12 }}>
            <li><strong>Campaign Source</strong> — if you arrived via an advertising campaign (e.g., Facebook Ads), we capture the campaign identifier from the URL to measure the effectiveness of our recruitment efforts</li>
            <li><strong>Submission Timestamp</strong> — the date and time your application was submitted</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>Your personal information is used exclusively for:</p>
          <ul style={{ paddingLeft: 24, marginTop: 12 }}>
            <li>Processing and reviewing your job application</li>
            <li>Contacting you about your application status, interviews, or job offers</li>
            <li>Internal recruitment analytics and campaign performance tracking</li>
            <li>Maintaining records for compliance with employment laws</li>
          </ul>
          <p style={{ marginTop: 16 }}>
            We do <strong>not</strong> use your information for marketing, sell it to third parties,
            or share it with anyone outside our organization except as described in this policy.
          </p>
        </Section>

        <Section title="4. Data Storage & Security">
          <p>
            Your data is stored securely using industry-standard practices:
          </p>
          <ul style={{ paddingLeft: 24, marginTop: 12 }}>
            <li>Application data is stored in a secure PostgreSQL database hosted on encrypted servers</li>
            <li>Resumes are stored in Amazon Web Services (AWS) S3 with server-side encryption</li>
            <li>All data is transmitted over HTTPS (TLS encryption)</li>
            <li>Access to your data is restricted to authorized MotoCraft recruitment personnel only</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain your application data for a period of <strong>12 months</strong> from the date
            of submission. After this period, your data is permanently deleted unless you are hired,
            in which case your information becomes part of your employee records and is governed by
            our internal HR policies.
          </p>
          <p style={{ marginTop: 12 }}>
            You may request early deletion of your data at any time by contacting us (see Section 8).
          </p>
        </Section>

        <Section title="6. Third-Party Services">
          <p>
            We use the following third-party services to operate this form:
          </p>
          <ul style={{ paddingLeft: 24, marginTop: 12 }}>
            <li><strong>Vercel</strong> — website hosting and serverless functions</li>
            <li><strong>Amazon Web Services (AWS)</strong> — secure file storage for resumes</li>
            <li><strong>Neon / PostgreSQL</strong> — secure database storage for application data</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            These services are bound by their own privacy policies and are used solely to facilitate
            the technical operation of this application form.
          </p>
        </Section>

        <Section title="7. Cookies & Tracking">
          <p>
            This website does <strong>not</strong> use cookies, browser fingerprinting, or any
            client-side tracking technologies. The only tracking we perform is reading the
            <code style={{ background: "#2C2924", padding: "2px 6px", borderRadius: 4, fontSize: "0.85em" }}>
              campaign
            </code>{" "}
            URL parameter to identify the advertising source that referred you, if any.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: 24, marginTop: 12 }}>
            <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong>Correction</strong> — request correction of any inaccurate data</li>
            <li><strong>Deletion</strong> — request that we delete your application data</li>
            <li><strong>Withdraw</strong> — withdraw your application at any time</li>
          </ul>
          <p style={{ marginTop: 16 }}>
            To exercise any of these rights, please contact us at:
          </p>
          <div
            style={{
              marginTop: 12,
              padding: "16px 20px",
              background: "#2C2924",
              borderRadius: 10,
              border: "1px solid #6A5431",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: "#D5B47D" }}>MotoCraft HR Department</p>
            <p style={{ margin: "4px 0 0", color: "#F8F8F6", opacity: 0.8, fontSize: "0.9rem" }}>
              Email: motocraftblr@gmail.com
            </p>
          </div>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Any changes will be reflected on
            this page with an updated &quot;Last updated&quot; date. We encourage you to review this
            policy periodically.
          </p>
        </Section>

        <Section title="10. Consent">
          <p>
            By submitting your application through this form, you acknowledge that you have read
            and understood this Privacy Policy and consent to the collection, use, and storage of
            your personal information as described herein.
          </p>
        </Section>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #6A5431",
            textAlign: "center",
            color: "#D5B47D",
            fontSize: "0.8rem",
            opacity: 0.6,
          }}
        >
          © {new Date().getFullYear()} MotoCraft. All rights reserved.
        </div>
      </main>
    </div>
  );
}

/* Reusable section component */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: "1.15rem",
          fontWeight: 600,
          color: "#D5B47D",
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <div style={{ color: "#F8F8F6", opacity: 0.85, fontSize: "0.92rem" }}>
        {children}
      </div>
    </section>
  );
}
