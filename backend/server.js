const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("One Bet One Click backend running 🚀");
});

/* ================= ACCOUNT RESOLVE ================= */
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

    res.json({
      success: true,
      data: response.data.data
    });

  } catch (err) {
    console.log("Resolve error:", err.response?.data || err.message);

    res.json({
      success: false,
      message: err.response?.data?.message || "Account resolve failed"
    });
  }
});

/* ================= CREATE RECIPIENT ================= */
async function createRecipient(account_name, account_number, bank_code) {
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

  return response.data.data.recipient_code;
}

/* ================= REAL WITHDRAWAL ================= */
app.post("/withdraw", async (req, res) => {
  const { account_number, bank_code, account_name, amount } = req.body;

  try {
    // STEP 1: Create recipient
    const recipient_code = await createRecipient(
      account_name,
      account_number,
      bank_code
    );

    // STEP 2: INITIATE TRANSFER (REAL MONEY SENT)
    const transfer = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: amount * 100, // convert to kobo
        recipient: recipient_code,
        reason: "One Bet One Click Withdrawal"
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
      message: "Transfer initiated successfully",
      data: transfer.data.data
    });

  } catch (err) {
    console.log("Withdraw error:", err.response?.data || err.message);

    res.json({
      success: false,
      message: err.response?.data?.message || "Transfer failed"
    });
  }
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("One Bet backend running on port", PORT);
});
