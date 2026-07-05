const nodemailer = require("nodemailer");
const Auth = require("../../auth/models/authmodel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const reportIssue = async (req, res) => {
  try {
    const { title, description } = req.body;

    const user = await Auth.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Issue Report: ${title}`,
      html: `
        <h2>New Issue Report</h2>

        <p><strong>User ID:</strong> ${user._id}</p>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>

        <hr/>

        <p><strong>Title:</strong> ${title}</p>

        <p>${description}</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Issue submitted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to submit issue",
    });
  }
};

module.exports = {
  reportIssue,
};
