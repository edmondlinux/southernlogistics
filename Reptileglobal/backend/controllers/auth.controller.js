import User from "../models/user.model.js";

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email, role: "admin" });

		if (user && (await user.comparePassword(password))) {
			// Set simple session cookie
			res.cookie("userId", user._id.toString(), {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			});

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			});
		} else {
			res.status(400).json({ message: "Invalid admin credentials" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		res.clearCookie("userId");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};