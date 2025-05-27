"use client";

import * as React from "react";
import {  CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button-loading";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useState } from "react";
import { Tag as TagIcon } from "lucide-react";

interface CommandSelectProps<T> {
  placeholder?: string;
  value?: string[];
  options?: T[];
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  onCreate?: (name: string) => Promise<T>;
}

interface CommandOption {
  id: string;
  name: string;
  color?: string;
  icon?: React.ReactNode;
}

export const Combobox = React.forwardRef<HTMLDivElement, CommandSelectProps<CommandOption>>(({
  placeholder = "place select",
  value = [],
  onChange = () => { },
  options = [],
  onCreate,
  multiple = true,
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [creatingOption, setCreatingOption] = useState(false)
  const [internalValues, setInternalValues] = React.useState<string[]>(value);
  const [commandState, setCommandState] = React.useState({
    search: "",
    count: 0,
  });

  useEffect(() => {
    setInternalValues(value)
  }, [value])

  // Handle selection
  const handleSelect = React.useCallback((currentValue: string) => {
    if (!multiple) {
      setInternalValues([currentValue]);
      onChange([currentValue]);
      setOpen(false);
      return
    }
    const newValues = internalValues.includes(currentValue)
      ? internalValues.filter((v) => v !== currentValue)
      : [...internalValues, currentValue];
    setInternalValues(newValues);
    onChange(newValues);
  }, [internalValues, onChange, multiple]);

  const handleStateChange = useCallback((count: number, search: string) => {
    setCommandState({ count, search });
  }, []);

  const handleCreateOption = React.useCallback(async () => {
    try {
      setCreatingOption(true)
      const createdOption = await onCreate?.(commandState.search);
      setInternalValues((prev) => {
        if (!createdOption) return prev;
        const newValues = [...prev, createdOption.id];
        onChange(newValues);
        return newValues;
      });
      setOpen(false);
    } catch (e) {
      console.error(e)
    } finally {
      setCreatingOption(false)
    }

  }, [commandState.search, onCreate, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <div
          className="justify-between flex items-center h-auto w-full min-h-9 border border-input text-sm shadow-xs py-1 px-3 rounded-md text-left"
        >
          {internalValues.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {internalValues.map((value) => (
                <Badge variant="outline" key={value}>
                  {
                    options.find((option) => option.id === value)?.name
                  }
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">{placeholder}</div>
          )}
          {/* <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 max-h-full">
        <Command ref={ref}
          filter={(value, search, keywords) => {
            return keywords && keywords[0].toLocaleLowerCase().includes(search.toLocaleLowerCase()) ? 1 : 0
          }}
        >
          <CommandInput
            onStateChange={handleStateChange}
            className="h-9"
          />

          <CommandList>
            {
              onCreate ? (
                <CommandEmpty className="p-2">
                  <Button
                    onClick={handleCreateOption}
                    variant="secondary"
                    className="w-full"
                    loading={creatingOption}
                  >
                    <TagIcon className="mr-2 h-4 w-4" />
                    create“{commandState.search}”tag
                  </Button>
                </CommandEmpty>
              ) : null
            }

            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.id}
                keywords={[option.name]}
                onSelect={handleSelect}
              >
                <div className="flex items-center">
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      internalValues.includes(option.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
})

Combobox.displayName = "Combobox";