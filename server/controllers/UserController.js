import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import User from '../models/User.js';
import Otp from '../models/OTP.js';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: "Hotmail",
    auth: {
        user: process.env.HOST_MAIL,
        pass: process.env.HOST_MAIL_PASSWORD
    }
});

export default {
    async login(req , res) {
        try {
            const {login, password} = req.body;

            const getUser = await User.find({email: login});

            if(getUser.length === 0) return res.status(400).json({message: 'Wrong email or password combination!'});

            const passwordDB = getUser[0].password;

            const comparePasswords = await bcrypt.compare(
                password,
                passwordDB
            );

            if(comparePasswords) {
                const payload = {
                    iss: "login-form",
                    sub: {_id: getUser[0]?._id, name: getUser[0]?.name},
                    exp: Math.floor(Date.now() / 1000 + 6.048e+8),
                };

                const token = jwt.sign(
                    payload, 
                    `${process.env.SECRET}`, 
                    {algorithm: 'HS256'}
                );

                res.status(200).json({message: 'Success', token, _id: getUser[0]?._id, name: getUser[0]?.name});
            }
            else res.status(404).json({message: 'Wrong email or password combination!'});

        } catch (err) {
            console.log(err);
            res.status(400).json(err);
        }
    },
    async add(req, res) {
        try {
            const {name, login, password} = req.body;

            const userExists = await User.find({email: login});

            if(userExists.length > 0) return res.status(400).json({message: 'User already exists, please sign in!'});

            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                email: login,
                password: hashedPassword,
                name
            });

            res.status(200).json({message: 'User created successfully!'});
            
        } catch (err) {
            console.log(err);
            res.status(400).json({message: err});
        }
    },
    async changePassword(res, req) {
        try {
            const {userId, password} = res.body;

            const getUser = await User.find({_id: userId});
            
            if(getUser.length === 0) return req.status(400).json({ message: 'User not found, please try again or later!' });

            const hashedPass = await bcrypt.hash(password, 10);
            await User.findOneAndUpdate({_id: userId}, {password: hashedPass});

            req.status(200).json({ message: 'Password changed!'});
        } catch (err) {
           console.log(err);
           req.status(400).json({message: err});
        }
    },
    async findAndSendCode(req, res) {
        try {
            const {email} = req.body;

            const userExists = await User.find({email});

            if(userExists.length === 0) return res.status(400).json({message: 'No users were found with this email address!'});

            const findOtp = await Otp.find({userId: userExists[0]._id});
            
            const lastOtpDate = findOtp[findOtp.length - 1]?.createdAt;

            if(findOtp.length !== 0 && lastOtpDate.setDate(lastOtpDate.getDate() + 1) <= new Date) {
                await Otp.deleteMany({
                    userId: userExists[0]._id,
                    id: findOtp.map(val => val._id)
                });
            } //removing all otps after 24 hours

            if(findOtp.length === 0 || (findOtp.length < 5 && findOtp[findOtp.length - 1].spam < Date.now())) {
                const otpCode = `${Math.floor(1000 + Math.random() * 9000)}`;
                const hashedOtp = await bcrypt.hash(otpCode, 10);

                await Otp.create({
                    userId: userExists[0]._id,
                    otp: hashedOtp,
                    expiresAt: Date.now() + 3600000, //expires after 1 hour
                    spam: Date.now() + 120000 //adding spam protection of 2 minutes per email
                });

                const message = {
                    from: process.env.HOST_MAIL,
                    to: userExists[0].email,
                    subject: 'OTP code verification',
                    html: `
                        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
                        <head>
                        <meta charset="UTF-8">
                        <meta content="width=device-width, initial-scale=1" name="viewport">
                        <meta name="x-apple-disable-message-reformatting">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta content="telephone=no" name="format-detection">
                        <title>New message</title><!--[if (mso 16)]>
                        <style type="text/css">
                        a {text-decoration: none;}
                        </style>
                        <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
                        <xml>
                        <o:OfficeDocumentSettings>
                        <o:AllowPNG></o:AllowPNG>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                        </xml>
                        <![endif]--><!--[if !mso]><!-- -->
                        <link href="https://fonts.googleapis.com/css2?family=Imprima&display=swap" rel="stylesheet"><!--<![endif]-->
                        <style type="text/css">
                        #outlook a {
                        padding:0;
                        }
                        .es-button {
                        mso-style-priority:100!important;
                        text-decoration:none!important;
                        }
                        a[x-apple-data-detectors] {
                        color:inherit!important;
                        text-decoration:none!important;
                        font-size:inherit!important;
                        font-family:inherit!important;
                        font-weight:inherit!important;
                        line-height:inherit!important;
                        }
                        .es-desk-hidden {
                        display:none;
                        float:left;
                        overflow:hidden;
                        width:0;
                        max-height:0;
                        line-height:0;
                        mso-hide:all;
                        }
                        @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:18px!important; display:block!important; border-right-width:0px!important; border-left-width:0px!important; border-top-width:15px!important; border-bottom-width:15px!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } .h-auto { height:auto!important } }
                        </style>
                        </head>
                        <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
                        <div class="es-wrapper-color" style="background-color:#FFFFFF"><!--[if gte mso 9]>
                        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                        <v:fill type="tile" color="#ffffff"></v:fill>
                        </v:background>
                        <![endif]-->
                        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
                        <tr>
                        <td valign="top" style="padding:0;Margin:0">
                        <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                        <tr>
                        <td align="center" style="padding:0;Margin:0">
                        <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#EFEFEF;border-radius:20px 20px 0 0;width:600px" cellspacing="0" cellpadding="0" bgcolor="#efefef" align="center">
                        <tr>
                        <td align="left" style="padding:0;Margin:0;padding-top:40px;padding-left:40px;padding-right:40px">
                        <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td valign="top" align="center" style="padding:0;Margin:0;width:520px">
                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td style="padding:0;Margin:0;font-size:0px" align="center"><img class="adapt-img" src="https://djfpde.stripocdn.email/content/guids/CABINET_d8f09f812b54388305c4c22c6ef90c7b17c1f2c75e667f151fd184e28d7ebe28/images/logoblacknobg.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="275"></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        <tr>
                        <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:40px;padding-right:40px">
                        <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td valign="top" align="center" style="padding:0;Margin:0;width:520px">
                        <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#fafafa;border-radius:10px" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fafafa" role="presentation">
                        <tr>
                        <td align="left" style="padding:20px;Margin:0"><h3 style="Margin:0;line-height:34px;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;font-size:28px;font-style:normal;font-weight:bold;color:#2D3142">Welcome,&nbsp;${userExists[0].name}</h3><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:27px;color:#2D3142;font-size:18px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:27px;color:#2D3142;font-size:18px">Here is your OTP code, please <strong>DO NOT SHARE WITH ANYONE</strong><br></p></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table>
                        <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                        <tr>
                        <td align="center" style="padding:0;Margin:0">
                        <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#efefef" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#EFEFEF;width:600px">
                        <tr>
                        <td align="left" style="Margin:0;padding-top:30px;padding-bottom:40px;padding-left:40px;padding-right:40px">
                        <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td valign="top" align="center" style="padding:0;Margin:0;width:520px">
                        <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:50px;background-color:#e71e0a" width="100%" cellspacing="0" cellpadding="0" bgcolor="#e71e0a" role="presentation">
                        <tr>
                        <td style="padding:0;Margin:0;border-radius:5rem" bgcolor="#c01d17" align="center"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'courier new', courier, 'lucida sans typewriter', 'lucida typewriter', monospace;line-height:59px;color:#ffffff;font-size:39px">${otpCode}</p></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        <tr>
                        <td align="left" style="padding:0;Margin:0;padding-left:40px;padding-right:40px">
                        <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td valign="top" align="center" style="padding:0;Margin:0;width:520px">
                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:27px;color:#2D3142;font-size:18px">Thanks,<br><br>Noap team</p></td>
                        </tr>
                        <tr>
                        <td style="padding:0;Margin:0;padding-bottom:20px;padding-top:40px;font-size:0" align="center">
                        <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td style="padding:0;Margin:0;border-bottom:1px solid #666666;background:unset;height:1px;width:100%;margin:0px"></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table>
                        <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                        <tr>
                        <td align="center" style="padding:0;Margin:0">
                        <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#EFEFEF;border-radius:0 0 20px 20px;width:600px" cellspacing="0" cellpadding="0" bgcolor="#efefef" align="center">
                        <tr>
                        <td class="esdev-adapt-off" align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:40px;padding-right:40px">
                        <table class="esdev-mso-table" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:520px">
                        <tr>
                        <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                        <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                        <tr>
                        <td valign="top" align="center" style="padding:0;Margin:0;width:47px">
                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        <td style="padding:0;Margin:0;width:20px"></td>
                        <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                        <table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                        <tr>
                        <td valign="top" align="center" style="padding:0;Margin:0;width:453px">
                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:24px;color:#2D3142;font-size:16px">This code expire in 1 hour.</p></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table>
                        <table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                        <td align="center" style="padding:0;Margin:0">
                        <table class="es-footer-body" cellspacing="0" cellpadding="0" bgcolor="#bcb8b1" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                        <tr>
                        <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-bottom:30px;padding-top:40px">
                        <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td align="left" style="padding:0;Margin:0;width:560px">
                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                        <td class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:20px;font-size:0px" align="center"><img src="https://djfpde.stripocdn.email/content/guids/CABINET_d8f09f812b54388305c4c22c6ef90c7b17c1f2c75e667f151fd184e28d7ebe28/images/logoblacknobg.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px" title="Logo" height="57"></td>
                        </tr>
                        <tr>
                        <td align="center" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:21px;color:#2D3142;font-size:14px">Copyright © 2023 Noap</p></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table></td>
                        </tr>
                        </table>
                        </div>
                        </body>
                        </html>
                    `
                }

                transporter.sendMail(message, (error, info) => {
                    if(error) res.status(400).json({ message: err});
                    console.log(info);
                });

                res.status(200).json({
                    message: 'Email sent!',
                    userId: userExists[0]._id
                });
            }
            else if(findOtp.length === 5) {
                 res.status(400).json({
                    message: 'Maximum number of otp codes exceeded, please verify your email!',
                });
            }
            else res.status(400).json({
                message: 'Wait at least a 2 minutes to send another email!',
                spam: findOtp[findOtp.length -1].spam
            });
            
        } catch (err) {
            console.log(err);
            res.status(400).json({message: err});
        }
    },
    async verifyOtp(res, req) {
        try {
            const {otp, userId} = res.body;
            
            const findOtp = await Otp.find({userId});
            
            if(findOtp.length === 0) return req.status(400).json({ message: "Wrong OTP code, please try again!"});
            
            const compareOTPs = await bcrypt.compare(
                otp,
                findOtp[findOtp.length - 1].otp
            );

            if(compareOTPs && findOtp[findOtp.length - 1].expiresAt > Date.now()) {
                if(findOtp.length > 1) await Otp.deleteMany({
                    userId,
                    id: findOtp.map(val => val._id)
                });
                else await Otp.findByIdAndDelete(findOtp[0]._id);

                return req.status(200).json({ message: "Verified!"});
            }
            else return req.status(400).json({ message: "Wrong OTP code, please try again!"});
        } catch (err) {
           console.log(err); 
           req.status(400).json({message: err});
        }
    }
}