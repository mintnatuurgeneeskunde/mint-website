exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Ongeldige aanvraag.' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Vul een geldig e-mailadres in.' }) };
  }

  const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_LIST_ID } = process.env;
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Mailchimp is nog niet geconfigureerd.' }) };
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
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.detail || 'Inschrijven is niet gelukt.' }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Serverfout, probeer het later opnieuw.' }) };
  }
};
