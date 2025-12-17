import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from "../utils/jwt";
import { AppError } from "../middlewares/error";

export const authService = {
  async signup(name: string, email: string, password: string, role: string = "student") {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(409, "USER_EXISTS", "User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    const storedToken = await RefreshToken.findOne({ token, revoked: false });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token");
    }

    // Revoke old token
    storedToken.revoked = true;
    await storedToken.save();

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return { accessToken, refreshToken };
  },

  async logout(token: string) {
    await RefreshToken.updateOne({ token }, { revoked: true });
  },

  async getMe(userId: string) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }
    return user;
  },
};
