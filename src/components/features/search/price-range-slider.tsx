"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  valueFrom?: string;
  valueTo?: string;
  onChangeFrom: (value: string | undefined) => void;
  onChangeTo: (value: string | undefined) => void;
}

export function PriceRangeSlider({
  min = 0,
  max = 500,
  step = 5,
  valueFrom,
  valueTo,
  onChangeFrom,
  onChangeTo,
}: PriceRangeSliderProps) {
  const t = useTranslations("search");

  const fromVal = valueFrom ? parseFloat(valueFrom) : min;
  const toVal = valueTo ? parseFloat(valueTo) : max;

  const handleSliderChange = (values: number[]) => {
    const [newFrom, newTo] = values;
    onChangeFrom(
      newFrom === min ? undefined : newFrom.toFixed(3)
    );
    onChangeTo(
      newTo === max ? undefined : newTo.toFixed(3)
    );
  };

  return (
    <div className="space-y-4">
      <Slider
        min={min}
        max={max}
        step={step}
        value={[fromVal, toVal]}
        onValueChange={handleSliderChange}
        className="w-full"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Label className="text-xs">{t("minPrice")}</Label>
          <Input
            type="number"
            step="0.001"
            min={min}
            value={valueFrom ?? ""}
            onChange={(e) => onChangeFrom(e.target.value || undefined)}
            placeholder={String(min)}
            className="mt-1"
          />
        </div>
        <span className="text-muted-foreground mt-5">—</span>
        <div className="flex-1">
          <Label className="text-xs">{t("maxPrice")}</Label>
          <Input
            type="number"
            step="0.001"
            max={max}
            value={valueTo ?? ""}
            onChange={(e) => onChangeTo(e.target.value || undefined)}
            placeholder={String(max)}
            className="mt-1"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("priceInKWD")}</p>
    </div>
  );
}
