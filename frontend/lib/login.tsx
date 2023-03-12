import api from '../lib/axios';
const login = async (email: string, password: string, router : any): Promise<void> => {

  const host : string =
      `http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}/user/login/`;
  console.log(JSON.stringify({email, password}))

  const data = {
    email: email,
    password: password,
  };

  api.post(host, data, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
  })
    .then((response: { status : number, data: any; })  => {
      console.log(response);
      if (response.status == 200) {
          router.push('/welcome');
      }
    })
    .catch((error: any) => {
      console.log(error);
    });
};

export default login;