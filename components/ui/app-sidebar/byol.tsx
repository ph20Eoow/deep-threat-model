import React from "react";
import { Input } from "@/components/ui/input";
import { SidebarGroupLabel } from "../sidebar";
import { Popover, PopoverContent } from "../popover";
import { PopoverTrigger } from "../popover";
import { BsGear } from "react-icons/bs";
import { Button } from "../button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";
import { FaInfoCircle, FaExternalLinkAlt } from "react-icons/fa";
import { useAppStore } from "@/stores/app";

const BYOL = () => {
  const { apiKeys, updateApiKeys } = useAppStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <BsGear size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" asChild className="w-[600px]">
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center space-x-2">
            <CardTitle className="flex flex-row items-center space-x-2">
              <p>API Key Settings</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FaInfoCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Your API key is securely sent to our serverless backend
                      for processing
                      <br />
                      and is never stored. Enjoy the demo with peace of mind.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-5 items-center gap-4">
                <div className="col-span-2 flex flex-row items-center justify-between">
                  <label className="text-sm font-medium">OpenAI API Key</label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-500 hover:underline"
                  >
                    <FaExternalLinkAlt className="h-3 w-3 mr-1" />
                    Get Key
                  </a>
                </div>
                <Input
                  type="text"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) =>
                    updateApiKeys({ ...apiKeys, openai: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-5 items-center gap-4">
                <div className="col-span-2 flex flex-row items-center justify-between">
                  <label className="text-sm font-medium">Google CSE Key</label>
                  <a
                    href="https://developers.google.com/custom-search/v1/introduction"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-500 hover:underline"
                  >
                    <FaExternalLinkAlt className="h-3 w-3 mr-1" />
                    Get Key
                  </a>
                </div>
                <Input
                  type="text"
                  placeholder="AIza..."
                  value={apiKeys.google_cse}
                  onChange={(e) =>
                    updateApiKeys({ ...apiKeys, google_cse: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-5 items-center gap-4">
                <div className="col-span-2 flex flex-row items-center justify-between">
                  <label className="text-sm font-medium">Google CSE ID</label>
                  <a
                    href="https://programmablesearchengine.google.com/controlpanel/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-500 hover:underline"
                  >
                    <FaExternalLinkAlt className="h-3 w-3 mr-1" />
                    Get ID
                  </a>
                </div>
                <Input
                  type="text"
                  placeholder="Enter CSE ID"
                  value={apiKeys.google_cse_id}
                  onChange={(e) =>
                    updateApiKeys({ ...apiKeys, google_cse_id: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Your API key is securely sent to our serverless backend for
              processing
              <br />
              and is never stored. Enjoy the live demo with peace of mind.
            </p>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default BYOL;
