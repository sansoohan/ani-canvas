export const getFunctionWithRequest = async (
  FUNCTION_V: any, name: string, versions: any,
): Promise<Promise<any>> => {
  const functionVersion = FUNCTION_V[name];
  console.log(functionVersion, name);
  if (!functionVersion || !versions[functionVersion]) {
    throw new Error (`Version Error : ${functionVersion}`);
  }

  return versions[functionVersion];
}
