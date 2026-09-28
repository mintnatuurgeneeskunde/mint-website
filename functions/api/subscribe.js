export async function onRequestPost({ request, env }) {
  let email;
  try {
    ({ email } = await request.json());
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Ongeldige aanvraag.' }), { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Vul een geldig e-mailadres in.' }), { status: 400 });
  }

  const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_LIST_ID } = env;
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
    return new Response(JSON.stringify({ error: 'Mailchimp is nog niet geconfigureerd.' }), { status: 500 });
  }

  try {
    const res = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          tags: ['Website - gratis checklist'],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok && data.title !== 'Member Exists') {
      return new Response(JSON.stringify({ error: data.detail || 'Inschrijven is niet gelukt.' }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Serverfout, probeer het later opnieuw.' }), { status: 500 });
  }
}
