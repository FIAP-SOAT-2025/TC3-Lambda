"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.JwtService = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var JwtService = /** @class */ (function () {
    function JwtService(secret) {
        this.secret = secret;
    }
    JwtService.prototype.sign = function (payload) {
        return jsonwebtoken_1["default"].sign(payload, this.secret, { expiresIn: "1h" });
    };
    JwtService.prototype.verify = function (token) {
        return jsonwebtoken_1["default"].verify(token, this.secret);
    };
    return JwtService;
}());
exports.JwtService = JwtService;
