import { parse } from "tldts";
export const getDomainName = (domainName: string) => {
  let res = parse(domainName);

  console.log(res.domain);
  return res.domain;
};
