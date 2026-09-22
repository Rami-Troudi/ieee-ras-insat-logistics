import { BoardAction } from "@/types";

export interface IBoardActionCenterService {
  getActions(): Promise<BoardAction[]>;
}
