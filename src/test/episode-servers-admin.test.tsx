import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EpisodesAdmin } from "@/components/admin/EpisodesAdmin";
import { I18nProvider } from "@/lib/i18n";

const { insertEpisode } = vi.hoisted(() => ({ insertEpisode: vi.fn() }));

vi.mock("@/lib/db", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "episodes") return { insert: insertEpisode };
      throw new Error(`Unexpected table: ${table}`);
    },
  },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
    useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[1] === "series"
      ? { data: [{ id: "series-1", title: "Test series", poster_url: null }] }
      : { data: { seasons: [{ id: "season-1", season_number: 1 }], episodes: [] } },
  };
});

describe("Episode server editor", () => {
  beforeEach(() => {
    insertEpisode.mockReset();
    insertEpisode.mockResolvedValue({ error: null });
  });

  it("adds a second server and saves both names and URLs", async () => {
    render(<I18nProvider><EpisodesAdmin /></I18nProvider>);
    fireEvent.click(screen.getByRole("button", { name: "حلقة جديدة" }));
    fireEvent.change(screen.getByLabelText("العنوان"), { target: { value: "الحلقة الأولى" } });
    fireEvent.click(screen.getByRole("button", { name: "إضافة سيرفر" }));

    const names = screen.getAllByLabelText("اسم السيرفر (اختياري)");
    const urls = screen.getAllByLabelText("رابط السيرفر أو كود iframe");
    expect(urls).toHaveLength(2);
    fireEvent.change(names[0]!, { target: { value: "Main" } });
    fireEvent.change(urls[0]!, { target: { value: "https://cdn.example.org/episode.mp4" } });
    fireEvent.change(names[1]!, { target: { value: "Backup" } });
    fireEvent.change(urls[1]!, { target: { value: "https://player.example.org/watch/42" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ" }));

    await waitFor(() => expect(insertEpisode).toHaveBeenCalledOnce());
    expect(insertEpisode.mock.calls[0]?.[0].video_url).toBe("Main | https://cdn.example.org/episode.mp4\nBackup | https://player.example.org/watch/42");
  });

  it("accepts a pasted iframe and saves only its normalized source URL", async () => {
    render(<I18nProvider><EpisodesAdmin /></I18nProvider>);
    fireEvent.click(screen.getByRole("button", { name: "حلقة جديدة" }));
    fireEvent.change(screen.getByLabelText("العنوان"), { target: { value: "حلقة iframe" } });
    fireEvent.change(screen.getByLabelText("رابط السيرفر أو كود iframe"), {
      target: { value: '<IFRAME SRC="https://morencius.com/embed/l6eahvi6e3wg" FRAMEBORDER=0 allowfullscreen></IFRAME>' },
    });
    fireEvent.click(screen.getByRole("button", { name: "حفظ" }));

    await waitFor(() => expect(insertEpisode).toHaveBeenCalledOnce());
    expect(insertEpisode.mock.calls[0]?.[0].video_url).toBe("https://morencius.com/embed/l6eahvi6e3wg");
  });
});
