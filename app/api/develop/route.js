import { developDb } from "@/lib/database";
import { billingDb } from "@/lib/database";

export async function GET(req) {
  // Listar todos los pagos de desarrollo con datos de billing, claim, employee y cliente
  const developRows = await developDb.getAll();
  const result = [];
  for (const dev of developRows) {
    const billing = await billingDb.findById(dev.billing_id);
    if (!billing) continue;
    // claim, employee, cliente
    const claimId = billing.claim_id;
    // Puedes expandir aquí para traer más datos si lo necesitas
    result.push({
      ...dev,
      billing,
      claimId,
    });
  }
  return Response.json(result);
}

export async function POST(req) {
  // Registrar un nuevo pago de desarrollo
  const body = await req.json();
  // body: { billingId, percentage, amount }
  const dev = await developDb.create(body);
  return Response.json(dev);
}
