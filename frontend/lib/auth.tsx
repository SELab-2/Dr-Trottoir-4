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
  const data = {
    username:event.
    password:
  }
  const resp = await fetch("http://localhost:2002/user/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }), // Might want to change this so we hash the password locally
  });
  if (resp.status !== 200) {
    throw new Error(await resp.text());
  }
  // @ts-ignore
    Router.push("/welcome");
};

export default login;