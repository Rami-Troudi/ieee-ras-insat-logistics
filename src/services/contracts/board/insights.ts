import { BoardInsightsData } from "@/types";

export interface IBoardInsightsService {
  getInsights(): Promise<BoardInsightsData>;
}
