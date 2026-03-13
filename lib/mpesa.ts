// lib/mpesa.ts
import 'server-only';
import { AppError } from '@/errors/AppError';
import { ErrorCode } from '@/errors/errorCodes';
import { logger } from '@/logger';
 
const BASE_URL = process.env.MPESA_ENVIRONMENT === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';
 
// ── Token cache (tokens expire after 1 hour) ──────────────────────────
let cachedToken: { value: string; expiresAt: number } | null = null;
 
export async function getMpesaToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }
 
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}` 
  ).toString('base64');
 
  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );
 
  if (!res.ok) {
    logger.error({ message: 'M-Pesa token fetch failed', status: res.status });
    throw AppError.external('M-Pesa Auth', res.statusText);
  }
 
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + parseInt(data.expires_in) * 1000,
  };
  return cachedToken.value;
}
 
export interface StkPushParams {
  phone:       string;  // E.164: 254712345678 (no +)
  amount:      number;  // KES whole units (NOT subunits)
  orderId:     string;
  description: string;
}
 
export interface StkPushResponse {
  MerchantRequestID:   string;
  CheckoutRequestID:   string;
  ResponseCode:        string;
  ResponseDescription: string;
  CustomerMessage:     string;
}
 
export async function initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
  const token     = await getMpesaToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password  = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}` 
  ).toString('base64');
 
  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   'CustomerPayBillOnline',
    Amount:            Math.ceil(params.amount),  // M-Pesa requires whole KES
    PartyA:            params.phone,
    PartyB:            process.env.MPESA_SHORTCODE,
    PhoneNumber:       params.phone,
    CallBackURL:       process.env.MPESA_CALLBACK_URL,
    AccountReference:  params.orderId.slice(0, 12),
    TransactionDesc:   params.description.slice(0, 13),
  };
 
  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
 
  if (!res.ok) {
    logger.error({ message: 'STK Push failed', status: res.status });
    throw AppError.external('M-Pesa STK Push', res.statusText);
  }
 
  return res.json();
}
