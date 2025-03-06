import * as React from "react";
import { Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LayersPanelProps {
  isCollapsed: boolean;
}

// Example layer data structure
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  selected: boolean;
}

export function LayersPanel({ isCollapsed }: LayersPanelProps) {
  // Example layers data
  const [layers, setLayers] = React.useState<Layer[]>([
    { id: "1", name: "Background", visible: true, locked: false, selected: false },
    { id: "2", name: "Layer 1", visible: true, locked: false, selected: true },
    { id: "3", name: "Layer 2", visible: true, locked: false, selected: false },
  ]);

  const toggleVisibility = (id: string) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLock = (id: string) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const selectLayer = (id: string) => {
    setLayers(layers.map(layer => 
      ({ ...layer, selected: layer.id === id })
    ));
  };

  const addLayer = () => {
    const newId = (layers.length + 1).toString();
    setLayers([
      ...layers,
      { id: newId, name: `Layer ${newId}`, visible: true, locked: false, selected: false }
    ]);
  };

  const deleteLayer = (id: string) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <h2 className={cn("flex items-center gap-2 font-semibold", 
          isCollapsed && "hidden")}>
          <Layers className="h-5 w-5" />
          <span>Layers</span>
        </h2>
        {isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Layers className="h-5 w-5" />
                <span className="sr-only">Layers</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Layers</TooltipContent>
          </Tooltip>
        )}
        <div className={cn("ml-auto flex items-center gap-1", isCollapsed && "hidden")}>
          <Button variant="ghost" size="icon" onClick={addLayer}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add layer</span>
          </Button>
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!isCollapsed ? (
            <div className="space-y-1">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    layer.selected && "bg-accent"
                  )}
                  onClick={() => selectLayer(layer.id)}
                >
                  <div className="flex-1 truncate">{layer.name}</div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleVisibility(layer.id)}>
                      {layer.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {layer.visible ? "Hide layer" : "Show layer"}
                      </span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleLock(layer.id)}>
                      {layer.locked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {layer.locked ? "Unlock layer" : "Lock layer"}
                      </span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteLayer(layer.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete layer</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2">
              {layers.map((layer) => (
                <Tooltip key={layer.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-9 w-9 my-1",
                        layer.selected && "bg-accent"
                      )}
                      onClick={() => selectLayer(layer.id)}
                    >
                      <div className="h-4 w-4 rounded-full bg-foreground" />
                      <span className="sr-only">{layer.name}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{layer.name}</TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 my-1"
                    onClick={addLayer}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add layer</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Add layer</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
