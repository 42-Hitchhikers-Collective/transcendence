"use client";

import { useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/shared/animate-ui/components/headless/dialog";
import { PrivacyPolicyContent } from "@/shared/components/legal/PrivacyPolicyContent";
import { TermsContent } from "@/shared/components/legal/TermsContent";

const LEGAL_LINKS = [
  {
    id: "privacy",
    label: "Privacy Policy",
    content: <PrivacyPolicyContent />,
  },
  {
    id: "terms",
    label: "Terms & Conditions",
    content: <TermsContent />,
  },
] as const;

export function Footer() {
  const [activeModal, setActiveModal] = useState<
    (typeof LEGAL_LINKS)[number]["id"] | null
  >(null);

  return (
    <footer
      className="text-sm text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="flex flex-col gap-4">

        <div className="flex w-full flex-col items-end gap-4 text-right">
     

          <div
            className="flex flex-col items-end gap-2 md:flex-row md:gap-6"
            aria-label="Legal links"
          >
            {LEGAL_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => setActiveModal(link.id)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {LEGAL_LINKS.map((link) => (
        <Dialog
          key={link.id}
          open={activeModal === link.id}
          onClose={() => setActiveModal(null)}
        >
          <DialogPanel from="bottom" className="bg-neutral-900 text-white">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-white">{link.label}</DialogTitle>
              <DialogDescription className="text-white/70">
                {link.content}
              </DialogDescription>
            </DialogHeader>
          </DialogPanel>
        </Dialog>
      ))}
    </footer>
  );
}
