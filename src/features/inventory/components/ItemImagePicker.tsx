import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_EQUIPMENT_IMAGE } from "@/assets/equipmentImages";
import { Upload, X, Check } from "lucide-react";

export const PRESET_EQUIPMENT_IMAGES = [
  { label: "STM32", url: "/equipment/stm32-board.svg" },
  { label: "Arduino", url: "/equipment/arduino-board.svg" },
  { label: "Raspberry Pi", url: "/equipment/raspberry-pi.svg" },
  { label: "Sensors", url: "/equipment/sensor-module.svg" },
  { label: "Battery", url: "/equipment/battery-pack.svg" },
  { label: "Motors/Wheels", url: "/equipment/omni-wheels.svg" },
  { label: "Multimeter", url: "/equipment/multimeter.svg" },
  { label: "Component Kit", url: "/equipment/components-kit.svg" },
  { label: "Hardware Pack", url: "/equipment/hardware-pack.svg" },
  { label: "Tools", url: "/equipment/screwdrivers.svg" },
];

interface ItemImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  itemName?: string;
}

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 250;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export const ItemImagePicker: React.FC<ItemImagePickerProps> = ({
  value,
  onChange,
  label = "Item Picture (Catalogue & Cart View):",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const displayImage = value.trim() && !imageError ? value.trim() : DEFAULT_EQUIPMENT_IMAGE;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const compressedDataUrl = await compressImageFile(file);
      setImageError(false);
      onChange(compressedDataUrl);
    } catch {
      // ignore compression failure
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-semibold text-foreground text-xs block">{label}</label>

      {/* Main Container: Preview + Input Controls */}
      <div className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card/60">
        {/* Preview Thumbnail (exactly how it appears in cart/card) */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-border bg-muted/40 shrink-0 overflow-hidden flex items-center justify-center">
          <img
            src={displayImage}
            alt="Preview"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-1"
          />
          {value.trim() && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setImageError(false);
              }}
              title="Remove picture"
              className="absolute top-1 right-1 p-0.5 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-white transition-colors shadow-xs"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Input Controls */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="Paste image URL (https://... or /equipment/...)"
              value={value}
              onChange={(e) => {
                setImageError(false);
                onChange(e.target.value);
              }}
              className="h-8 text-xs flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="h-8 text-xs shrink-0 gap-1.5 px-2.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProcessingFile ? "Loading..." : "Upload"}</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Quick Presets Pills */}
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1 font-medium">
              Or pick an IEEE RAS equipment preset:
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {PRESET_EQUIPMENT_IMAGES.map((preset) => {
                const isSelected = value.trim() === preset.url;
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setImageError(false);
                      onChange(preset.url);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
