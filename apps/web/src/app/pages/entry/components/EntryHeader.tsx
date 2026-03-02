/* 
NOTE FOR TEAM: EntryHeader is a simple component that renders the header of the auth card (title, description and toggle button).
Based on what mode is active (login or signup) it will render a different title, description and what page to toggle to (Login toggles to signup and vice versa).
*/

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { Button } from "@/shared/components/ui/button";

export function EntryHeader({
  cardTitle,
  cardDescription,
  togglePageName,
  onToggleMode,
}: {
  cardTitle?: string;
  cardDescription?: string;
  togglePageName: string;
  onToggleMode: () => void;
}) {
  return (
    <CardHeader className="text-center">
      <CardTitle className="text-xl">{cardTitle}</CardTitle>
      <CardDescription>{cardDescription}</CardDescription>
      <Button variant="link" onClick={onToggleMode}>
        {togglePageName}
      </Button>
    </CardHeader>
  );
}
