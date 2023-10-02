import bcrypt from "bcryptjs";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import nodemailer from "nodemailer";
import DeviceDetector from "node-device-detector";
import emojiFlags from 'emoji-flags';
import axios from "axios";

import User from "../models/User.js";
import Otp from "../models/OTP.js";
import TFA from "../models/TFA.js";
import Session from "../models/Session.js";
import "dotenv/config";

import mailHTML from "../dataset/mailHTML.js";

const transporter = nodemailer.createTransport({
    service: "FastMail",
    auth: {
        user: process.env.HOST_MAIL,
        pass: process.env.HOST_MAIL_PASSWORD
    }
});

const SEVEN_DAYS_IN_MS = 604800000;

export default {
    async add(req, res) {
        try {
            const { name, email, password } = req.body;
            const userExists = await User.find({ email });

            if(userExists.length > 0) return res.status(400).json({ message: 'User already exists, please sign in!' });

            const hashedPassword = await bcrypt.hash(password, 10);
            
            await User.create({ 
                email, 
                password: hashedPassword, 
                name,
                settings: { 
                    noteTextExpanded: true,
                    theme: 'dark',
                }
            });

            res.status(200).json({ message: 'User created successfully!' });
        } catch (err) {
            res.status(400).json({ message: err });
        }
    },
    async login(req , res) {
        try {
            const { email, password, identifier } = req.body;
            const userAgent = req.headers['user-agent'];

            if(!userAgent || !identifier) {
                return res.status(401).json({ message: 'Invalid request!' });
            }

            const getUser = await User.find({ email });
            let TFAEnabled = false;

            if(!getUser.length) {
                return res.status(400).json({ message: 'Wrong email or password combination!' });
            }

            const device = new DeviceDetector({
                clientIndexes: true,
                deviceIndexes: true,
                deviceAliasCode: false
            });        

            const { 
                os: { name: osName, platform },
                client: { type, name: browserName, version },
                device: deviceInfo
            } = device.detect(userAgent);

            const {
                data: {
                    country_name,
                    country_code2,
                    state_prov,
                    city
                } 
            } = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_KEY}&ip=${identifier}`);
            
            const { _id, name, TFAStatus, settings, theme } = getUser[0];

            if(TFAStatus) {
                const TFAStatus = await TFA.find({ _id: getUser[0]?.TFAStatus });

                TFAEnabled = TFAStatus[0].verified;
            }

            const passwordDB = getUser[0].password;
            const comparePasswords = await bcrypt.compare(password, passwordDB);

            if(comparePasswords) {
                const payload = {
                    iss: "login-form",
                    sub: { _id, name, googleAccount: false },
                    exp: Math.floor((Date.now() / 1000) + SEVEN_DAYS_IN_MS),
                };

                const token = jwt.sign(
                    payload, 
                    process.env.SECRET, 
                    { algorithm: 'HS512' }
                );

                await Session.create({
                    userId: _id,
                    token,
                    expAt: Math.floor((Date.now() / 1000) + SEVEN_DAYS_IN_MS),
                    ip: identifier,
                    browserData: `${browserName} - ${version}`,
                    location: `${city}, ${state_prov}, ${country_name}`,
                    countryFlag: emojiFlags.countryCode(country_code2).emoji,
                    clientData: `${type}, ${osName} ${platform}`,
                    deviceData: deviceInfo,
                });

                return res.status(200).json({ 
                    token, 
                    _id, 
                    name, 
                    TFAEnabled, 
                    settings,
                });
            }

            return res.status(404).json({ message: 'Wrong email or password combination!' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err });
        }
    },
    async googleLogin(req , res) {
        try {
            const { email, name, id, identifier } = req.body;
            const userAgent = req.headers['user-agent'];

            if(!userAgent || !identifier) {
                console.log(identifier, userAgent);
                return res.status(401).json({ message: 'Invalid request!' });
            }

            const getUser = await User.find({ email });
            let TFAEnabled = false;

            if(!getUser.length) {
                await User.create({ 
                    name, 
                    email, 
                    googleId: id, 
                    googleAccount: true,
                    settings: {
                        noteTextExpanded: true,
                        theme: 'dark',
                    }
                });

                const [ user ] = await User.find({ email }); //waiting to get the id generated by mongodb
                const { _id, googleAccount, TFAStatus, settings, theme } = user;

                const device = new DeviceDetector({
                    clientIndexes: true,
                    deviceIndexes: true,
                    deviceAliasCode: false
                });        
    
                if(TFAStatus) {
                    const TFAStatus = await TFA.find({ _id: getUser[0]?.TFAStatus });

                    TFAEnabled = TFAStatus[0].verified;
                }

                const payload = { 
                    iss: "login-form", 
                    sub: { _id, name, googleAccount }, 
                    exp: Math.floor(Date.now() / 1000 + SEVEN_DAYS_IN_MS) 
                };

                const token = jwt.sign(
                    payload,
                    process.env.SECRET,
                    { algorithm: 'HS512' }
                );

                const { 
                    os: { name: osName, platform },
                    client: { type, name: browserName, version },
                    device: deviceInfo
                } = device.detect(userAgent);
    
                const {
                    data: {
                        country_name,
                        country_code2,
                        state_prov,
                        city
                    } 
                } = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_KEY}&ip=${identifier}`);


                await Session.create({
                    userId: _id,
                    token,
                    expAt: Math.floor((Date.now() / 1000) + SEVEN_DAYS_IN_MS),
                    ip: identifier,
                    browserData: `${browserName} - ${version}`,
                    location: `${city}, ${state_prov}, ${country_name}`,
                    countryFlag: emojiFlags.countryCode(country_code2).emoji,
                    clientData: `${type}, ${osName} ${platform}`,
                    deviceData: deviceInfo,
                });

                return res.status(200).json({ 
                    message: 'Success', 
                    token, 
                    _id, 
                    name, 
                    googleAccount, 
                    TFAEnabled, 
                    settings
                });
            }
            else if(!getUser[0]?.googleAccount) {
                return res.status(400).json({ message: 'User already exists, please sign in using your email and password!' });
            }
            else {
                const { _id, googleAccount, TFAStatus, settings } = getUser[0];

                if(TFAStatus) {
                    const TFAStatus = await TFA.find({ _id: getUser[0]?.TFAStatus });

                    TFAEnabled = TFAStatus[0].verified;
                }

                const payload = { 
                    iss: "login-form", 
                    sub: { _id, name, googleAccount }, 
                    exp: Math.floor(Date.now() / 1000 + SEVEN_DAYS_IN_MS) 
                };

                const token = jwt.sign( 
                    payload, 
                    process.env.SECRET, 
                    { algorithm: 'HS512' }
                );

                const device = new DeviceDetector({
                    clientIndexes: true,
                    deviceIndexes: true,
                    deviceAliasCode: false
                });        
    
                const { 
                    os: { name: osName, platform },
                    client: { type, name: browserName, version },
                    device: deviceInfo
                } = device.detect(userAgent);
    
                const {
                    data: {
                        country_name,
                        country_code2,
                        state_prov,
                        city
                    } 
                } = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_KEY}&ip=${identifier}`);


                await Session.create({
                    userId: _id,
                    token,
                    expAt: Math.floor((Date.now() / 1000) + SEVEN_DAYS_IN_MS),
                    ip: identifier,
                    browserData: `${browserName} - ${version}`,
                    location: `${city}, ${state_prov}, ${country_name}`,
                    countryFlag: emojiFlags.countryCode(country_code2).emoji,
                    clientData: `${type}, ${osName} ${platform}`,
                    deviceData: deviceInfo,
                });

                return res.status(200).json({ 
                    message: 'Success', 
                    token, 
                    _id, 
                    name, 
                    googleAccount, 
                    TFAEnabled,
                    settings 
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: err });
        }
    },
    async verifyIfTokenIsValid(req , res) {
        try {
            const { token, identifier } = req.body;
            const { sub } = jwt.decode(token);

            const findUser = await User.findById(sub._id);
            const sessions = await Session.find({ userId: sub._id });
            
            if(!sessions.length) {
                return res.status(401).json({ message: "Access denied, sign in again"});
            }
            
            const matchingSession = sessions.find((session) => session.token === token);
            const verifySessionIp = matchingSession ? identifier: false;

            if((matchingSession && !verifySessionIp) || !matchingSession) {
                return res.status(401).json({ message: "Access denied, sign in again" }); 
            }

            const userDataObj = {
                ...sub,
                TFAEnabled: findUser.TFAStatus ? true : false,
                settings: { ...findUser.settings }
            };

            return res.status(200).json(userDataObj);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err });
        }
    },
    async removeUserSession(req , res) {
        try {
            const { token, sessionId } = req.body;
            const { sub } = jwt.decode(token);

            const sessions = await Session.find({ userId: sub._id });
            const matchingSession = sessions.find((session) => session.token === token);

            if(!matchingSession) {
                return res.status(500).json({ message: "Unable to find session!" });
            }

            await Session.remove({ _id: sessionId });
            return res.status(200).json({ message: "Session was terminated successfully!" });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err });
        }
    },
    async removeAllActiveSessions(req , res) {
        try {
            const { token, identifier } = req.body;
            const { sub } = jwt.decode(token);

            const sessions = await Session.find({ userId: sub._id });
            const matchingSession = sessions.find((session) => session.token === token);

            if(!matchingSession) {
                return res.status(500).json({ message: "Unable to find session!" });
            }

            const verifySessionIp = matchingSession ? await bcrypt.compare(identifier, matchingSession.ip): false;

            if((matchingSession && !verifySessionIp) || !matchingSession) {
                return res.status(401).json({ message: "Access denied, sign in again" });
            }

            await Session.remove({});
            return res.status(200).json({ 
                message: "All sessions (including yours), were terminated, please sign in again!" 
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err });
        }
    },
    async signOutUser(req , res) {
        try {
            const { userId, token } = req.body;

            const sessions = await Session.find({ userId });
            const matchingSession = sessions.find((session) => session.token === token);

            if(!matchingSession) {
                return res.status(500).json({ message: "Unable to find session!" });
            }

            await Session.deleteOne({ userId, token });
            return res.status(200).json({ message: "Success" });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err });
        }
    },
    async convertIntoNormalAccount(req , res) {
        try {
            const { _id, password } = req.body;
            const getUser = await User.find({ _id });

            if(getUser.length === 0) res.status(400).json({ message: 'User not found!' });

            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                await User.findOneAndUpdate({ _id }, { 
                    password: hashedPassword, 
                    googleAccount: false 
                });

                res.status(200).json({ message: 'Account was converted, please sign in again!' });
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err });
        }
    },
    async convertIntoGoogleAccount(req , res) {
        try {
            const { _id, email, name, id } = req.body;
            const getUser = await User.find({ _id });

            if(getUser.length === 0) res.status(400).json({ message: 'User not found!' });

            else {
                const userAlreadyExist = await User.find({ email });

                if(userAlreadyExist.length > 0 
                    && !userAlreadyExist[0].googleAccount 
                    && userAlreadyExist[0].email !== getUser[0].email
                ) return res.status(400).json({ message: 'User already exists!' });

                await User.findOneAndUpdate({ _id }, { 
                    password: null, 
                    googleAccount: true, 
                    googleId: id, 
                    name, 
                    email 
                });

                res.status(200).json({ message: 'Google account was linked, please sign in again!' });
            }
        } catch (err) {
            res.status(400).json({ message: err });
        }
    },
    async verifyUser(req, res) {
        try {
            const { password, _id } = req.body;
            const findUser = await User.findById({ _id });

            if(!findUser?._id) return res.status(400).json({ message: 'User not found!' });

            const userPassDB = findUser.password;
            const comparePass = await bcrypt.compare( password, userPassDB );

            if(comparePass) res.status(200).json({ message: 'Authenticated' });
            else res.status(400).json({ message: 'Wrong password, please try again!' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'User not authenticated' });
        }
    },
    async changePassword(res, req) {
        try {
            const { userId, password } = res.body;
            const getUser = await User.find({ _id: userId });
            
            if(getUser.length === 0) return req.status(400).json({ message: 'User not found, please try again or later!' });

            const hashedPass = await bcrypt.hash(password, 10);
            await User.findOneAndUpdate({ _id: userId }, { password: hashedPass });

            req.status(200).json({ message: 'Password changed!'});
        } catch (err) {
           req.status(400).json({ message: err });
        }
    },
    async findAndSendCode(req, res) {
        try {
            const { email, remove2FA } = req.body;
            const userExists = await User.find({ email });

            if(userExists.length === 0) return res.status(400).json({
                message: 'No users were found with this email address!', 
                code: 1
            });

            const { _id, name, email: userMail, TFAStatus } = userExists[0];

            if(TFAStatus && remove2FA !== "2fa") {
                const getTFAData = await TFA.findById({ _id: TFAStatus });
                if(getTFAData?.options.useToResetPass) return res.status(200).json({ code: 5, userId: _id });
            }

            if(!TFAStatus && remove2FA === "2fa") {
                return res.status(400).json({ message: "This account doesn't have 2FA enabled!" });
            }

            const findOtp = await Otp.find({ userId: _id });
            const lastOtpDate = findOtp[findOtp.length - 1]?.createdAt;

            if(findOtp.length !== 0 && lastOtpDate.setDate(lastOtpDate.getDate() + 1) <= new Date) {
                await Otp.deleteMany({ userId: _id, id: findOtp.map(val => val._id) }); //removing all otps after 24 hours
            }

            if(findOtp.length === 0 || (findOtp.length < 5 && findOtp[findOtp.length - 1].spam < Date.now())) {
                const otpCode = `${Math.floor(1000 + Math.random() * 9000)}`;
                const hashedOtp = await bcrypt.hash(otpCode, 10);

                const message = {
                    from: process.env.HOST_MAIL,
                    to: userMail,
                    subject: 'OTP code verification',
                    html: mailHTML(otpCode, name)
                }

                transporter.sendMail(message, async (error) => {
                    if(error) res.status(500).json({ message: "Internal sever error, please try again or later", code: 2 });
                    else {
                        await Otp.create({
                            userId: _id,
                            otp: hashedOtp,
                            expiresAt: Date.now() + 3600000, //expires after 1 hour
                            spam: Date.now() + 120000 //adding spam protection of 2 minutes per email
                        });

                        res.status(200).json({ message: 'Email sent!', userId: _id });
                    }
                });
            }

            //if the user sent 5 emails and didn't verified the otp, then the user isn't allowed to sent more emails
            else if(findOtp.length === 5) {
                res.status(400).json({ 
                    message: 'Maximum number of otp codes exceeded, please try again after 24 hours!', 
                    code: 3
                });
            }
            else res.status(400).json({ 
                message: 'Wait at least a 2 minutes to send another email!', 
                spam: findOtp[findOtp.length -1].spam, 
                code: 4 
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err });
        }
    },
    async verifyOtp(res, req) {
        try {
            const { otp, userId } = res.body;
            const findOtp = await Otp.find({ userId });

            if(findOtp.length === 0) return req.status(400).json({ message: "Wrong OTP code, please try again!"});
            const compareOTPs = await bcrypt.compare(otp, findOtp[findOtp.length - 1].otp);

            if(compareOTPs && findOtp[findOtp.length - 1].expiresAt > Date.now()) {
                if(findOtp.length > 1) await Otp.deleteMany({ userId, id: findOtp.map(val => val._id)});
                else await Otp.findByIdAndDelete(findOtp[0]._id);

                return req.status(200).json({ message: "Verified!" });
            }
            else return req.status(400).json({ message: "Wrong OTP code, please try again!"});
        } catch (err) {
           req.status(400).json({ message: err });
        }
    },
    async generate2FAQrcode(res, req) {
        try {
            const { userId } = res.body;

            const getQrcodes = await TFA.find({ userId });

            if(getQrcodes.length > 0) return req.status(200).json(getQrcodes[0].qrcode);

            const secret = speakeasy.generateSecret({ name: "Noap" });

            qrcode.toDataURL(secret.otpauth_url, async (err, data) => {
                if(err) req.status(400).json({ message: "Error generating QR code, please try again or later" });

                await TFA.create({
                    qrcode: data,
                    userId,
                    secret: secret.base32,
                    options: { useToResetPass: true },
                    verified: false
                });

                const [ doc ] = await TFA.find({ userId }); //getting the id of the created TFA document
                await User.findOneAndUpdate({ _id: userId }, { TFAStatus: doc._id });

                return req.status(200).json(data);
            });

        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
    async verify2FAcode(res, req) {
        try {
            const { userId, TFACode } = res.body;
            const getTFA = await TFA.find({ userId });

            const isAValidTFACode = speakeasy.totp.verify({
                secret: getTFA[0]?.secret,
                encoding: "base32",
                token: TFACode
            });

            if(isAValidTFACode) {
                await TFA.findByIdAndUpdate({ _id: getTFA[0]._id }, { verified: true });
                return req.status(200).json({ message: "Verified!" });
            }

            return req.status(400).json({ message: "Wrong code, please try again" });
        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
    async remove2FA(res, req) {
        try {
            const { userId } = res.body;

            const getTFA = await TFA.find({ userId });

            if(getTFA.length === 0) return req.status(400).json({ message: "This account doesn't have 2FA enabled!" });

            await TFA.remove({ _id: getTFA[0]._id });
            await User.findByIdAndUpdate({ _id: getTFA[0].userId }, { TFAStatus: undefined });

            return req.status(200).json({ message: "2FA removed successfuly!" });
        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
    async showPinnedNotesInFolder(res, req) {
        try {
            const { id } = res.params;
            const { condition } = res.body;

            const getUserData = await User.findById(id);

            await User.findByIdAndUpdate({ _id: id }, {
                settings: {
                    ...getUserData.settings,
                    showPinnedNotesInFolder: condition
                }
            });

            return req.status(200).json({ message: "Updated!" });
        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
    async noteTextExpandedOrCondensed(res, req) {
        try {
            const { id } = res.params;
            const { condition } = res.body;

            const getUserData = await User.findById(id);

            await User.findByIdAndUpdate({ _id: id }, {
                settings: {
                    ...getUserData.settings,
                    noteTextExpanded: condition
                }
            });

            return req.status(200).json({ message: "Updated!" });
        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
    async changeAppTheme(res, req) {
        try {
            const { id } = res.params;
            const { theme } = res.body;

            const getUserData = await User.findById(id);

            await User.findByIdAndUpdate({ _id: id }, {
                settings: {
                    ...getUserData.settings,
                    theme
                }
            });

            return req.status(200).json({ message: "Updated!" });
        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
    async changeGlobalNoteBackgroundColor(res, req) {
        try {
            const { id } = res.params;
            const { globalNoteBackgroundColor } = res.body;

            const getUserData = await User.findById(id);

            await User.findByIdAndUpdate({ _id: id }, {
                settings: {
                    ...getUserData.settings,
                    globalNoteBackgroundColor: globalNoteBackgroundColor
                }
            });

            return req.status(200).json({ message: "Updated!" });
        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
    async changeNoteVisualization(res, req) {
        try {
            const { id } = res.params;
            const { visualization } = res.body;

            const getUserData = await User.findById(id);

            await User.findByIdAndUpdate({ _id: id }, {
                settings: {
                    ...getUserData.settings,
                    noteVisualization: visualization
                }
            });

            return req.status(200).json({ message: "Updated!" })
        } catch (err) {
            console.log(err);
            req.status(400).json({ message: err });
        }
    },
}
