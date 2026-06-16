import { describe, it, expect } from "vitest";
import { parseTasksYaml } from "../src/tools/resolve.js";

const SAMPLE_YAML = `company: "AcmeCorp"
company_id: co-001
loaded_at: 2026-03-06T10:00:00.000Z
only_open: true
projects:
  - id: proj-alpha
    title: AlphaProject
    groups:
      - id: grp-dev
        title: Development
        tasks:
          - n: 1
            id: task-s1
            title: Setup CI/CD
            status: to_do
            task_type: project_task
          - n: 2
            id: task-s2
            title: "Deploy: staging"
            status: in_progress
            task_type: project_task
      - id: grp-design
        title: Design
        tasks:
          - n: 3
            id: task-s3
            title: Wireframes
            status: to_do
            task_type: project_task
    ungrouped:
      - n: 4
        id: task-s4
        title: General admin
        status: to_do
        task_type: standalone_task
  - id: proj-beta
    title: BetaProject
    groups:
      - id: grp-billing
        title: Billing
        tasks:
          - n: 5
            id: task-c1
            title: Setup billing system
            status: to_do
            task_type: project_task
          - n: 6
            id: task-c2
            title: Invoice flow
            status: to_do
            task_type: project_task
`;

const ALPHA_ONLY_YAML = `company: "AcmeCorp"
company_id: co-001
loaded_at: 2026-03-06T10:00:00.000Z
only_open: true
projects:
  - id: proj-alpha
    title: AlphaProject
    groups:
      - id: grp-dev
        title: Development
        tasks:
          - n: 1
            id: task-s1
            title: Setup CI/CD
            status: to_do
            task_type: project_task
          - n: 2
            id: task-s2
            title: "Deploy: staging"
            status: in_progress
            task_type: project_task
      - id: grp-design
        title: Design
        tasks:
          - n: 3
            id: task-s3
            title: Wireframes
            status: to_do
            task_type: project_task
    ungrouped:
      - n: 4
        id: task-s4
        title: General admin
        status: to_do
        task_type: standalone_task
`;

describe("parseTasksYaml", () => {
  it("parses all tasks from full YAML", () => {
    const tasks = parseTasksYaml(SAMPLE_YAML);
    expect(tasks.size).toBe(6);
    expect(tasks.get(1)?.id).toBe("task-s1");
    expect(tasks.get(5)?.id).toBe("task-c1");
    expect(tasks.get(6)?.id).toBe("task-c2");
  });

  it("parses filtered YAML with correct numbering", () => {
    const tasks = parseTasksYaml(ALPHA_ONLY_YAML);
    expect(tasks.size).toBe(4);
    expect(tasks.get(1)?.id).toBe("task-s1");
    expect(tasks.get(4)?.id).toBe("task-s4");
    // No task 5 or 6 in filtered output
    expect(tasks.get(5)).toBeUndefined();
  });

  it("preserves project and group context", () => {
    const tasks = parseTasksYaml(SAMPLE_YAML);
    const t1 = tasks.get(1)!;
    expect(t1.project_id).toBe("proj-alpha");
    expect(t1.project_title).toBe("AlphaProject");
    expect(t1.group_id).toBe("grp-dev");
    expect(t1.group_title).toBe("Development");

    const t5 = tasks.get(5)!;
    expect(t5.project_id).toBe("proj-beta");
    expect(t5.project_title).toBe("BetaProject");
    expect(t5.group_id).toBe("grp-billing");
    expect(t5.group_title).toBe("Billing");
  });

  it("ungrouped tasks have no group info", () => {
    const tasks = parseTasksYaml(SAMPLE_YAML);
    const t4 = tasks.get(4)!;
    expect(t4.group_id).toBeUndefined();
    expect(t4.group_title).toBeUndefined();
    expect(t4.task_type).toBe("standalone_task");
  });

  it("handles titles with colons (quoted)", () => {
    const tasks = parseTasksYaml(SAMPLE_YAML);
    const t2 = tasks.get(2)!;
    expect(t2.title).toBe("Deploy: staging");
  });

  it("task 6 in full vs filtered YAML demonstrates the bug fix", () => {
    const fullTasks = parseTasksYaml(SAMPLE_YAML);
    const filteredTasks = parseTasksYaml(ALPHA_ONLY_YAML);

    // In full YAML, task 6 = BetaProject's "Invoice flow"
    expect(fullTasks.get(6)?.title).toBe("Invoice flow");
    expect(fullTasks.get(6)?.project_title).toBe("BetaProject");

    // In filtered YAML, task 6 doesn't exist (only 4 AlphaProject tasks)
    expect(filteredTasks.get(6)).toBeUndefined();

    // task_selection=4 in filtered = AlphaProject's "General admin", not BetaProject task
    expect(filteredTasks.get(4)?.title).toBe("General admin");
    expect(filteredTasks.get(4)?.project_title).toBe("AlphaProject");
  });

  it("returns empty map for invalid content", () => {
    expect(parseTasksYaml("").size).toBe(0);
    expect(parseTasksYaml("not yaml at all").size).toBe(0);
  });
});
