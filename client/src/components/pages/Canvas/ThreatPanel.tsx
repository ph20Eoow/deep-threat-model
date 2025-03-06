import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore, Threat } from "@/stores/app";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
const ThreatPanel = () => {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const { threats } = useAppStore();

  const handleThreatOnClick = (threat: Threat) => {
    setSelectedThreat(threat);
  };
  return (
    <div className="flex flex-col h-screen p-2">
      <div className="flex-1 p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="font-medium">Scope</TableCell>
              <TableCell className="text-left">Impacts</TableCell>
              <TableCell className="text-left">Techniques</TableCell>
              <TableCell className="text-left">Mitigation</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {threats.map((item) => (
              <TableRow key={item.id} onClick={() => handleThreatOnClick(item)}>
                <TableCell className="font-medium">
                  {item.scope.source} {item.scope.direction} {item.scope.target}
                </TableCell>
                <TableCell className="text-left">
                  <p>{item.impacts}</p>
                </TableCell>
                <TableCell className="text-left">
                  <p>{item.techniques}</p>
                </TableCell>
                <p
                  className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap"
                  title={item.mitigation}
                >
                  {item.mitigation || ""}
                </p>
              </TableRow>
            ))}
            {threats.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No threats found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {selectedThreat && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedThreat.scope.source} {selectedThreat.scope.direction}{" "}
                {selectedThreat.scope.target}
              </CardTitle>
              <CardDescription>{selectedThreat.impacts}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <p>Threat</p>
                <p>{selectedThreat.techniques}</p>
                <p className="font-bold">Mitigation Options:</p>
                <Markdown remarkPlugins={[remarkGfm]}>
                  {selectedThreat.mitigation}
                </Markdown>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ThreatPanel;
