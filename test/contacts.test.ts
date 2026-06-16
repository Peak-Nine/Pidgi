import { describe, it, expect } from "vitest";
import { buildListContactsBody, buildCreateContactBody } from "../src/tools/contacts.js";

describe("buildListContactsBody", () => {
  it("returns empty body when no params", () => {
    const body = buildListContactsBody({});
    expect(body).toEqual({});
    expect(body).not.toHaveProperty("filter");
  });

  it("maps term filter correctly", () => {
    const body = buildListContactsBody({ term: "Jan" });
    expect((body.filter as Record<string, unknown>).term).toBe("Jan");
  });

  it("maps tags filter", () => {
    const body = buildListContactsBody({ tags: ["prospect", "vip"] });
    expect((body.filter as Record<string, unknown>).tags).toEqual(["prospect", "vip"]);
  });

  it("maps pagination correctly", () => {
    const body = buildListContactsBody({ page: 2, page_size: 50 });
    expect(body.page).toEqual({ number: 2, size: 50 });
  });

  it("defaults page number to 1 when only page_size given", () => {
    const body = buildListContactsBody({ page_size: 10 });
    expect(body.page).toEqual({ number: 1, size: 10 });
  });

  it("maps status and updated_since", () => {
    const body = buildListContactsBody({
      status: "active",
      updated_since: "2024-01-01",
    });
    const filter = body.filter as Record<string, unknown>;
    expect(filter.status).toBe("active");
    expect(filter.updated_since).toBe("2024-01-01");
  });

  it("maps company_id filter", () => {
    const body = buildListContactsBody({ company_id: "comp-1" });
    expect((body.filter as Record<string, unknown>).company_id).toBe("comp-1");
  });
});

describe("buildCreateContactBody", () => {
  it("maps email to emails array with type primary", () => {
    const body = buildCreateContactBody({
      last_name: "Doe",
      email: "john@example.com",
    });
    expect(body.emails).toEqual([{ type: "primary", email: "john@example.com" }]);
  });

  it("maps phone and mobile to telephones array", () => {
    const body = buildCreateContactBody({
      last_name: "Doe",
      phone: "+32 2 123 45 67",
      mobile: "+32 472 12 34 56",
    });
    expect(body.telephones).toEqual([
      { type: "phone", number: "+32 2 123 45 67" },
      { type: "mobile", number: "+32 472 12 34 56" },
    ]);
  });

  it("only includes last_name when minimal params", () => {
    const body = buildCreateContactBody({ last_name: "Doe" });
    expect(body).toEqual({ last_name: "Doe" });
    expect(body).not.toHaveProperty("emails");
    expect(body).not.toHaveProperty("telephones");
  });

  it("includes all optional fields", () => {
    const body = buildCreateContactBody({
      first_name: "John",
      last_name: "Doe",
      language: "nl",
      gender: "male",
      salutation: "Mr",
      website: "https://example.com",
      remarks: "Test",
      tags: ["vip"],
    });
    expect(body.first_name).toBe("John");
    expect(body.language).toBe("nl");
    expect(body.gender).toBe("male");
    expect(body.salutation).toBe("Mr");
    expect(body.website).toBe("https://example.com");
    expect(body.remarks).toBe("Test");
    expect(body.tags).toEqual(["vip"]);
  });
});
