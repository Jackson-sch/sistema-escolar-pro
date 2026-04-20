import twilio from "twilio";
import { getSystemVariable } from "./settings";

/**
 * Inicializa y retorna el cliente de Twilio.
 * Las credenciales se obtienen dinámicamente desde la base de datos (VariableSistema).
 */
export async function getTwilioClient() {
  const accountSid = await getSystemVariable("TWILIO_ACCOUNT_SID");
  const authToken = await getSystemVariable("TWILIO_AUTH_TOKEN");
  const twilioPhoneNumber = await getSystemVariable("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error("❌ Credenciales de Twilio incompletas en la base de datos.");
    return null;
  }

  const client = twilio(accountSid, authToken);
  return { client, twilioPhoneNumber };
}
