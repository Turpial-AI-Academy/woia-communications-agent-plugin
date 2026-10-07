import {requireValue as need} from './guard.mjs';
// Narrow adapter: the host injects a pinned/qualified official WhatsAppClient and normalizeWebhook.
// No credential, SDK dependency, account, notification permission or live qualification is bundled.
export function kapsoAdapter({client,phoneNumberId,account_id,qualification}){
 need(client?.messages&&phoneNumberId&&account_id&&qualification?.result==='PASS'&&qualification.account_id===account_id,'KAPSO_BINDING_NOT_QUALIFIED');
 return {async send(effect){need(effect.account_id===account_id&&effect.channel==='whatsapp','KAPSO_ACCOUNT_CHANNEL_MISMATCH');need(effect.status==='dispatching','RESERVED_DISPATCH_REQUIRED');const response=await client.messages.sendText({phoneNumberId,to:effect.to,body:effect.content,previewUrl:false});const id=response?.messages?.[0]?.id;need(id,'KAPSO_UNKNOWN_SEND_RESULT');return {provider_message_id:id};}};
}
export async function kapsoIngress({rawBody,signature,verifySignature,normalizeWebhook,appSecret,phoneNumberId,resolveRecipient}){
 need(typeof verifySignature==='function'&&typeof normalizeWebhook==='function'&&appSecret,'QUALIFIED_WEBHOOK_VERIFIER_REQUIRED');need(await verifySignature({appSecret,rawBody,signatureHeader:signature})===true,'INVALID_WEBHOOK_SIGNATURE');
 const normalized=normalizeWebhook(JSON.parse(Buffer.from(rawBody).toString('utf8')));need(normalized.phoneNumberId===phoneNumberId,'WEBHOOK_ACCOUNT_MISMATCH');
 return Promise.all(normalized.messages.map(async message=>{need(message.id,'MESSAGE_ID_REQUIRED');const binding=await resolveRecipient(message);need(binding?.resolved===true,'INGRESS_IDENTITY_UNRESOLVED');return {message_id:message.id,...binding,content:message.text?.body??null,original:message,source_ref:message.id};}));
}
