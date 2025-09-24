"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    secret;
    constructor(secret) {
        this.secret = secret;
    }
    sign(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, { expiresIn: "1h" });
    }
}
exports.JwtService = JwtService;
