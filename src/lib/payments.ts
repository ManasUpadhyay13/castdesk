import DodoPayments from "dodopayments";
import { CREDIT_PACKS } from "@/types";

export type CreditPackId = (typeof CREDIT_PACKS)[number]["id"];

function getClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  });
}

export function getPackById(packId: string) {
  return CREDIT_PACKS.find((p) => p.id === packId);
}

/**
 * Create a Dodo Payments checkout session for a credit pack.
 * Returns the checkout URL to redirect the user to.
 */
export async function createCheckoutSession(params: {
  packId: CreditPackId;
  userId: string;
  userEmail: string;
  userName: string;
}): Promise<string> {
  const pack = getPackById(params.packId);
  if (!pack) throw new Error("Invalid pack ID");

  const client = getClient();

  const payment = await client.payments.create({
    billing: {
      city: "Mumbai",
      country: "IN",
      state: "MH",
      street: "NA",
      zipcode: "400001",
    },
    customer: {
      email: params.userEmail,
      name: params.userName,
    },
    payment_link: true,
    product_cart: [
      {
        product_id: pack.id,
        quantity: 1,
      },
    ],
    metadata: {
      userId: params.userId,
      packId: params.packId,
      credits: String(pack.credits),
    },
  });

  if (!payment.payment_link) {
    throw new Error("Failed to create checkout link");
  }

  return payment.payment_link;
}
