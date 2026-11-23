import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenresAdmin } from "@/components/admin/GenresAdmin";
import { I18nProvider } from "@/lib/i18n";

const { insertGenre } = vi.hoisted(() => ({ insertGenre: vi.fn() }));

vi.mock("@/lib/db", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "genres") return { insert: insertGenre };
      throw new Error(`Unexpected table: ${table}`);
    },
  },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
    useQuery: () => ({ data: [] }),
  };
});

describe("Genre administration", () => {
  beforeEach(() => {
    insertGenre.mockReset();
    insertGenre.mockResolvedValue({ error: null });
  });

  it("adds a custom genre and fills missing translations with its Arabic name", async () => {
    render(<I18nProvider><GenresAdmin /></I18nProvider>);
    fireEvent.click(screen.getByRole("button", { name: "إضافة تصنيف" }));
    fireEvent.change(screen.getByLabelText("اسم التصنيف بالعربية"), { target: { value: "عائلي" } });
    fireEvent.change(screen.getByLabelText("اسم التصنيف بالإنجليزية"), { target: { value: "Family" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ" }));

    await waitFor(() => expect(insertGenre).toHaveBeenCalledOnce());
    expect(insertGenre).toHaveBeenCalledWith({
      slug: "family",
      name_ar: "عائلي",
      name_en: "Family",
      name_fr: "عائلي",
      name_tr: "عائلي",
    });
  });

  it("connects an Arabic-only Arabic-series genre to its homepage section", async () => {
    render(<I18nProvider><GenresAdmin /></I18nProvider>);
    fireEvent.click(screen.getByRole("button", { name: "إضافة تصنيف" }));
    fireEvent.change(screen.getByLabelText("اسم التصنيف بالعربية"), { target: { value: "المسلسلات العربية" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ" }));

    await waitFor(() => expect(insertGenre).toHaveBeenCalledOnce());
    expect(insertGenre.mock.calls[0]?.[0].slug).toBe("arabic");
  });
});
