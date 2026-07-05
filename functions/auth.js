export async function onRequest(context) {
  const client_id = context.env.GITHUB_CLIENT_ID;
  if (!client_id) {
    return new Response('GITHUB_CLIENT_ID environment variable is missing.', { status: 500 });
  }
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
  return Response.redirect(url, 302);
}
