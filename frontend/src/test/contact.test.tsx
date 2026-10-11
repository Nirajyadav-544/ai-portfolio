import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Contact, { contactSchema } from "../pages/Contact";
import { toFriendlyError } from "../services/api";
import { formatRange, safeHref } from "../utils/format";

vi.mock("../hooks/useProfile", () => ({ useProfile: () => null }));

describe("contact schema", () => {
  it("rejects invalid input", () => {
    const r = contactSchema.safeParse({ name: "", email: "x", subject: "", message: "short" });
    expect(r.success).toBe(false);
  });
  it("accepts valid input", () => {
    expect(contactSchema.safeParse({ name: "Ada", email: "ada@example.com", subject: "Hi", message: "Hello there friend" }).success).toBe(true);
  });
});

describe("contact form", () => {
  it("shows validation errors without calling the API", async () => {
    render(<MemoryRouter><Contact /></MemoryRouter>);
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email|please enter your email/i)).toBeInTheDocument();
  });
});

describe("utils", () => {
  it("blocks unsafe URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("https://example.com")).toBe("https://example.com");
  });
  it("formats open ranges", () => {
    expect(formatRange("2022-01-01", null, "Present")).toContain("Present");
  });
  it("maps network errors to a friendly message", () => {
    expect(toFriendlyError(new Error("boom")).message).toMatch(/something went wrong/i);
  });
});
