const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("One Bet, One Click backend is running 🚀");
});

/* =========================
   PAYSTACK ACCOUNT RESOLVE
========================= */
app.post("/resolve-account", async (req, res) => {
  const { account_number, bank_code } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
        }
      }
    );

    return res.json({
      success: true,
      data: response.data.data
    });

  } catch (err) {
    console.log("Resolve error:", err.response?.data || err.message);

    return res.json({
      success: false,
      message:
        err.response?.data?.message ||
        "Unable to resolve account"
    });
  }
});

/* =========================
   WITHDRAW (SIMULATION / TRANSFER READY)
========================= */
app.post("/withdraw", async (req, res) => {
  const { account_number, bank_code, amount, account_name } = req.body;

  try {
    // STEP 1: Create transfer recipient
    const recipient = await axios.post(
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
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      success: true,
      message: "Withdrawal request created",
      data: recipient.data.data
    });

  } catch (err) {
    console.log("Withdraw error:", err.response?.data || err.message);

    return res.json({
      success: false,
      message:
        err.response?.data?.message ||
        "Withdrawal failed"
    });
  }
});

/* =========================
   START SERVER (RENDER READY)
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`One Bet backend running on port ${PORT}`);
});
