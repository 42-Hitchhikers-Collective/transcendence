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

export function Header({
  cardTitle,
  cardDescription,
  togglePageName,
  onRequestMode,
}: {
  cardTitle?: string;
  cardDescription?: string;
  togglePageName: string;
  onRequestMode: () => void;
}) {
  return (
    <CardHeader className="text-center">
      <CardTitle className="text-xl">{cardTitle}</CardTitle>
      <CardDescription>{cardDescription}
      <Button variant="link" className="px-2" onClick={onRequestMode}>
        {togglePageName}
      </Button>
      </CardDescription>
    </CardHeader>
  );
}
