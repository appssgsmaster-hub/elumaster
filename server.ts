import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";

// Inicialização segura do Stripe
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API de Saúde
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SGS Group Backend is running" });
  });

  // Rota para criar Sessão de Checkout do Stripe
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripeInstance = getStripe();
      if (!stripeInstance) {
        return res.status(500).json({ error: "Stripe não configurado no servidor." });
      }

      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl", // Cobramos em Reais para o usuário
              product_data: {
                name: "EluMaster Pro - Plano Mensal",
                description: "Acesso total ao Mentor IA e GPS de alta precisão",
                images: ["https://picsum.photos/id/1/200/200"],
              },
              unit_amount: 2990, // R$ 29,90 (em centavos)
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}?status=cancel`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Erro Stripe:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Configuração do Vite para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Servir arquivos estáticos em produção
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EluMaster Server running on http://localhost:${PORT}`);
  });
}

startServer();
