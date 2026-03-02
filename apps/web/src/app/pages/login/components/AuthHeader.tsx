import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function AuthHeader({
  cardTitle,
  cardDescription,
}: {
  cardTitle?: string;
  cardDescription?: string;
}) {
  return (
    <CardHeader className="text-center">
      <CardTitle className="text-xl">{cardTitle}</CardTitle>
      <CardDescription>{cardDescription}</CardDescription>
    </CardHeader>
  );
}
