import {Router, useRouter} from 'next/router';

const login = async (email: string, password: string, router : any): Promise<void> => {

  const host : string = `http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}${process.env.NEXT_PUBLIC_API_LOGIN}`;
  console.log(JSON.stringify({email, password}))

  const axios = require('axios');

  const data = {
    email: email,
    password: password,
  };

  axios.post(host, data, { withCredentials: true })
    .then((response: { status : number, data: any; })  => {
      console.log(response);
      if (response.status == 200) {
          router.push("/welcome");
      }
    })
    .catch((error: any) => {
      console.log(error);
    });

  // const resp = await fetch(host, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (resp.status !== 200) {
  //   console.log("No can do")
  // } else {
  //   console.log(resp)
  //   router.push("/welcome");
  // }
};

export default login;