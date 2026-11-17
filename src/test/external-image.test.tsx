import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";

const upload = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => upload }));
vi.mock("@/lib/ext-storage.functions", () => ({ uploadImage: vi.fn() }));
import { ImageUpload } from "@/components/admin/shared";

afterEach(cleanup);
describe("External admin image input", () => {
  it("applies a public image link without calling the upload service", () => {
    const onChange = vi.fn();
    render(<I18nProvider><ImageUpload value={null} onChange={onChange} folder="posters" label="Poster" /></I18nProvider>);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "https://images.example.org/poster.webp" } });
    fireEvent.click(screen.getByRole("button", { name: "اعتماد الرابط" }));
    expect(onChange).toHaveBeenCalledWith("https://images.example.org/poster.webp");
    expect(upload).not.toHaveBeenCalled();
  });
  it("uses a pasted valid link even without pressing apply", () => {
    const onChange = vi.fn();
    render(<I18nProvider><ImageUpload value={null} onChange={onChange} folder="posters" label="Poster" /></I18nProvider>);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "https://i.ibb.co/x/p.jpg" } });
    expect(onChange).toHaveBeenCalledWith("https://i.ibb.co/x/p.jpg");
  });
  it("does not save an unsafe link", () => {
    const onChange = vi.fn();
    render(<I18nProvider><ImageUpload value={null} onChange={onChange} folder="posters" label="Poster" /></I18nProvider>);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "javascript:alert(1)" } });
    fireEvent.click(screen.getByRole("button", { name: "اعتماد الرابط" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});