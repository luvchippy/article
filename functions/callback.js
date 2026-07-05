export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  const client_id = context.env.GITHUB_CLIENT_ID;
  const client_secret = context.env.GITHUB_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return new Response('Missing GitHub OAuth environment variables.', { status: 500 });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return new Response(JSON.stringify(tokenData), { status: 500 });
    }
    
    const token = tokenData.access_token;
    const provider = 'github';

    // 针对 Decap CMS 设计的 postMessage 回调逻辑
    const script = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Authorizing...</title>
    </head>
    <body>
      <p>Authorizing, please wait...</p>
      <script>
        const receiveMessage = (message) => {
          window.opener.postMessage(
            'authorization:${provider}:success:{"token":"${token}","provider":"${provider}"}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:${provider}", "*");
      </script>
    </body>
    </html>
    `;

    return new Response(script, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
