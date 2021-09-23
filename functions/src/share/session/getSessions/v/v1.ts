import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const database = admin.database();

export const v1 = async (
  data: any,
  context: functions.https.CallableContext,
): Promise<any> => {
  const { SHARE_PATH } = data.env;
  const { currentDatabaseRef } = data.params;
  const sessionRef = [
    SHARE_PATH,
    'sessions'
  ].join('/');

  const sessions = (await database.ref(sessionRef).get()).val();
  console.log(sessionRef, sessions);

  const res: any = {};
  for (const sessionId in sessions) {
    if (sessions[sessionId].currentDatabaseRef === currentDatabaseRef){
      res[sessionId] = sessions[sessionId];
    }
  }

  return { data: {sessions: res}, auth: context.auth }
}
