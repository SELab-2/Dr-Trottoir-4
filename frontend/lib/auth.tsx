// const login = async (username: string, password: string): Promise<void> => {
//   const resp = await fetch("http://localhost:2002/user/login/", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, password }), // Might want to change this so we hash the password locally
//   });
//   if (resp.status !== 200) {
//     throw new Error(await resp.text());
//   }
//   // @ts-ignore
//     Router.push("/welcome");
// };



const login = async (event): Promise<void> => {
  event.preventDefault();
  const data = {
    username: event.username,
    password: event.password,
  }

  const JSONdata = JSON.stringify(data); // Might want to change this so we hash the password locally
  const endpoint = process.env.NEXT_PUBLIC_HOST_API + ":" + process.env.NEXT_PUBLIC_HOST_PORT + "/user/login/"; // "localhost:2002"


  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONdata,
  });

  if (resp.status !== 200) {
    throw new Error(await resp.text());
  }
  // @ts-ignore
    Router.push("/welcome");
};

export default login;