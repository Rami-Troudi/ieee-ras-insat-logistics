export type MockScenario = "NORMAL" | "SUCCESS" | "EMPTY" | "ERROR" | "SLOW";

class ScenarioManager {
  private scenario: MockScenario = "NORMAL";

  setScenario(scenario: MockScenario): void {
    this.scenario = scenario;
  }

  getScenario(): MockScenario {
    return this.scenario;
  }

  async simulateLatency(defaultDelayMs = 200): Promise<void> {
    let delay = defaultDelayMs;
    if (this.scenario === "SLOW") {
      delay = 1500;
    }
    await new Promise((res) => setTimeout(res, delay));
    if (this.scenario === "ERROR") {
      throw new Error("Simulated mock service network error");
    }
  }

  isEmpty(): boolean {
    return this.scenario === "EMPTY";
  }
}

export const scenarioManager = new ScenarioManager();
