import { SwatchesPicker } from "react-color";
import { allowedColors, tailwindColorMap } from "../../lib/tailwindColourMap";

interface ColorSwatchesPickerProps {
  currentColor: string; // Hex color string
  onColorChange: (color: string) => void; // Callback function to handle color change
}

const ColorSwatchesPicker = ({ currentColor, onColorChange }: ColorSwatchesPickerProps) => {

  // Convert Tailwind color map into a reverse lookup dictionary (hex -> tailwind class)
  const hexToTailwindClass = (hex: string): string | null => {
    for (const [tailwindClass, mappedHex] of Object.entries(tailwindColorMap)) {
      if (mappedHex.toLowerCase() === hex.toLowerCase()) {
        return tailwindClass;
      }
    }
    console.error(`No matching Tailwind class found for hex: ${hex}`);
    return null;
  };

  // Prepare colors for the picker
  const formatColorsForPicker = (): string[][] => {
    return Object.values(allowedColors).map((colorShades) => {
      return colorShades
        .map((colorClass) => tailwindColorMap[colorClass])
        .filter(Boolean) as string[]; // Removes any undefined values
    });
  };

  const formatColorForPicker = (currentColor: string): string => {
    return tailwindColorMap[currentColor] || currentColor; // Fallback to original if not found
};


  return (
    <SwatchesPicker
      color={formatColorForPicker(currentColor)}
      onChangeComplete={(color) => {
        const tailwindClass = hexToTailwindClass(color.hex);
        if (tailwindClass) {
          onColorChange(tailwindClass); // Return Tailwind class instead of hex
        }
      }}
      colors={formatColorsForPicker()}
    />
  );
};

export default ColorSwatchesPicker;
