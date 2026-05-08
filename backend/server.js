const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("One Bet One Click backend running 🚀");
});

/* =========================
   RESOLVE ACCOUNT NAME
========================= */
app.post("/resolve-account", async (req, res) => {
  const { account_number, bank_code } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    res.json(response.data.data);

  } catch (err) {
    res.json({ error: "Invalid account details" });
  }
});

/* =========================
   WITHDRAW REQUEST
========================= */
app.post("/withdraw", async (req, res) => {
  const { account_number, bank_code, account_name, amount } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        name: account_name,
        account_number,
        bank_code,
        currency: "NGN"
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      success: true,
      message: "Withdrawal initiated",
      data: response.data
    });

  } catch (err) {
    res.json({ error: "Withdrawal failed" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("One Bet backend running on port", PORT);
});
