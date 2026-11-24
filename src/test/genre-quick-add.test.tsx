import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenreQuickAdd } from "@/components/admin/GenreQuickAdd";
import { I18nProvider } from "@/lib/i18n";

const { insertGenre, selectInserted, singleInserted, invalidateQueries } = vi.hoisted(() => ({
  insertGenre: vi.fn(),
  selectInserted: vi.fn(),
  singleInserted: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  supabase: {
    from: (table: string) => {
      if (table !== "genres") throw new Error(`Unexpected table: ${table}`);
      return { insert: insertGenre };
    },
  },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return { ...actual, useQueryClient: () => ({ invalidateQueries }) };
});

describe("Quick genre creation from a series", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const genre = { id: "genre-1", slug: "family", name_ar: "عائلي", name_en: "عائلي", name_fr: "عائلي", name_tr: "عائلي", created_at: "2026-01-01" };
    insertGenre.mockReturnValue({ select: selectInserted });
    selectInserted.mockReturnValue({ single: singleInserted });
    singleInserted.mockResolvedValue({ data: genre, error: null });
  });

  it("permanently inserts the new genre, refreshes the genre list, and selects it", async () => {
    const onCreated = vi.fn();
    render(<I18nProvider><GenreQuickAdd onCreated={onCreated} /></I18nProvider>);
    fireEvent.change(screen.getByLabelText("إضافة تصنيف"), { target: { value: "Family" } });
    fireEvent.click(screen.getByRole("button", { name: "إضافة" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "genre-1" })));
    expect(insertGenre).toHaveBeenCalledWith({ slug: "family", name_ar: "Family", name_en: "Family", name_fr: "Family", name_tr: "Family" });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["genres"] });
  });
});
