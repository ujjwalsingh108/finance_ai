"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "Which traffic sources are accepted?",
    answer:
      "We accept nearly every single type of traffic, except those violating the partner program rules. Please contact your manager for any additional info.",
  },
  {
    question: "Which GEOs are accepted?",
    answer:
      "We accept traffic from all countries. There are no restricted countries or regions to conduct marketing activity.",
  },
  {
    question:
      "What does it mean that I can participate in the partner program but I can't withdraw my earnings?",
    answer:
      "Upon enrollment as an affiliate, you'll have full access to your affiliate dashboard, links, and creatives. You can actively promote Intellectia and earn commissions from successful referrals. However, before you can withdraw your earned commissions, you must first undergo a verification process (don't fret — you can still earn commissions during this process). Once verified, you'll be able to withdraw your commissions, hassle-free, as per our partner program rules.",
  },
  {
    question:
      "What will be required from me in order to verify my account so that I can withdraw my commissions?",
    answer:
      "To verify your account and gain access to commission withdrawals, our affiliate managers will review your traffic sources and account details. We want to ensure the integrity of our affiliate program and compliance with our policies. During this process, you will be required to provide relevant information and may be asked to answer a few verification questions. Once your account is verified, you will receive an email confirmation, and you can withdraw your earned commissions hassle-free, as per our partner program rules.",
  },
  {
    question: "When and how are the payments made?",
    answer: `
    Commissions can be withdrawn once your balance meets the withdrawal threshold. 
      
    Payout requests will be processed within five business days from the date of the withdrawal request. 
      
    Payments are made via PayPal.`,
  },
  {
    question:
      "A customer purchased a subscription but I did not receive a commission — why?",
    answer: `The most common reason is that the user is likely an existing customer. Commissions are paid for new Intellectia users only — someone who has never created an Intellectia account. Other possible reasons:
    
1. The person followed your affiliate link but hasn’t registered an account yet (no conversion).

2. The person clicked another affiliate link after yours and signed up under theirs.

3. The person visited our site directly instead of using your affiliate link.

4. The 90-day cookie life expired before the user converted.

Although uncommon, there may be other reasons as well.`,
  },
  {
    question: "Where do I find the Partner program rules?",
    answer: "Click here to read our Partner program rules.",
  },
  {
    question: "Where can I find my affiliate link?",
    answer: `Once logged in, click on “Partner Program” under the “Resources” dropdown on the homepage. Scroll down to "Open Partner Dashboard" and click "Links" to access the Link Builder.

- Target link: Choose the destination page. Use the homepage as default: https://intellectia.ai/

- Aff Sub: Track values like Social, Organic, Paid, etc.

- Source: Identify the source like YouTube, Twitter, Facebook, Website1, etc.

After filling the fields, your final affiliate link will appear below.`,
  },
  {
    question: "Why haven't I received my affiliate commission yet?",
    answer: `The minimum payment threshold is $60. You won’t be able to request a payout until this limit is reached.

Also check the "Finance" tab in your dashboard to ensure:

- A valid PayPal email address is provided.

- Your W-9 or W-8BEN tax form is submitted.

Payments are held for 5 days for review.`,
  },
  {
    question: "How is the Partner program different from Refer a Friend?",
    answer: `As a Partner Program member, you'll earn a fixed commission based on the subscription purchased by the referred user.

For Basic, Pro, and Max plans, you'll receive amounts listed here: https://intellectia.ai/partner/

Referees also get up to $76.75 discount on annual plans via your link.`,
  },
  {
    question: "Questions?",
    answer:
      "If you have further questions about the Partner Program, feel free to email us at contact@intellectia.ai.",
  },
];

export function PartnerFaq() {
  return (
    <Card className="border bg-background shadow-sm">
      <CardContent className="p-4 space-y-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h3>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-md cursor-pointer">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-wrap text-sm text-gray-500">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
