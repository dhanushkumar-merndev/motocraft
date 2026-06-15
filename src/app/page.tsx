/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState, useRef, useEffect, FormEvent } from "react";

import {
  IoCheckmarkCircle,
  IoCloudUploadOutline,
  IoChevronForward,
  IoChevronBack,
  IoAlertCircleOutline,
} from "react-icons/io5";

const POSITIONS = [
  { label: "Sales Manager", value: "sales_manager" },
  { label: "Sales Executive", value: "sales_executive" },
  { label: "Test Rider", value: "test_rider" },
  { label: "Receptionist", value: "receptionist" },
  { label: "Service Manager", value: "service_manager" },
  { label: "Service Advisor", value: "service_advisor" },
  { label: "Technician", value: "technician" },
  { label: "Parts Manager", value: "parts_manager" },
  { label: "Parts Supervisor", value: "parts_supervisor" },
] as const;

const LOCATIONS = [
  { label: "Yes, I'm in Bengaluru", value: "Yes" },
  { label: "No", value: "No" },
] as const;

type FormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  positionApplyingFor: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    positionApplyingFor: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [serverError, setServerError] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);
  const [submitPulse, setSubmitPulse] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleChange(field: keyof FormData, value: string) {
    if (field === "phoneNumber") {
      value = value.replace(/\D/g, "").slice(0, 12);
    }
    if (field === "fullName") {
      value = value.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setResumeError("Only PDF files are accepted");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setResumeError("File must be under 2 MB");
      return;
    }
    setFile(f);
    setResumeError("");
  }

  function validateStep1() {
    const errs: FormErrors = {};
    if (formData.fullName.trim().length < 2) {
      errs.fullName = "Name must be at least 2 characters";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Enter a valid email address";
    }
    const digits = formData.phoneNumber.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      errs.phoneNumber = "Phone number must be 10 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs: FormErrors = {};
    if (!formData.location) {
      errs.location = "Select your location";
    }
    if (!formData.positionApplyingFor) {
      errs.positionApplyingFor = "Select a position";
    }
    setErrors((prev) => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  }

  function validateAll() {
    const errs: FormErrors = {};
    if (formData.fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Enter a valid email address";
    const digits = formData.phoneNumber.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) errs.phoneNumber = "Phone number must be 10 digits";
    if (!formData.location) errs.location = "Select your location";
    if (!formData.positionApplyingFor) errs.positionApplyingFor = "Select a position";
    setErrors(errs);
    if (!file) setResumeError("Resume is required");
    return Object.keys(errs).length === 0 && !!file;
  }

  function goStep(next: number) {
    setSlideDir(next > step ? "forward" : "back");
    setAnimKey((k) => k + 1);
    setStep(next);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    const isValid = isMobile ? validateAll() : (validateStep1() && validateStep2());
    if (!isValid) return;
    if (!file) { setResumeError("Resume is required"); return; }

    // Mobile submit pulse animation
    setSubmitPulse(true);
    setTimeout(() => setSubmitPulse(false), 600);

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const params = new URLSearchParams(window.location.search);
      const campaignName = params.get("campaign") || params.get("utm_campaign") || "collected via website";

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phoneNumber: formData.phoneNumber.replace(/\D/g, "").slice(-10),
          campaignName,
        }),
      });

      const body = await res.json();
      if (!body.success) {
        setServerError(body.error?.message || "Submission failed");
        setSubmitting(false);
        return;
      }

      const isNew = res.status === 201;
      const leadId = body.data.id;

      if (file) {
        const urlRes = await fetch(`/api/leads/${leadId}/resume-upload-url`);
        const urlBody = await urlRes.json();

        if (!urlBody.success) {
          setServerError("Failed to get upload URL");
          showToast("Failed to get upload URL. Please try again.", "error");
          setSubmitting(false);
          return;
        }

        const { uploadUrl, fileKey } = urlBody.data;

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => resolve();
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", "application/pdf");
          xhr.send(file);
        });

        await fetch(`/api/leads/${leadId}/resume`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileKey, isNew }),
        });
      }

      setSubmittedName(formData.fullName);
      setSuccess(true);
      showToast("Application submitted successfully!", "success");
      window.fbq?.("track", "Lead");
    } catch {
      setServerError("Something went wrong. Please try again.");
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormData({ fullName: "", email: "", phoneNumber: "", location: "", positionApplyingFor: "" });
    setErrors({});
    setFile(null);
    setUploadProgress(0);
    setSuccess(false);
    setServerError("");
    setResumeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTermsAccepted(false);
    setSubmittedName("");
    setStep(1);
  }

  /* ===================== SUCCESS STATE ===================== */
  if (success) {
    return (
      <div className="success-root">
        <div className="hero-panel">
          <img src="/logo.png" alt="MotoCraft" className="hero-logo" width={676} height={340} />
          <div className="hero-tagline">Welcome Aboard!</div>
          <div className="hero-sub">
            Your application has been received and is being reviewed by our team.
          </div>
        </div>

        <div className="success-panel">
          <div className="success-card success-enter">
            <div className="success-icon-wrap">
              <IoCheckmarkCircle />
            </div>
            <h1>Application Submitted</h1>
            <p>
              Thank you, {submittedName}! We&apos;ll be in touch within 2–3 business days.
            </p>
            <button className="btn-primary" onClick={resetForm}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===================== FORM STATE ===================== */
  return (
    <div className="page-root" data-step={step}>
      {/* Desktop left hero side */}
      <div className="hero-panel">
        <img src="/logo.png" alt="MotoCraft" className="hero-logo" width={676} height={340} />
        <div className="hero-tagline">Lead the Legacy.<br />Join the Ride.</div>
        <div className="hero-sub">
          A Global Premium Motorcycle Brand is launching soon in Central Bangalore.
    
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: toast.type === "success" ? "var(--success)" : "var(--error)",
            color: toast.type === "success" ? "#fff" : "#000",
            padding: "14px 24px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 500,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "toastIn 0.3s ease",
            maxWidth: "90vw",
          }}
        >
          {toast.type === "success" ? <IoCheckmarkCircle style={{ fontSize: "1.2rem" }} /> : <IoAlertCircleOutline style={{ fontSize: "1.2rem" }} />}
          {toast.message}
        </div>
      )}

      {/* Right side / full-screen on mobile */}
      <div className="form-panel">
        <div className="form-card-wrap">
          <div className="form-card">
            {/* Logo — mobile only */}
            <div className="mobile-logo">
              <img src="/logo.png" alt="MotoCraft" width={676} height={340} />
            </div>

            <div className="form-heading">
              <h1>Apply at MotoCraft</h1>
            <p className="mobile-only">Start your journey with us</p>
          </div>

          {/* Desktop step circles — hidden on mobile */}
          <div className="desktop-step-tracker desktop-only">
            {/* Step 1 */}
            <div className="dst-node">
              <div className={`dst-circle ${
                step > 1 ? "dst-done" : step === 1 ? "dst-active" : ""
              }`} onClick={() => step > 1 && goStep(1)} style={step > 1 ? {cursor:"pointer"} : {}}>
                {step > 1
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  : "1"}
              </div>
              <span className="dst-label">Personal Details</span>
            </div>
            {/* Line */}
            <div className={`dst-line ${step > 1 ? "dst-line-done" : ""}`} />
            {/* Step 2 */}
            <div className="dst-node">
              <div className={`dst-circle ${
                step > 2 ? "dst-done" : step === 2 ? "dst-active" : ""
              }`} onClick={() => step > 2 && goStep(2)} style={step > 2 ? {cursor:"pointer"} : {}}>
                {step > 2
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  : "2"}
              </div>
              <span className="dst-label">Preferences</span>
            </div>
            {/* Line */}
            <div className={`dst-line ${step > 2 ? "dst-line-done" : ""}`} />
            {/* Step 3 */}
            <div className="dst-node">
              <div className={`dst-circle ${step === 3 ? "dst-active" : ""}`}>
                3
              </div>
              <span className="dst-label">Upload Resume</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Slide wrapper for desktop step transitions */}
            <div
              key={animKey}
              className={`form-fields ${
                animKey > 0 ? `step-slide-${slideDir === "forward" ? "in-right" : "in-left"}` : ""
              }`}
            >
              {/* Step 1: Name, Email, Phone */}
              <div className="step-container step-1">
                {/* Full Name */}
                <div className="field-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder=""
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    disabled={submitting}
                  />
                  {errors.fullName && <div className="field-error">{errors.fullName}</div>}
                </div>

                {/* Email */}
                <div className="field-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder=""
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={submitting}
                  />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                {/* Phone */}
                <div className="field-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder=""
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    disabled={submitting}
                  />
                  {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
                </div>
              </div>

              {/* Step 2: Location, Position */}
              <div className="step-container step-2">
                {/* Location */}
                <div className="field-group">
                  <label htmlFor="location">Location</label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select Location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                  {errors.location && <div className="field-error">{errors.location}</div>}
                </div>

                {/* Position */}
                <div className="field-group">
                  <label htmlFor="positionApplyingFor">Position Applying For</label>
                  <select
                    id="positionApplyingFor"
                    value={formData.positionApplyingFor}
                    onChange={(e) => handleChange("positionApplyingFor", e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select Position</option>
                    {POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                  {errors.positionApplyingFor && (
                    <div className="field-error">{errors.positionApplyingFor}</div>
                  )}
                </div>
              </div>

              {/* Step 3: Resume upload */}
              <div className="step-container step-3">
                {/* Resume Upload */}
                <div className="field-group">
                  <label>Resume <span style={{ color: "var(--primary)" }}>*</span></label>
                  <div
                    className={`upload-zone${submitting ? " disabled" : ""}${file ? " has-file" : ""}`}
                    onClick={() => !submitting && fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (submitting) return;
                      const f = e.dataTransfer.files?.[0];
                      if (f) {
                        if (f.type !== "application/pdf") {
                          setResumeError("Only PDF files are accepted");
                          return;
                        }
                        if (f.size > 2 * 1024 * 1024) {
                          setResumeError("File must be under 2 MB");
                          return;
                        }
                        setFile(f);
                        setResumeError("");
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFile}
                      style={{ display: "none" }}
                      disabled={submitting}
                    />
                    {file ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontWeight: 500 }}>
                        <IoCheckmarkCircle style={{ fontSize: "1.2rem" }} />
                        <span style={{ textDecoration: "underline" }}>{file.name}</span>
                        <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>({formatFileSize(file.size)})</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <IoCloudUploadOutline style={{ fontSize: "1.6rem", color: "var(--primary)" }} />
                        <div>Drag &amp; drop or click to upload PDF (max 2 MB)</div>
                      </div>
                    )}
                  </div>
                  {resumeError && <div className="field-error">{resumeError}</div>}
                </div>

                {/* Upload progress bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--error)", fontSize: "0.8rem" }}>
                  <IoAlertCircleOutline style={{ fontSize: "1rem" }} />
                  <span>{serverError}</span>
                </div>
              )}
              {/* Step 4: Terms & Conditions Check */}
              <div className="step-container step-4">
                <div className="desktop-only" style={{ textAlign: "center", marginBottom: "12px" }}>
                  <h2 style={{ fontSize: "1.2rem", color: "var(--text)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Review &amp; Submit</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "8px", lineHeight: 1.5 }}>
                    Please review your application details and agree to our terms before submitting.
                  </p>
                </div>
                
                {/* Consent and Privacy Policy Checkbox */}
                <label className="privacy-note" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", textAlign: "left", marginTop: "10px", marginBottom: "10px" }}>
                  <div style={{
                    width: "20px", height: "20px", flexShrink: 0, marginTop: "2px",
                    border: `2px solid ${termsAccepted ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "4px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: termsAccepted ? "rgba(213, 180, 125, 0.1)" : "transparent",
                    transition: "all 0.2s ease"
                  }}>
                    {termsAccepted && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ display: "none" }}
                  />
                  <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                    I agree to the{" "}
                    <Link
                      href="/privacy"
                      style={{ color: "var(--text-muted)", textDecoration: "underline" }}
                    >
                      Privacy Policy
                    </Link>
                    {" "}and confirm that the information provided is accurate.
                  </span>
                </label>
              </div>


              {/* Buttons */}
              <div className="btn-container">
                {/* Back button */}
                <button
                  type="button"
                  className="btn-back btn-ghost"
                  onClick={() => goStep(step - 1)}
                  disabled={submitting}
                >
                  <IoChevronBack /> Back
                </button>

                {/* Next button */}
                <button
                  type="button"
                  className="btn-next btn-primary"
                  onClick={() => {
                    if (step === 1 && validateStep1()) goStep(2);
                    else if (step === 2 && validateStep2()) goStep(3);
                    else if (step === 3 && file) goStep(4);
                    else if (step === 3 && !file) setResumeError("Resume is required");
                  }}
                >
                  Next <IoChevronForward />
                </button>

                {/* Submit button — pulse on mobile submit */}
                <button
                  type="submit"
                  className={`btn-submit btn-primary${submitPulse ? " btn-pulse" : ""}`}
                  disabled={submitting || !termsAccepted}
                >
                  {submitting ? (
                    <span className="spinner" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              paddingTop: "20px",
              color: "var(--text-dim)",
              fontSize: "0.7rem",
            }}
          >
            © {new Date().getFullYear()} MotoCraft. All rights reserved. ·{" "}
            <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
          </div>

          </div>{/* /form-card */}
        </div>{/* /form-card-wrap */}
      </div>{/* /form-panel */}
    </div>
  );
}
