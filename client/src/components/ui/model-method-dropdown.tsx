import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/stores/app";

const ModelOptionDropdown = () => {
  const { selectedModel, setSelectedModel } = useAppStore();
  const options = [
    {
      label: "STRIDE",
      value: "stride",
      enabled: true,
    },
    {
      label: "DREAD",
      value: "dread",
      enabled: false,
    },
  ];

  return (
    <Select onValueChange={setSelectedModel} value={selectedModel}>
      <SelectTrigger className="min-w-[120px]">
        <SelectValue placeholder="Select a Model Method"/>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={!option.enabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModelOptionDropdown;
