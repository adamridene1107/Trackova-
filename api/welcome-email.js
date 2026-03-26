import Resend from "resend";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).end();
  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email requis" });
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Trakova <onboarding@resend.dev>",
      to: email,
      subject: "Bienvenue sur Trakova ! 🎯",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0F;color:#fff;border-radius:16px;border:1px solid rgba(139,92,246,0.2)">
        <img src="https://trackova.vercel.app/logo.svg" alt="Trakova" style="height:40px;margin-bottom:24px"/>
        <h1 style="color:#a78bfa;font-size:24px;margin:0 0 8px">Bienvenue ${name || ""} ! 🎯</h1>
        <p style="color:#ffffff80;margin:0 0 24px">Ton compte Trakova est prêt. Commence dès maintenant à suivre tes objectifs.</p>
        <a href="https://trackova.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600">Accéder à Trakova →</a>
        <p style="color:#ffffff30;font-size:12px;margin-top:32px">Tu reçois cet email car tu viens de créer un compte sur Trakova.</p>
      </div>`
    });
    return res.status(200).json({ success: true });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
