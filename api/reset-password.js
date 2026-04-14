const { Resend } = require("resend");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { email, lang } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Generate reset token
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const resetUrl = `${process.env.NEXT_PUBLIC_URL}/login?reset=${token}&email=${encodeURIComponent(email)}`;

  // Store token (in production use a DB, here we encode in URL)
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "FSE Daily Report <noreply@fse-daily-report.vercel.app>",
      to: email,
      subject: lang === "fr" ? "Réinitialisation de votre mot de passe" : "Password Reset Request",
      html: lang === "fr" ? `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#4a6cf7">FSE Daily Report</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}" style="display:inline-block;background:#4a6cf7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Réinitialiser mon mot de passe</a>
          <p style="color:#999;font-size:12px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        </div>
      ` : `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#4a6cf7">FSE Daily Report</h2>
          <p>You requested a password reset.</p>
          <p>Click the link below to create a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#4a6cf7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Reset my password</a>
          <p style="color:#999;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
