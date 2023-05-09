const nodemailer = require("nodemailer");

const notification = (code ,mail) => {
  
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587, 
    secure: false, // true for 465, false for other ports
    auth: {
      user: "nodenode275@gmail.com", // generated ethereal user
      pass: "nllsrzcllmrxnhdp", // generated ethereal password
    },
  });

  var mailOptions = {
    from: "nodenode275@gmail.com",
    to: mail,
    subject: "Notification",
    html: `<center><h6>Here is the confirmation code for account --> ${mail} : </6> <h1>${code}</h1></center>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log("Email sent: " + info.response);
      return null;
    }
  });
};

module.exports = notification;
