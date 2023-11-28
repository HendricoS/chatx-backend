const { expect } = require("chai");
const sinon = require("sinon");

// Import middleware functions to be tested
const middleware = require("../middleware/middleware");

// Mock User model
const User = require("../models/userModel");

describe("Middleware Tests", () => {
  describe("checkJWTToken", () => {
    it("should return 401 if token is missing", () => {
      // Arrange
      const req = { header: () => null };
      const res = {
        status: (code) => ({ json: (data) => ({ code, data }) }),
      };
      const next = () => {};

      // Act
      const result = middleware.checkJWTToken(req, res, next);

      // Assert
      expect(result.code).to.equal(401);
      expect(result.data.message).to.equal("Unauthorized: Missing token");
    });

    it("should return 401 if token is invalid", () => {
      // Arrange
      const req = { header: () => "invalid_token" };
      const res = {
        status: (code) => ({ json: (data) => ({ code, data }) }),
      };
      const next = () => {};

      // Act
      const result = middleware.checkJWTToken(req, res, next);

      // Assert
      expect(result.code).to.equal(401);
      expect(result.data.message).to.equal("Unauthorized: Invalid token");
    });
  });

  describe("checkUsernameDomain", () => {
    it("should call next if username has valid domain", () => {
      // Arrange
      const req = { body: { username: "user@gmail.com" } };
      const res = { status: () => {}, json: () => {} };
      const next = sinon.spy();

      // Act
      middleware.checkUsernameDomain(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
    });
  });

  describe("checkContentType", () => {
    it("should call next if content type is valid", () => {
      // Arrange
      const req = { get: () => "application/json" };
      const res = { status: () => {}, json: () => {} };
      const next = sinon.spy();

      // Act
      middleware.checkContentType(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
    });
  });
});
