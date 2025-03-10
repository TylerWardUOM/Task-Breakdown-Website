import { SwatchesPicker } from "react-color";
import { allowedColors, tailwindColorMap } from "../../lib/tailwindColourMap";

interface ColorSwatchesPickerProps {
    currentColor: string; // Hex color string
    onColorChange: (color: string) => void; // Callback function to handle color change
  }

  const ColorSwatchesPicker = ({ currentColor, onColorChange }: ColorSwatchesPickerProps) => {
  
    const formatColorsForPicker = (): string[][] => {
        return Object.values(allowedColors).map((colorShades) => {
          return colorShades
            .map((colorClass) => {
              const hex = tailwindColorMap[colorClass];
              if (!hex) {
                console.error(`Color not found for class: ${colorClass}`);
              }
              return hex;
            })
            .filter(Boolean); // Removes any undefined values
        });
      };
      
  
    return (
      <SwatchesPicker
        color={currentColor}
        onChangeComplete={(color) => onColorChange(color.hex)}
        colors={formatColorsForPicker()}
      />
    );
  };
  
  export default ColorSwatchesPicker;