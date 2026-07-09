/* 
NOTE FOR TEAM: sHeader is a simple component that renders the header of the auth card (title, description and toggle button).
Based on what mode is active (login or signup) it will render a different title, description and what page to toggle to (Login toggles to signup and vice versa).
*/

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { Button } from "@/shared/components/ui/button";
import type { AuthMode } from "../../types";

export function Header({
  cardTitle,
  cardDescription,
  togglePageName,
  toggleTarget,
  onRequestMode,
}: {
  cardTitle?: string;
  cardDescription?: string;
  togglePageName: string;
  toggleTarget?: AuthMode;
  onRequestMode: (target?: AuthMode) => void;
}) {
  return (
    <CardHeader className="text-center">
      <CardTitle className="text-3xl md:text-4xl">{cardTitle}</CardTitle>
      <CardDescription
      className="text-xs md:text-sm text-slate-400"
      >{cardDescription}
      <Button
        variant="link"
        className="text-xs md:text-sm px-2 text-orange-400 hover:text-orange-500 transition-transform"
        onClick={() => onRequestMode(toggleTarget)}
      >
        {togglePageName}
      </Button>
      </CardDescription>
    </CardHeader>
  );
}
