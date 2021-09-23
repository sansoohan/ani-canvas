import * as functions from 'firebase-functions';
import { getFunctionWithRequest } from '../../../modules/getFunctionWithRequest';
import * as v from './v';

export const shareSessionGetSessions = functions.region('asia-northeast1')
.https.onCall(async (data, context) => {
  const { env: { FUNCTION_V } } = data;
  const selectedFunction = await getFunctionWithRequest(FUNCTION_V, 'shareSessionGetSessions', v);
  const functionRes = await selectedFunction(data, context);
  return functionRes;
});
