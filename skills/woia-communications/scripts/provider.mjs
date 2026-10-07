import {guard,requireValue as need,once,finish,digest} from './guard.mjs';
export const ACTIONS=['communication.external.receive','communication.external.send','communication.internal.send','communication.status.observe','communication.effect.reconcile','communication.handoff','communication.takeover'];
export const initialState=()=>({schema:'dev.woia.communication-state/v1',conversations:[],effects:[],interactions:[],operations:[],history:[]});
export function transition(input,command,context){
 guard(command,context,ACTIONS); const state=structuredClone(input);const repeat=once(state,command);if(repeat)return {state,result:repeat};
 const {action,organization,payload:p}=command;need(p&&typeof p.conversation_id==='string'&&command.resource===p.conversation_id,'CONVERSATION_REQUIRED');
 let conversation=state.conversations.find(x=>x.organization===organization&&x.id===p.conversation_id);
 if(action==='communication.external.receive'){
  need(context.department==='customer-service','CUSTOMER_SERVICE_ONLY');need(context.adapter_verified===true&&p.message_id&&p.source_ref&&p.subject_id&&p.contact_id&&p.account_id&&p.channel,'VERIFIED_INGRESS_REQUIRED');
  const old=state.interactions.find(x=>x.organization===organization&&x.account_id===p.account_id&&x.message_id===p.message_id);
  if(old){need(old.payload_digest===digest(p),'INGRESS_ID_CONFLICT');return finish(state,command,{status:'DUPLICATE',interaction_id:old.id});}
  conversation??={id:p.conversation_id,organization,generation:0,owner:'automation'};if(!state.conversations.includes(conversation))state.conversations.push(conversation);
  conversation.generation++;for(const e of state.effects.filter(x=>x.organization===organization&&x.conversation_id===conversation.id&&x.status==='prepared'))e.status='superseded';
  const interaction={...p,id:command.operation_id,organization,payload_digest:digest(p)};state.interactions.push(interaction);return finish(state,command,{status:'RECEIVED',interaction_id:interaction.id,generation:conversation.generation});
 }
 if(action==='communication.handoff'||action==='communication.takeover'){
  need(context.department==='customer-service','CUSTOMER_SERVICE_ONLY');need(conversation,'CONVERSATION_NOT_FOUND');need(p.reason&&p.evidence_ref,'TAKEOVER_EVIDENCE_REQUIRED');
  if(action==='communication.handoff'){need(p.target_human,'HUMAN_TARGET_REQUIRED');conversation.handoff={target:p.target_human,reason:p.reason};}
  conversation.owner='human';conversation.generation++;for(const e of state.effects.filter(x=>x.organization===organization&&x.conversation_id===conversation.id&&x.status==='prepared'))e.status='superseded';return finish(state,command,{status:'HUMAN_OWNED',generation:conversation.generation});
 }
 if(action.endsWith('.send')){
  need(!conversation||conversation.owner==='automation','HUMAN_TAKEOVER_OR_MISSING_CONVERSATION');need(p.generation===(conversation?.generation??0),'OBSOLETE_CONTACT');
  const recipient=context.recipient;need(recipient?.resolved===true&&recipient.organization===organization&&recipient.subject_id===p.subject_id&&recipient.contact_id===p.contact_id&&recipient.account_id===p.account_id&&recipient.channel===p.channel&&recipient.purpose===command.purpose,'RECIPIENT_BINDING_REQUIRED');
  need(p.content&&p.content_version&&p.business_origin&&p.delivery_key&&p.effect_id&&p.to,'EXACT_CONTACT_INTENT_REQUIRED');need(recipient.to===p.to,'CONTACT_ADDRESS_MISMATCH');
  if(action==='communication.external.send')need(context.department==='customer-service'&&recipient.class==='external'&&recipient.consent===true,'CUSTOMER_SERVICE_EXTERNAL_ONLY');
  else need(recipient.class==='internal'&&recipient.relationship==='staff'&&recipient.authenticated===true&&recipient.assignment_current===true&&recipient.purpose_authorized===true,'AUTHENTICATED_CURRENT_INTERNAL_STAFF_REQUIRED');
  if(!conversation){conversation={id:p.conversation_id,organization,generation:0,owner:'automation'};state.conversations.push(conversation);}
  need(!state.effects.some(x=>x.organization===organization&&x.effect_id===p.effect_id),'DUPLICATE_EFFECT');
  if(p.retry_of){const previous=state.effects.find(x=>x.organization===organization&&x.effect_id===p.retry_of);need(previous?.status==='failed'&&previous.reconciled===true,'RECONCILE_BEFORE_RETRY');}
  need(!state.effects.some(x=>x.organization===organization&&x.delivery_key===p.delivery_key&&!(p.retry_of===x.effect_id&&x.status==='failed'&&x.reconciled===true)),'DUPLICATE_DELIVERY_INTENT');
  state.effects.push({...p,organization,action,status:'prepared',intent_digest:digest(p),reconciled:false});return finish(state,command,{status:'PREPARED',effect_id:p.effect_id});
 }
 const effect=state.effects.find(x=>x.organization===organization&&x.effect_id===p.effect_id);need(effect&&effect.conversation_id===p.conversation_id,'EFFECT_NOT_FOUND');need(context.adapter_verified===true&&p.evidence_ref&&p.account_id===effect.account_id,'VERIFIED_STATUS_REQUIRED');
 const rank={submitted:1,sent:2,delivered:3,read:4};
 if(action==='communication.status.observe'){
  need(p.provider_message_id===effect.provider_message_id&&effect.provider_message_id,'MESSAGE_ID_MISMATCH');need(Object.hasOwn(rank,p.status),'INVALID_MESSAGE_STATUS');need((rank[p.status]??0)>=(rank[effect.status]??0)&&!['failed','superseded','prepared'].includes(effect.status),'STATUS_REGRESSION');effect.status=p.status;
 }else{
  need(['dispatching','unknown','submitted','sent','delivered','read'].includes(effect.status),'NOT_RECONCILABLE');need(['found','definitive-not-sent','unknown'].includes(p.outcome),'RECONCILIATION_OUTCOME_REQUIRED');
  if(p.outcome==='found'){need(p.provider_message_id,'PROVIDER_MESSAGE_ID_REQUIRED');if(effect.provider_message_id)need(effect.provider_message_id===p.provider_message_id,'MESSAGE_ID_MISMATCH');effect.provider_message_id=p.provider_message_id;const observed=p.status??'submitted';need(Object.hasOwn(rank,observed),'INVALID_MESSAGE_STATUS');if((rank[observed]??0)>(rank[effect.status]??0))effect.status=observed;effect.reconciled=true;}
  else if(p.outcome==='definitive-not-sent'){need(context.definitive_not_sent===true&&!effect.provider_message_id,'NOT_SENT_PROOF_REQUIRED');effect.status='failed';effect.reconciled=true;}
  else if(!Object.hasOwn(rank,effect.status))effect.status='unknown';
 }
 effect.evidence_ref=p.evidence_ref;return finish(state,command,{status:effect.status,effect_id:effect.effect_id});
}
// The host transaction must atomically reserve one effect and refresh authority; a stale worker cannot dispatch.
export async function dispatchEffect({store,organization,effect_id,authorize,adapter}){
 need(typeof store?.transaction==='function'&&typeof authorize==='function','QUALIFIED_STORE_AND_AUTHORITY_REQUIRED');
 const reservation=await store.transaction(organization,async state=>{
  const e=state.effects.find(x=>x.organization===organization&&x.effect_id===effect_id);need(e?.status==='prepared','RECONCILE_BEFORE_RETRY');
  const c=state.conversations.find(x=>x.organization===organization&&x.id===e.conversation_id);need(c?.owner==='automation'&&c.generation===e.generation,'OBSOLETE_CONTACT');
  need(await authorize(structuredClone(e))===true,'CURRENT_DISPATCH_AUTHORITY_REQUIRED');need(typeof adapter?.send==='function','QUALIFIED_ADAPTER_REQUIRED');e.status='dispatching';e.fence=(e.fence??0)+1;return {effect:structuredClone(e),fence:e.fence};
 });
 let receipt;try{receipt=await adapter.send(reservation.effect);need(receipt?.provider_message_id,'MISSING_PROVIDER_RECEIPT');}catch{receipt={unknown:true};}
 return store.transaction(organization,state=>{const e=state.effects.find(x=>x.organization===organization&&x.effect_id===effect_id);need(e?.fence===reservation.fence&&e.status==='dispatching','STALE_DISPATCH_WORKER');e.status=receipt.unknown?'unknown':'submitted';e.provider_message_id=receipt.provider_message_id??null;return {status:e.status,provider_message_id:e.provider_message_id};});
}
