import { describe, it, expect } from "vitest";
import {
  buildListTimetrackingBody,
  buildAddTimetrackingBody,
  formatDesc,
  dateToDDMMYYYY,
  buildManicTimeMemo,
} from "../src/tools/timetracking.js";

describe("buildListTimetrackingBody", () => {
  it("returns empty body when no params", () => {
    const body = buildListTimetrackingBody({});
    expect(body).toEqual({});
  });

  it("converts started_after to ISO datetime start-of-day", () => {
    const body = buildListTimetrackingBody({ started_after: "2024-06-15" });
    const filter = body.filter as Record<string, unknown>;
    expect(filter.started_after).toBe("2024-06-15T00:00:00+00:00");
  });

  it("converts started_before to ISO datetime end-of-day", () => {
    const body = buildListTimetrackingBody({ started_before: "2024-06-15" });
    const filter = body.filter as Record<string, unknown>;
    expect(filter.started_before).toBe("2024-06-15T23:59:59+00:00");
  });

  it("converts ended_after to start-of-day and ended_before to end-of-day", () => {
    const body = buildListTimetrackingBody({
      ended_after: "2024-01-01",
      ended_before: "2024-12-31",
    });
    const filter = body.filter as Record<string, unknown>;
    expect(filter.ended_after).toBe("2024-01-01T00:00:00+00:00");
    expect(filter.ended_before).toBe("2024-12-31T23:59:59+00:00");
  });

  it("strips time portion from date input (date-only format)", () => {
    const body = buildListTimetrackingBody({
      started_after: "2024-06-15T14:30:00+02:00",
    });
    const filter = body.filter as Record<string, unknown>;
    expect(filter.started_after).toBe("2024-06-15T00:00:00+00:00");
  });

  it("maps subject as {type, id} object", () => {
    const body = buildListTimetrackingBody({
      subject_type: "todo",
      subject_id: "task-123",
    });
    const filter = body.filter as Record<string, unknown>;
    expect(filter.subject).toEqual({ type: "todo", id: "task-123" });
  });

  it("does NOT add subject when only subject_type (no subject_id)", () => {
    const body = buildListTimetrackingBody({ subject_type: "todo" });
    expect(body).not.toHaveProperty("filter");
  });

  it("maps pagination correctly", () => {
    const body = buildListTimetrackingBody({ page: 2, page_size: 100 });
    expect(body.page).toEqual({ number: 2, size: 100 });
  });

  it("maps user_id filter", () => {
    const body = buildListTimetrackingBody({ user_id: "user-1" });
    expect((body.filter as Record<string, unknown>).user_id).toBe("user-1");
  });
});

describe("formatDesc", () => {
  it("returns full string when maxLen=0", () => {
    expect(formatDesc("hello\nworld", 0)).toBe("hello world");
  });
  it("truncates to maxLen with ellipsis", () => {
    expect(formatDesc("abcdef", 4)).toBe("abcd…");
  });
  it("does not truncate if string shorter than maxLen", () => {
    expect(formatDesc("abc", 10)).toBe("abc");
  });
  it("replaces CRLF with space", () => {
    expect(formatDesc("a\r\nb", 50)).toBe("a b");
  });
  it("replaces CR with space", () => {
    expect(formatDesc("a\rb", 50)).toBe("a b");
  });
  it("trims leading/trailing whitespace", () => {
    expect(formatDesc("  hello  ", 50)).toBe("hello");
  });
  it("handles empty string", () => {
    expect(formatDesc("", 50)).toBe("");
  });
});

describe("dateToDDMMYYYY", () => {
  it("converts ISO date to DD/MM/YYYY", () => {
    expect(dateToDDMMYYYY("2024-06-15")).toBe("15/06/2024");
  });
  it("returns '?' for empty string", () => {
    expect(dateToDDMMYYYY("")).toBe("?");
  });
  it("returns input as-is for invalid string without dash", () => {
    expect(dateToDDMMYYYY("invalid")).toBe("invalid");
  });
});

describe("buildManicTimeMemo", () => {
  it("returns memo with client, group, task", () => {
    expect(buildManicTimeMemo({ client_name: "Acme", group: "Dev", task: "Fix bug", project: "P1" }))
      .toBe("Acme, Dev, Fix bug");
  });
  it("returns '(no context)' when all fields are em-dash", () => {
    expect(buildManicTimeMemo({ client_name: "—", group: "—", task: "—", project: "—" }))
      .toBe("(no context)");
  });
  it("returns '(no context)' when fields are empty strings", () => {
    expect(buildManicTimeMemo({ client_name: "", group: "", task: "", project: "" }))
      .toBe("(no context)");
  });
  it("filters out empty group between valid fields", () => {
    expect(buildManicTimeMemo({ client_name: "Acme", group: "", task: "Fix", project: "—" }))
      .toBe("Acme, Fix");
  });
  it("falls back to project when client_name is em-dash", () => {
    expect(buildManicTimeMemo({ client_name: "—", group: "Dev", task: "Fix", project: "MyProject" }))
      .toBe("MyProject, Dev, Fix");
  });
});

describe("buildAddTimetrackingBody", () => {
  it("maps started_on to started_at (API field name)", () => {
    const body = buildAddTimetrackingBody({
      started_on: "2024-06-15T09:00:00+01:00",
    });
    expect(body.started_at).toBe("2024-06-15T09:00:00+01:00");
    expect(body).not.toHaveProperty("started_on");
  });

  it("maps ended_on to ended_at", () => {
    const body = buildAddTimetrackingBody({
      started_on: "2024-06-15T09:00:00+01:00",
      ended_on: "2024-06-15T10:00:00+01:00",
    });
    expect(body.ended_at).toBe("2024-06-15T10:00:00+01:00");
  });

  it("supports duration as alternative to ended_on", () => {
    const body = buildAddTimetrackingBody({
      started_on: "2024-06-15T09:00:00+01:00",
      duration: 3600,
    });
    expect(body.duration).toBe(3600);
    expect(body).not.toHaveProperty("ended_at");
  });

  it("maps subject as {type, id} object", () => {
    const body = buildAddTimetrackingBody({
      started_on: "2024-06-15T09:00:00+01:00",
      subject_type: "nextgenTask",
      subject_id: "task-1",
    });
    expect(body.subject).toEqual({ type: "nextgenTask", id: "task-1" });
  });

  it("does NOT add subject when only subject_type", () => {
    const body = buildAddTimetrackingBody({
      started_on: "2024-06-15T09:00:00+01:00",
      subject_type: "nextgenTask",
    });
    expect(body).not.toHaveProperty("subject");
  });

  it("includes invoiceable boolean", () => {
    const body = buildAddTimetrackingBody({
      started_on: "2024-06-15T09:00:00+01:00",
      invoiceable: false,
    });
    expect(body.invoiceable).toBe(false);
  });

  it("includes all optional fields", () => {
    const body = buildAddTimetrackingBody({
      started_on: "2024-06-15T09:00:00+01:00",
      user_id: "user-1",
      work_type_id: "wt-1",
      description: "Dev work",
      invoiceable: true,
      duration: 7200,
    });
    expect(body.user_id).toBe("user-1");
    expect(body.work_type_id).toBe("wt-1");
    expect(body.description).toBe("Dev work");
    expect(body.invoiceable).toBe(true);
    expect(body.duration).toBe(7200);
  });
});
