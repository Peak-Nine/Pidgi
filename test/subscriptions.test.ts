import { describe, it, expect } from "vitest";
import { buildListSubscriptionsBody } from "../src/tools/subscriptions.js";

describe("buildListSubscriptionsBody", () => {
  it("maps customer_type + customer_id to filter.customer {type, id}", () => {
    const body = buildListSubscriptionsBody({
      customer_type: "company",
      customer_id: "comp-123",
    });
    expect((body.filter as Record<string, unknown>).customer).toEqual({
      type: "company",
      id: "comp-123",
    });
  });

  it("does NOT add customer when only customer_type (no customer_id)", () => {
    const body = buildListSubscriptionsBody({ customer_type: "contact" });
    expect(body).not.toHaveProperty("filter");
  });

  it("does NOT add customer when only customer_id (no customer_type)", () => {
    const body = buildListSubscriptionsBody({ customer_id: "comp-123" } as any);
    expect(body).not.toHaveProperty("filter");
  });

  it("maps sort_field to sort array with default order asc", () => {
    const body = buildListSubscriptionsBody({ sort_field: "title" });
    expect(body.sort).toEqual([{ field: "title", order: "asc" }]);
  });

  it("uses provided sort_order", () => {
    const body = buildListSubscriptionsBody({ sort_field: "created_at", sort_order: "desc" });
    expect(body.sort).toEqual([{ field: "created_at", order: "desc" }]);
  });

  it("maps ids filter to array", () => {
    const body = buildListSubscriptionsBody({ ids: ["sub-1", "sub-2"] });
    expect((body.filter as Record<string, unknown>).ids).toEqual(["sub-1", "sub-2"]);
  });

  it("maps status filter", () => {
    const body = buildListSubscriptionsBody({ status: ["active"] });
    expect((body.filter as Record<string, unknown>).status).toEqual(["active"]);
  });

  it("returns empty body when no params", () => {
    const body = buildListSubscriptionsBody({});
    expect(body).toEqual({});
  });

  it("maps pagination correctly", () => {
    const body = buildListSubscriptionsBody({ page: 2, page_size: 50 });
    expect(body.page).toEqual({ number: 2, size: 50 });
  });
});
