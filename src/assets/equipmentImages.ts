import arduinoBoard from "./equipment/arduino-board.svg";
import fallback from "./equipment/fallback.svg";
import motor from "./equipment/motor.svg";
import oscilloscope from "./equipment/oscilloscope.svg";
import raspberryPi from "./equipment/raspberry-pi.svg";
import sensorModule from "./equipment/sensor-module.svg";
import stm32Board from "./equipment/stm32-board.svg";

// Stable local illustrations for common equipment families. They are illustrations, not product photos.

export const EQUIPMENT_IMAGES: Record<string, string> = {
  "item-glue-sticks":
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  "item-strong-adhesive":
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  "item-m3-hardware-pack":
    "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80",
  "item-resistor-led-kit":
    "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80",
  "item-lipo-battery":
    "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80",
  "item-omni-wheels": motor,
  "item-fluke-multimeter":
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
  "item-precision-screwdrivers":
    "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80",
  "item-stm32-f4": stm32Board,
  "item-arduino-uno": arduinoBoard,
  "item-pololu-driver": sensorModule,
  "item-rpi-4": raspberryPi,
  "item-soldering-station":
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
  "item-bench-drill-press":
    "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80",
  "item-keysight-dso": oscilloscope,
};

export const DEFAULT_EQUIPMENT_IMAGE = fallback;
export const SENSOR_EQUIPMENT_IMAGE = sensorModule;
