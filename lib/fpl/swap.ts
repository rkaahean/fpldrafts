import type {
  DraftTransfer,
  FPLGameweekPicksData,
  FPLPlayerData,
} from "./types";

export async function swapPlayers(
  data: FPLGameweekPicksData,
  transfer: DraftTransfer
): Promise<FPLGameweekPicksData> {
  const { in: substitutedIn, out: substitutedOut } = transfer;

  const inPlayerIndex = data.data.findIndex(
    (player) => player.fpl_player.player_id === substitutedIn.data.player_id
  );
  const outPlayerIndex = data.data.findIndex(
    (player) => player.fpl_player.player_id === substitutedOut.data.player_id
  );

  if (outPlayerIndex === -1) {
    return data;
  }

  let inPlayer: FPLPlayerData;
  if (inPlayerIndex === -1) {
    inPlayer = {
      fpl_player: substitutedIn.data,
      position: data.data[outPlayerIndex].position,
      selling_price: substitutedIn.price,
    };
  } else {
    inPlayer = {
      ...data.data[inPlayerIndex],
      position: data.data[inPlayerIndex].position,
      selling_price: data.data[inPlayerIndex].selling_price,
    };
  }

  const outPlayer = { ...data.data[outPlayerIndex] };
  const newData = [...data.data];

  if (inPlayerIndex === -1) {
    inPlayer.position = outPlayer.position;
    newData[outPlayerIndex] = inPlayer;
  } else {
    const tempPosition = inPlayer.position;
    inPlayer.position = outPlayer.position;
    outPlayer.position = tempPosition;

    newData[inPlayerIndex] = inPlayer;
    newData[outPlayerIndex] = outPlayer;
  }

  return {
    data: newData,
    overall: {
      ...data.overall,
      bank: data.overall.bank + substitutedOut.price - substitutedIn.price,
    },
  };
}
