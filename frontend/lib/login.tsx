import {Router, useRouter} from 'next/router';

const login = async (email: string, password: string, router : Router): Promise<void> => {

  const host : string = `http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}${process.env.NEXT_PUBLIC_API_LOGIN}`;
  console.log(JSON.stringify({username : "", email, password}))

  const resp = await fetch(host, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (resp.status !== 200) {
    throw new Error(await resp.text());
  } else {
    console.log(resp)
    router.push("/welcome");
  }
};

export default login;