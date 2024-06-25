import { picksStore } from "../store";

export const useDraftLoader = () => {
  const setDrafts = picksStore((state) => state.setDrafts);

  const loadDrafts = async (
    draftId: string,
    name: string,
    description: string,
    bank: number
  ) => {
    const drafts = await fetch("/api/drafts/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draftId,
      }),
    }).then((res) => res.json());

    const formattedDrafts = drafts.data.map((draft: any) => {
      return {
        in: draft.player_in_id,
        out: draft.player_out_id,
        gameweek: draft.gameweek,
      };
    });

    setDrafts({
      id: draftId,
      name,
      description,
      changes: formattedDrafts,
      bank,
    });
  };

  return { loadDrafts };
};
