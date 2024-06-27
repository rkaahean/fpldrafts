import { picksStore } from "../store";
import { DraftTransfer } from "../store/utils";

export const useDraftLoader = () => {
  const setDrafts = picksStore((state) => state.setDrafts);
  const gameweek = picksStore((state) => state.currentGameweek);

  const loadDrafts = async (
    draftId: string,
    name: string,
    description: string,
    bank: number
  ) => {
    const drafts: { data: DraftTransfer[] } = await fetch("/api/drafts/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draftId,
        gameweek,
      }),
    }).then((res) => res.json());

    setDrafts({
      id: draftId,
      name,
      description,
      changes: drafts.data,
      bank,
    });
  };

  return { loadDrafts };
};
