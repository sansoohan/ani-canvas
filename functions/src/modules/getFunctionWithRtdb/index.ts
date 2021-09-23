import * as admin from 'firebase-admin';

const adminDatabase = admin.database();
export const getFunctionWithRtdb = async (
  rootPath: string, name: string, versions: any,
): Promise<Promise<any>> => {
  const databaseRootFunctionV = (await adminDatabase.ref(`${rootPath}/FUNCTION_V`).get()).val();
  const functionVersion = databaseRootFunctionV[name];
  console.log(functionVersion, name);
  if (!functionVersion || !versions[functionVersion]) {
    throw new Error (`Version Error : ${functionVersion}`);
  }

  return versions[functionVersion];
}
