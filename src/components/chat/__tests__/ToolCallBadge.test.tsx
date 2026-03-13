import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

test("shows 'Creating <filename>' for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/components/Button.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing <filename>' for str_replace_editor str_replace command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "src/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Editing <filename>' for str_replace_editor insert command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "src/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Reading <filename>' for str_replace_editor view command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "src/index.ts" }}
      state="result"
    />
  );
  expect(screen.getByText("Reading index.ts")).toBeDefined();
});

test("shows 'Deleting <filename>' for file_manager delete command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "src/OldComponent.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
});

test("shows 'Renaming <old> to <new>' for file_manager rename command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Renaming Foo.tsx to Bar.tsx")).toBeDefined();
});

test("falls back to tool name for unknown tools", () => {
  render(
    <ToolCallBadge
      toolName="unknown_tool"
      args={{}}
      state="result"
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("shows spinner when state is not 'result'", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is 'result'", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "App.jsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
